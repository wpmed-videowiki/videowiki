import { Article } from '../shared/models'
import { isNonTTSLanguage } from './utils';
import { SUPPORTED_TTS_LANGS } from '../shared/constants';

const middlewares = {
  validateNonTTSArticle(req, res, next) {
    const { title, wikiSource } = req.body;
    Article.findOne({ title, wikiSource, published: true }).then((article) => {
      if (!article) {
        return res.status(400).send('Invalid article title/wikiSource');
      }

      if (!isNonTTSLanguage(article.lang)) {
        return res.status(400).send(`This feature is enabled only on no-tts languages videowiki's, supported langs are ${SUPPORTED_TTS_LANGS.join(', ')}`)
      }
      return next();
    })
    .catch(err => {
      if (err) {
        console.log(err);
        return res.status(400).send('Something went wrong');
      }
    })
  },
};

export default middlewares;
