import { useEffect } from "react";
import { Grid } from "semantic-ui-react";

import ArticleCard from "./ArticleCard";
import StateRenderer from "../common/StateRenderer";

import { categories } from "./HardCodedArticles";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { fetchTopArticles } from "../../slices/articleSlice";

const TopArticles = () => {
  const dispatch = useAppDispatch();
  const { language } = useAppSelector((state) => state.ui);
  const { topArticles, topArticlesState } = useAppSelector(
    (state) => state.article
  );
  useEffect(() => {
    dispatch(fetchTopArticles());
  }, []);

  const _renderArticles = (titles) => {
    if (!topArticles) return null;
    const titlesStrings = titles.map((t) => t.title);
    return topArticles
      .sort(
        (a, b) =>
          titlesStrings.indexOf(a.title) - titlesStrings.indexOf(b.title)
      )
      .map((article) => {
        const { image, title, _id, wikiSource, ns } = article;
        const url = `/${language}/videowiki/${title}?wikiSource=${wikiSource}`;
        const titleItem = titles.find((title) => title.title === article.title);
        if (!titles.some((title) => title.title === article.title)) {
          return false;
        }
        return (
          <Grid.Column computer={3} tablet={5} mobile={16} key={_id}>
            <ArticleCard
              url={url}
              image={(titleItem && titleItem.image) || image}
              title={(titleItem && titleItem.renderedTitle) || title}
              ns={ns || 0}
            />
          </Grid.Column>
        );
      });
  };

  const _render = () => {
    const langCategories = categories[language];
    if (!langCategories) return null;

    return (
      <div className="c-app-card-layout home">
        <Grid>
          {langCategories.map((item, index) => (
            <Grid.Row key={index}>
              <h2 className="section-title">{item.category}</h2>
              {_renderArticles(item.titles)}
            </Grid.Row>
          ))}
        </Grid>
      </div>
    );
  };

  return (
    <StateRenderer
      loaderDisabled={true}
      componentState={topArticlesState}
      loaderImage="/img/view-loader.gif"
      loaderMessage="Loading your article from the sum of all human knowledge!"
      errorMessage="Error while loading articles! Please try again later!"
      onRender={() => _render()}
    />
  );
};

export default TopArticles;
