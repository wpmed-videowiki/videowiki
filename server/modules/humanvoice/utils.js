import AWS from 'aws-sdk';
import { accessKeyId, secretAccessKey } from './config';
import { Article, Humanvoice } from '../shared/models'

const S3 = new AWS.S3({
  signatureVersion: 'v4',
  region: 'us-east-1',
  accessKeyId,
  secretAccessKey,
})

function deleteAudioFromS3(Bucket, Key) {
  S3.deleteObject({
    Key,
    Bucket,
  }).promise()
  .then(() => {
  })
  .catch((err) => {
    console.log('error deleting audio', err);
  })
}

function uploadS3File(Bucket, Key, Body) {
  return S3.upload({
    Bucket,
    Key,
    Body,
  }).promise();
}

function createHumanVoice(title, wikiSource, values, callback = () => {}) {
  Article.findOne({ title, wikiSource, published: true }).then((article) => {
    if (!article) return callback(new Error('Invalid article'));
    const newHumanVoice = new Humanvoice({ ...values, originalSlides: article.slides });

    newHumanVoice.save().then(() => {
      return callback(null, newHumanVoice);
    })
    .catch(err => {
      if (err) return callback(err);
    })
  })
  .catch(err => {
    if (err) return callback(err);
  })
}
export default {
  deleteAudioFromS3,
  uploadS3File,
  createHumanVoice,
}
