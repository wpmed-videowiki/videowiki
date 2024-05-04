import { useEffect, useRef, useState } from "react";
import { Segment, Image } from "semantic-ui-react";
import queryString from "query-string";
import { httpGet } from "../../apis/Common";

const ArticleSummary = (props: any) => {
  const _isMounted = useRef(false);
  const [state, updateState] = useState({
    position: props.position || null,
    title: props.title || null,
    article: { image: "", articleText: "" },
    loading: false,
  });

  const setState = (data) => {
    updateState((state) => ({ ...state, ...data }));
  };

  useEffect(() => {
    _isMounted.current = true;
    return () => {
      _isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (state["title"]) {
      setState({ loading: true });
      loadArticleInfo(state["title"]);
    }
  }, [state.title]);

  useEffect(() => {
    if (props.title !== state.title) {
      setState({ title: props.title, loading: true });
    }
  }),
    [props.title];

  const loadArticleInfo = (url) => {
    const query: any = {};
    const urlParts = url.split("?");
    const title = urlParts[0] as string;

    query["title"] = title;

    if (urlParts.length > 1 && urlParts[1].includes("wikiSource")) {
      query["wikiSource"] = queryString.parse(urlParts[1]).wikiSource;
    }

    httpGet(
      `/api/wiki/article/summary?title=${query.title}${
        query.wikiSource && `&wikiSource=${query.wikiSource}`
      }`
    )
      .then((res: any) => {
        if (_isMounted.current) {
          setState({ loading: false, article: res.body });
        }
      })
      .catch(() => {});
  };

  const _renderContent = () => {
    if (state.loading) {
      return <Image src="/img/paragraph.png" />;
    }
    if (state.article) {
      return (
        <div>
          <Image src={state.article.image} />
          <p className="description">{state.article.articleText}...</p>
        </div>
      );
    } else {
      return <div></div>;
    }
  };

  let containerWidth = 790;
  let containerHeight = 400;
  let summaryWidth = 300;
  let summaryHeight = 320;
  let XOffset = 40;
  let YOffset = 20;

  let x = props.position["x"] + XOffset;
  let y = 420 - props.position["y"];
  // Setting max offsets for X to avoid overflow
  // if the position
  if (x > containerWidth / 2) {
    x -= summaryWidth + XOffset;
  }

  if (y > containerHeight) {
    y -= YOffset;
  }

  return (
    <Segment
      className="article-summary"
      style={{
        left: x,
        bottom: y,
      }}
      loading={state.loading}
    >
      {_renderContent()}
    </Segment>
  );
};

export default ArticleSummary;
