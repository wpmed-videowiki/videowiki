import { Article, Video as VideoModel, UploadFormTemplate as UploadFormTemplateModel, Humanvoice as HumanVoiceModel } from '../shared/models';
import { convertArticle, uploadConvertedToYoutube } from '../shared/services/exporter';
import { fetchArticleContributors, getCustomVideowikiSubpageName, getLanguageFromWikisource } from '../shared/services/wiki';
import moment from 'moment';

const lang = process.argv.slice(2)[1];

const controller = {
  getVideoById(req, res) {
    const { id } = req.params;

    VideoModel.findById(id).then((video) => {
      if (!video) {
        return res.status(400).send('Invalid video');
      }

      return res.json({ video });
    })
    .catch(err => {
      if (err) {
        return res.status(400).send('Something went wrong while fetching the video');
      }
    })
  },
  getVideoHistory(req, res) {
    const { title, wikiSource } = req.query;
    if (!title) {
      return res.status(400).send('Title is a required field');
    }
    const query = {
      title,
      status: 'uploaded',
    };
    // Wikisource is optional
    if (wikiSource) {
      query.wikiSource = wikiSource;
    }

    VideoModel.find(query)
    .sort({ created_at: -1 })
    .populate('article')
    .populate('formTemplate')
    .populate('user', 'username email')
    .exec().then((videos) => {
      return res.status(200).json({ videos });
    })
    .catch(err => {
      if (err) {
        return res.status(400).send('Something went wrong');
      }
    })
  },

  exportVideo(req, res) {
    // PROD
    const {
      title,
      wikiSource,
      humanvoiceId,
      fileTitle,
    } = req.body;

    const formValues = {
      title,
      wikiSource,
      description: title,
      categories: ['Category:Videowiki'],
      licence: 'cc-by-sa-3.0',
      source: 'others',
      sourceAuthors: `See [${wikiSource}/wiki/${title} script] and authors listed in details below.`,
      sourceUrl: `${process.env.HOST_URL}/${lang}/videowiki/${title}?wikiSource=${wikiSource}`,
      date: moment().format('YYYY-MM-DD'),
    }

    if (humanvoiceId) {
      formValues.fileTitle = fileTitle;
    } else {
      const lang = getLanguageFromWikisource(wikiSource);
      if (lang) {
        formValues.fileTitle = `${lang}.${title}`;
      } else {
        formValues.fileTitle = title;
      }
    }

    console.log('form values are', formValues);
    const errors = [];

    if (!title || !wikiSource) {
      return errors.push('Title and wiki source are required fields');
    }

    if (errors.length > 0) {
      return res.status(400).send(errors.join(', '))
    }

    Article.findOne({ title, wikiSource, published: true }).then((article) => {
      if (!article) {
        return res.status(400).send('Invalid article title or wiki source');
      }

      // allow normal articles with less than 50 slides to be converted
      if (article.ns === 0 && article.slides.length > 50) {
        return res.status(400).send('only custom articles and normal articles with less than 50 slides can be exported now')
      }

      // Create a form template
      UploadFormTemplateModel.create({
        title,
        wikiSource,
        user: req.user._id,
        form: formValues,
      }).then((formTemplate) => {

        const newVideo = {
          title,
          wikiSource,
          lang: article.lang,
          formTemplate: formTemplate._id,
          user: req.user._id,
          article: article._id,
          articleVersion: article.version,
        };

        // Check if there's a video already being converted for this article
        VideoModel.countDocuments({ title, wikiSource, status: { $in: ['queued', 'progress'] } }).then((count) => {

          if (count !== 0) {
            const message = 'This article is currently being converted. though We\'ve saved the form template for you to try later.';
            UploadFormTemplateModel.findByIdAndUpdate(formTemplate._id, { $set: { published: true } }).then(() => {}).catch(err => {});
            return res.status(400).send(message);
          }
          if (humanvoiceId) {
            HumanVoiceModel.findById(humanvoiceId).then((humanvoice) => {
              if (!humanvoice) {
                return res.status(400).send('Invalid human voice id provided');
              }
              VideoModel.create(newVideo).then((video) => {
                res.json({ video });
                VideoModel.findByIdAndUpdate(video._id, { $set: { lang: humanvoice.lang, humanvoice: humanvoiceId } }, { new: true }).then((newVideo) => {
                  return convertArticle({ videoId: video._id });
                })
                .catch(err => {
                  if (err) {
                    console.log('error updating video lang', err);
                  }
                })
                // If there's a human voice associated, change the language of the video document
              })
              .catch(err => {
                if (err) {
                  console.log('error creating new video', err);
                  return res.status(400).send('something went wrong');
                }
              })
              // Check to see if that version of the article has been exported before in the specified language of humanvoice
            })
            .catch(err => {
              if (err) {
                console.log('error finding human voice', err);
                return res.status(400).send('Something went wrong');
              }
            })
          } else {
            // Check to see if that version of the article has been exported before in the specified language
            VideoModel.countDocuments({ title, wikiSource, articleVersion: article.version, lang: article.lang, status: 'uploaded' }).then(( count) => {
              if (count === 0 || count === undefined) {
                VideoModel.create(newVideo).then((video) => {
                  res.json({ video });
                  return convertArticle({ videoId: video._id });
                  // If there's a human voice associated, change the language of the video document
                })
                .catch(err => {
                  if (err) {
                    console.log('error creating new video', err);
                    return res.status(400).send('something went wrong');
                  }
                })
              } else {
                return res.status(400).send('A video has already been exported for this version, please check the history page');
              }
            })
            .catch(err => {
              if (err) {
                console.log('error counting same version of videos', err);
                return res.status(400).send('Something went wrong');
              }
            })
          }
        })
        .catch(err => {
          if (err) {
            return res.status(400).send('Something went wrong, please try again');
          }
        })
      })
      .catch(err => {
        if (err) {
          console.log('error creating form template', err);
          return res.status(400).send('Something went wrong, please try again');
        }
      })

    })
    .catch(err => {
      if (err) {
        return res.status(400).send('Something went wrong');
      }
    })
  },

  retryYoutubeUpload(req, res) {
    const { id } = req.params;
    VideoModel.findById(id).then((video) => {
      if (video.youtubeVideoId) {
        return res.status(400).send('Video is already uploaded');
      }
      if (['queued', 'processing'].includes(video.youtubeUploadStatus)) {
        return res.status(400).send('Video is being uploaded');
      }
      uploadConvertedToYoutube(video._id);

      VideoModel.findByIdAndUpdate(video._id,
        { $set: { youtubeUploadStatus: 'queued', youtubeUploadRetries: 0 } },
      ).then((err) => {
          return res.json({ youtubeUploadStatus: 'queued' })
      })
      .catch(err => {
          if (err) {
            console.log(err);
          }
          return res.json({ youtubeUploadStatus: 'queued' })
      })
    })
    .catch(err => {
      if (err) {
        console.log(err);
        return res.status(400).send('Something went wrong');
      }
    })
  },

  getVideoByArticleTitle(req, res) {
    const { title, wikiSource, lang } = req.query;
    const searchQuery = { title: decodeURIComponent(title), commonsUrl: { $exists: true } };
    const articleQuery = { title: searchQuery.title, published: true };
    if (wikiSource) {
      searchQuery.wikiSource = wikiSource;
      articleQuery.wikiSource = wikiSource;
    }
    Article.findOne(articleQuery).then((article) => {
      if (!article) return res.status(400).send('Invalid article title');

      if (lang) {
        searchQuery.lang = lang;
      } else {
        searchQuery.lang = article.lang;
      }

      VideoModel.find(searchQuery)
      .sort({ version: -1 })
      .populate('formTemplate')
      .limit(1)
      .exec().then((videos) => {
        if (videos.length > 0) {
          return res.json({ video: videos[0] });
        }
        return res.json({ videos });
      })
      .catch(err => {
        if (err) return res.status(400).send('Something went wrong');
      })
    })
    .catch(err => {
      if (err) {
        console.log('error fetchign article by title', err);
        return res.status(400).send('Something went wrong');
      }
    })
  },

  getVideoByArticleId(req, res) {
    const { articleId } = req.params;
    const lang = req.query.lang;
    const searchQuery = { article: articleId, status: 'uploaded' };
    if (lang) {
      searchQuery.lang = lang;
    }
    VideoModel.findOne(searchQuery).then((video) => {
      if (video) {
        return res.json({ exported: true, video });
      }
      return res.json({ exported: false });
    })
    .catch(err => {
      if (err) {
        console.log(err);
        return res.status(400).send('Something went wrong');
      }
    })
  },
  getVideoByArticleVersion(req, res) {
    const { version } = req.params;
    const { title, wikiSource, lang } = req.query;

    VideoModel.findOne({ title, wikiSource, articleVersion: version, lang, status: 'uploaded' }).then((video) => {
      if (video) {
        return res.json({ exported: true, video });
      }
      return res.json({ exported: false });
    })
    .catch(err => {
      if (err) {
        console.log(err);
        return res.status(400).send('Something went wrong');
      }
    })
  },
};

export default controller;
