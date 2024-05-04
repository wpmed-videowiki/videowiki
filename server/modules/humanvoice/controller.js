import { Article as ArticleModel, Humanvoice as HumanVoiceModel } from '../shared/models';
// import mimeType from 'mime-types';
import { processHumanVoiceAudio } from '../shared/services/audio_processor';
// import VideoModel from '../../models/Video';
// import UploadFormTemplateModel from '../../models/UploadFormTemplate';
import uuidV4 from 'uuid/v4';
import { bucketName, url } from '../shared/config/aws';
import utils from './utils';
import { allowedAudioExtensions } from './config';
import { getRemoteFileDuration } from '../shared/utils/fileUtils'
// const args = process.argv.slice(2);
// const lang = args[1];

const humanvoiceController = {
  getHumanVoice(req, res) {
    const { title, wikiSource, lang } = req.query;
    if (!title || !wikiSource || !lang) {
      return res.status(400).send('title, wikiSource and lang are required');
    }
    HumanVoiceModel.findOne({ title, wikiSource, lang, user: req.user._id }).then((humanvoice) => {
      return res.json({ humanvoice });
    })
    .catch(err => {
      if (err) {
        console.log('error retrieving human voice', err);
        return res.status(400).send('Something went wrong');
      }
    })
  },

  addAudio(req, res) {
    if (!req.files || !req.files.file) return res.status(400).end('File is required');
    const file = req.files.file;
    const { title, wikiSource, position, lang, enableAudioProcessing } = req.body;
    ArticleModel.findOne({ title, wikiSource, published: true }).then((article) => {
      if (!article) {
        return res.status(400).end('Invalid article');
      }
      let fileExtension = file.path.split('.').pop();
      // if no file extension is available on the filename, set to webm as default
      if (file.path.split('.').length === 1) {
        fileExtension = 'wav';
      }
      if (allowedAudioExtensions.indexOf(fileExtension) === -1) {
        return res.status(400).send('Invalid file extension');
      }

      const filename = `humanvoice/humanvoice-${uuidV4()}.${fileExtension}`;
      utils
      .uploadS3File(bucketName, filename, file)
      .then((result) => {
        const audioURL = `${url}/${filename}`;
        getRemoteFileDuration(audioURL, (err, duration) => {
          if (err) {
            console.log('error getting audio url', err);
          }
          HumanVoiceModel.findOne({ title, wikiSource, lang, user: req.user._id }).then((humanvoice) => {
            if (!humanvoice) {
              const newHumanVoiceData = {
                title,
                wikiSource,
                lang,
                user: req.user._id,
                audios: [{
                  position,
                  audioURL,
                  Key: filename,
                  duration: duration ? duration * 1000 : 0,
                }],
                translatedSlides: [],
              };
              utils.createHumanVoice(title, wikiSource, newHumanVoiceData, (err, newHumanVoice) => {
                if (err) {
                  console.log('error saving new human voice', err);
                  return res.status(400).end('Something went wrong');
                }
                if (enableAudioProcessing) {
                  processHumanVoiceAudio({ humanvoiceId: newHumanVoice._id, audioPosition: position });
                }
                return res.json({ humanvoice: newHumanVoice, slideAudioInfo: { position, audioURL } });
              })
            } else {
              // If the position of the new audio was set before, delete the old audio from s3
              const replacedAudios = humanvoice.audios.filter((a) => Number(a.position) === Number(position));
              if (replacedAudios && replacedAudios.length > 0) {
                replacedAudios.forEach((audio) => utils.deleteAudioFromS3(bucketName, audio.Key));
              }
              const audios = humanvoice.audios.filter((a) => Number(a.position) !== Number(position));
              audios.push({ position, audioURL, Key: filename, duration: duration ? duration * 1000 : 0 });
              HumanVoiceModel.findByIdAndUpdate(humanvoice._id, { $set: { audios } }, { new: true }).then((newHumanVoice) => {
                if (enableAudioProcessing) {
                  processHumanVoiceAudio({ humanvoiceId: newHumanVoice._id, audioPosition: position });
                }
                return res.json({ humanvoice: newHumanVoice, slideAudioInfo: { position, audioURL } });
              })
              .catch(err => {
                if (err) {
                  console.log('error updating human voice', err);
                  return res.status(400).end('Something went wrong');
                }
              })
            }
          })
          .catch(err => {
            if (err) {
              console.log('error finding human voice', err);
              return res.status(400).end('Something went wrong');
            }
          })
        })
      })
      .catch((err) => {
        console.log('error uploading file', err);
        return res.status(400).end('Something went wrong');
      })
    })
    .catch(err => {
      if (err) {
        console.log('error fetching article ', err);
        return res.status(400).end('Something went wrong');
      }
    })
  },

  deleteAudio(req, res) {
    const { title, wikiSource, lang, position } = req.body;
    const userId = req.user._id;
    HumanVoiceModel.findOne({ title, wikiSource, lang, user: userId }).then((humanvoice) => {
      if (!humanvoice) return res.status(400).send('Invalid custom human voice');

      const deletedAudios = humanvoice.audios.filter((audio) => Number(audio.position) === Number(position));
      if (!deletedAudios || deletedAudios.length === 0) {
        return res.status(400).send('Invalid audio position');
      }
      HumanVoiceModel.findByIdAndUpdate(humanvoice._id, { $pull: { audios: { position } } }, { new: true }).then(() => {
        deletedAudios.forEach((audio) => utils.deleteAudioFromS3(bucketName, audio.Key));
        return res.json({ deletedAudio: deletedAudios[0] });
      })
      .catch(err => {
        if (err) {
          console.log(err);
          return res.status(400).send('Something went wrong')
        }
      })
    })
    .catch(err => {
      if (err) {
        console.log(err);
        return res.status(400).send('Something went wrong');
      }
    })
  },

  addTranslatedText(req, res) {
    const { title, wikiSource, lang, position, text } = req.body;
    const userId = req.user._id;
    const newSlide = { text, position: Number(position) };

    HumanVoiceModel.findOne({ title, wikiSource, lang, user: userId }).then((humanvoice) => {

      if (humanvoice) {
        const filteredTranslatedSlides = humanvoice.translatedSlides ? humanvoice.translatedSlides.filter((slide) => Number(slide.position) !== Number(newSlide.position)) : [];
        filteredTranslatedSlides.push(newSlide);
        HumanVoiceModel.findByIdAndUpdate(humanvoice._id, { $set: { translatedSlides: filteredTranslatedSlides } }, { new: true }).then((newHumanVoice) => {
          return res.json({ humanvoice: newHumanVoice, translatedTextInfo: newSlide })
        })
        .catch(err => {
          if (err) {
            console.log('error saving updated translated slides', err);
            return res.status(400).send('Something went wrong');
          }
        })
      } else {
        // Create a new human voice for the user
        const newHumanVoiceData = {
          title,
          wikiSource,
          lang,
          user: req.user._id,
          translatedSlides: [newSlide],
          audios: [],
        };
        utils.createHumanVoice(title, wikiSource, newHumanVoiceData, (err, newHumanVoice) => {
          if (err) {
            console.log('error saving new human voice', err);
            return res.status(400).send('Something went wrong');
          }
          return res.json({ humanvoice: newHumanVoice, translatedTextInfo: newSlide });
        })
      }
    })
    .catch(err => {
      if (err) {
        console.log('error fethcing human voice', err);
        return res.status(400).send('Something went wrong');
      }
    })
  },

}

export default humanvoiceController;
