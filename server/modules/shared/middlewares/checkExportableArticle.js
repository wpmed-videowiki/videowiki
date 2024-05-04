import { Article as ArticleModel } from '../models';

export function checkExportableArticle(req, res, next) {
  const { title, wikiSource } = req.body;
  ArticleModel.findOne({ title, wikiSource, published: true }).then((article) => {
    if (!article) {
      return res.status(400).send('Invalid article title or wikiSource');
    }
    if (article.ns !== 0 || article.slides.length < 50) {
      return next();
    }
    return res.status(400).send('Only custom articles or articles with less than 50 slides can be exported');
  })
  .catch(err => {
    if (err) {
      console.log('error fetching article while validating exportable', err);
      return res.status(400).send('Something went wrong');
    }
  })
}
