import { useCallback, useEffect, useState } from "react";
import { Grid, Loader } from "semantic-ui-react";

import ArticleCard from "./ArticleCard";

import StateRenderer from "../common/StateRenderer";

import { useAppDispatch, useAppSelector } from "../../hooks";
import {
  fetchAllArticles,
  fetchDeltaArticles,
} from "../../slices/articleSlice";
import { LoadingStateEnum } from "../../../types/types";

const AllArticles = () => {
  const [offset, setOffset] = useState(0);
  const { language, wiki } = useAppSelector((state) => state.ui);
  const {
    fetchAllArticlesState,
    allArticles,
    deltaArticles,
    fetchDeltaArticlesState,
  } = useAppSelector((state) => state.article);
  const dispatch = useAppDispatch();

  const _hasMore = useCallback(() => {
    return deltaArticles.length === 10;
  }, [deltaArticles]);

  const querySearchResult = useCallback(() => {
    if (fetchAllArticlesState !== "loading" && _hasMore()) {
      setOffset((offset) => {
        dispatch(fetchDeltaArticles({ offset: offset + 10, wiki }));
        return offset + 10;
      });
    }
  }, [fetchAllArticlesState, _hasMore]);

  const handleOnScroll = useCallback(() => {
    // http://stackoverflow.com/questions/9439725/javascript-how-to-detect-if-browser-window-is-scrolled-to-bottom
    const scrollTop =
      (document.documentElement && document.documentElement.scrollTop) ||
      document.body.scrollTop;
    const scrollHeight =
      (document.documentElement && document.documentElement.scrollHeight) ||
      document.body.scrollHeight;
    const clientHeight =
      document.documentElement.clientHeight || window.innerHeight;
    const scrolledToBottom =
      Math.ceil(scrollTop + clientHeight) >= scrollHeight - 100;

    if (scrolledToBottom) {
      querySearchResult();
    }
  }, [querySearchResult]);

  const _renderArticles = useCallback(() => {
    return allArticles.map((article) => {
      const { title, _id, wikiSource, ns, thumbUrl } = article;
      const url = `/${language}/videowiki/${title}?wikiSource=${wikiSource}`;
      return (
        <Grid.Column computer={4} tablet={5} mobile={8} key={_id}>
          <ArticleCard url={url} image={thumbUrl} title={title} ns={ns || 0} />
        </Grid.Column>
      );
    });
  }, [allArticles]);

  const _renderLoader = useCallback(() => {
    return fetchDeltaArticlesState === LoadingStateEnum.LOADING ? (
      <Loader size="large" active inverted></Loader>
    ) : null;
  }, [fetchDeltaArticlesState]);

  const _render = () => {
    return (
      <div className="c-app-card-layout">
        <h2 className="u-text-center">All Articles</h2>
        <Grid>
          {_renderArticles()}
          {_renderLoader()}
        </Grid>
      </div>
    );
  };

  useEffect(() => {
    dispatch(fetchAllArticles({ offset, wiki: wiki }));
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleOnScroll);
    return () => {
      window.removeEventListener("scroll", handleOnScroll);
    };
  }, [handleOnScroll]);

  return (
    <StateRenderer
      componentState={fetchAllArticlesState}
      loaderMessage="Hold Tight! Loading all articles..."
      errorMessage="Error while loading articles! Please try again later!"
      onRender={() => _render()}
    />
  );
};

export default AllArticles;
