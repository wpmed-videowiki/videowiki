import { rateLimit } from 'express-rate-limit'
import controller from './controller';
import isAuthenticated from '../shared/middlewares/isAuthenticated';
import { saveTemplate } from '../shared/middlewares/saveTemplate';
import { uploadFileToWikiCommons } from '../shared/middlewares/wikiUpload';
import { checkEditableArticle } from '../shared/middlewares/checkEditableArticle';
import uploadLocal from '../shared/middlewares/uploadLocal';

const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 12, // limit each IP to 10 requests per windowMs
  standardHeaders: 'draft-7',
})

const summaryRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 12, // limit each IP to 10 requests per windowMs
  standardHeaders: 'draft-7',
})

const mount = function(router) {
  // ========== Search
  router.get('/search', searchRateLimiter, controller.searchWikiArticles);

  router.get('/wikimediaCommons/images', searchRateLimiter, controller.searchWikiCommonsImages);
  router.get('/wikimediaCommons/gifs', searchRateLimiter, controller.searchWikiCommonsGifs);
  router.get('/wikimediaCommons/videos', searchRateLimiter, controller.searchWikiCommonsVideos)
  router.get('/wikimediaCommons/categories', searchRateLimiter, controller.searchWikiCommonsCategories);

  // ============== upload image url to slide
  router.post('/article/imageUpload', checkEditableArticle, controller.uploadImageURLToSlide);

  // ============== Upload media to slide
  // uploadFileToWikiCommons  ==========> PRODUCTION
  router.post('/article/uploadCommons', isAuthenticated, checkEditableArticle, saveTemplate, uploadFileToWikiCommons, controller.uploadImageToCommonsSlide);

   // ============== Upload media to locally temporarly slide
  router.post('/article/uploadTemp', isAuthenticated, uploadLocal, controller.uploadTempFile);

  // ============== Fetch VideoWiki article by title
  router.get('/article', controller.getArticleByTitle);

  // ============== Fetch article summary by title
  router.get('/article/summary', summaryRateLimiter, controller.getArticleSummaryByTitle);

  // ============== Convert wiki to video wiki
  router.get('/convert', controller.convertWikiToVideowiki);

  router.get('/updateArticle', controller.updateVideowikiArticle);
  // ================ Get infobox
  router.get('/infobox', summaryRateLimiter, controller.getArticleInfobox);

  // ============== Get commons video url by it's name
  router.post('/commons/video_by_name', controller.getVideoByName);

  // ============== Get wiki content
  router.get('/', controller.getWikiContent);

  router.get('/forms', isAuthenticated, controller.getUserUploadForms);
  return router;
}

export default {
  mount,
};

const config = require('../shared/config');
