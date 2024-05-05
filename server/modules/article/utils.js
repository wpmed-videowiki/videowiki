import mongoose from 'mongoose'
import { Article, User } from '../shared/models';
import { isCustomVideowikiScript, isMDwikiScript } from '../shared/services/article';
import { applyScriptMediaOnArticle } from '../wiki/utils';
import AWS from 'aws-sdk';
import moment from 'moment';
import { accessKeyId, secretAccessKey } from './config';
import { SUPPORTED_TTS_LANGS } from '../shared/constants';
import { notifySlideAudioChange } from '../shared/services/exporter';

const S3 = new AWS.S3({
  signatureVersion: 'v4',
  region: 'us-east-1',
  accessKeyId,
  secretAccessKey,
})

const async = require('async');

const publishArticle = function (title, wikiSource, editor, user, callback) {
  Article.findOneAndUpdate({ title, wikiSource, editor, published: false }, {
    $addToSet: { contributors: user },
  }, { new: true }).then((article) => {

    // Fetch the published article
    Article.findOne({ title, wikiSource, published: true }).then((publishedArticle) => {

      if (!publishedArticle) {
        return callback()
      }

      // check if the original artical version and fetched article version are same
      if (article.version !== publishedArticle.version) {
        // if different, someone else published before
        return callback('Someone else published the article before you! Please update your content on top of latest version!')
      }

      Article
        .findOneAndUpdate({ title, wikiSource, published: true, editor: 'videowiki-bot' }, { $set: { published: false } })
        .exec().then(() => {

          const clonedArticle = article
          clonedArticle._id = mongoose.Types.ObjectId()
          clonedArticle.isNew = true

          clonedArticle.published = true
          clonedArticle.draft = false
          clonedArticle.editor = 'videowiki-bot'
          clonedArticle.version = new Date().getTime()

          clonedArticle.save().then((err) => {
            callback()
          })
          .catch(err => {
              callback(err)
          })
        })
        .catch(err => {
          if (err) {
            return callback(err)
          }
        })
    })
    .catch(err => {
      if (err) {
        return callback(err)
      }
    })
  })
  .catch(err => {
    if (err) {
      return callback(err)
    }
  })
}

const applyScriptMediaOnArticleOnAllArticles = function() {
  Article.find({ published: true }).then((articles) => {
    const updateFunc = [];
    articles.forEach((article) => {
      if (isCustomVideowikiScript(article.title) || isMDwikiScript(article.wikiSource, article.title)) {
        updateFunc.push((cb) => {
          console.log('apply script media fro', article.title);
          applyScriptMediaOnArticle(article.title, article.wikiSource, () => {
            console.log('done ', article.title, article.wikiSource)
            return cb()
          })
        })
      }
    })
    async.parallelLimit(updateFunc, 3, () => {
      console.log('done all')
    })
  })
  .catch(err => {
    if (err) {
      console.log(err);
    }
  })
}

// applyScriptMediaOnArticleOnAllArticles();

const cloneArticle = function (title, editor, callback) {
  // Check if an article with the same editor and title exists
  Article.findOne({ title, editor, published: false }).then(( article) => {

    // Fetch the published article
    Article.findOne({ title, published: true }).then((publishedArticle) => {

      if (!publishedArticle) {
        return callback()
      }

      if (article) { // if yes,
        // check if the original artical version and fetched article version are same
        if (article.version === publishedArticle.version) {
          // if same, use this article
          return callback(null, article)
        }

        // clone the article and add to db
        const clonedArticle = publishedArticle
        clonedArticle._id = mongoose.Types.ObjectId()
        clonedArticle.isNew = true

        clonedArticle.published = false
        clonedArticle.draft = true
        clonedArticle.editor = editor

        clonedArticle.version = publishedArticle.version

        clonedArticle.save().then(() => {
          // if different, clone the article and replace
          Article
            .findOne({ title, editor, published: false, version: article.version })
            .remove()
            .exec()
            .then(() => {})
            .catch((err) => {
              console.log('error removing old article', err)
            })
          callback(null, clonedArticle)
        })
        .catch(err => {
            callback(err)
        })
      } else { // if no,
        // clone the article and add to db
        const clonedArticle = publishedArticle
        clonedArticle._id = mongoose.Types.ObjectId()
        clonedArticle.isNew = true

        clonedArticle.published = false
        clonedArticle.draft = true
        clonedArticle.editor = editor

        clonedArticle.version = publishedArticle.version

        clonedArticle.save().then((err) => {
          callback(null, clonedArticle)
        })
        .catch(err => {
          callback(err)
        })
      }
    })
    .catch(err => {
      if (err) {
        return callback(err)
      }
    })
  })
  .catch(err => {
    if (err) {
      return callback(err)
    }
  })
}

const fetchArticle = function (title, callback) {
  Article.findOneAndUpdate({ title, published: true }, { $inc: { reads: 1 } }).then((article) => {
    callback(null, article)
  })
  .catch(err => {
    if (err) {
      console.error(err)
      return callback(err)
    }
  })
}

const fetchArticleAndUpdateReads = function ({ title, wikiSource }, callback) {
  const query = {
    title,
    published: true,
  }
  if (wikiSource) {
    query.wikiSource = wikiSource;
  }

  Article.findOneAndUpdate(query, { $inc: { reads: 1 } }).then((article) => {

    callback(null, article)
  })
  .catch(err => {
    if (err) {
      console.error(err)
      return callback(err)
    }
  })
}

const updateMediaToSlide = function (title, wikiSource, slideNumber, editor, { mimetype, filepath }, callback) {
  Article.findOne({ title, wikiSource, editor }).then((article) => {
    if (article) {
      const mimetypeKey = `slides.${slideNumber}.mediaType`
      const filepathKey = `slides.${slideNumber}.media`

      // update slidesHtml slide media
      const mimetypeKeyHtml = `slidesHtml.${slideNumber}.mediaType`
      const filepathKeyHtml = `slidesHtml.${slideNumber}.media`

      Article.update({
        title,
        wikiSource,
        editor,
      }, {
        $set: {
          [mimetypeKey]: mimetype.split('/')[0],
          [filepathKey]: filepath,

          [mimetypeKeyHtml]: mimetype.split('/')[0],
          [filepathKeyHtml]: filepath,
        },
      }, (err) => {
        if (err) {
          console.error(err)
          return callback(err)
        }

        callback(null, 'Article Updated')
      })
    } else {
      const err = new Error('Article not found!')
      callback(err)
    }
  })
  .catch(err => {
    if (err) {
      console.error(err)
      return callback(err)
    }
  })
}

function deleteAudioFromS3(Bucket, Key) {
  S3.deleteObject({
    Key,
    Bucket,
  }).promise()
  .then((res) => {
    console.log(res);
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

function isNonTTSLanguage(lang) {
  return SUPPORTED_TTS_LANGS.indexOf(lang) === -1
}

function updateScriptPageWithAudioAction(userId, article, slideIndex, type) {
  User.findById(userId).select('username')
    .exec().then((userData) => {
      const slideSection = article.sections.find((s) => slideIndex >= s.slideStartPosition && slideIndex < s.slideStartPosition + s.numSlides);
      notifySlideAudioChange({ title: article.title, wikiSource: article.wikiSource, username: userData.username, sectionTitle: slideSection.title, type, date: moment().format('DD MMMM YYYY') });
    })
    .catch(err => {
      if (err) {
        return console.log('error fetching user data', err);
      }
    })
    ;
}

export {
  fetchArticle,
  applyScriptMediaOnArticleOnAllArticles,
  fetchArticleAndUpdateReads,
  updateMediaToSlide,
  cloneArticle,
  publishArticle,
  uploadS3File,
  deleteAudioFromS3,
  isNonTTSLanguage,
  updateScriptPageWithAudioAction,
}
