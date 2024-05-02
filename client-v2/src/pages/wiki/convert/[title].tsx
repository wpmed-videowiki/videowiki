import { useEffect, useRef } from "react";
import { Progress } from "semantic-ui-react";
import { useNavigate, useParams } from "react-router-dom";
import queryString from "query-string";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  clearConversionProgress,
  fetchConversionProgress,
} from "../../../app/slices/articleSlice";

const WikiConvert = () => {
  const _sessionPoller = useRef<any>(null);
  const dispatch = useAppDispatch();
  const { language } = useAppSelector((state) => state.ui);
  const { conversionPercentage } = useAppSelector((state) => state.article);
  const navigate = useNavigate();

  const params = useParams();
  const paramsTitle = params["*"] as string;

  useEffect(() => {
    const title = paramsTitle as string;
    const { wikiSource } = queryString.parse(location.search);

    dispatch(
      fetchConversionProgress({ title, wikiSource: wikiSource as string })
    );
    if (!_sessionPoller.current) {
      _startPoller();
    }

    return () => {
      _stopPoller();
      dispatch(clearConversionProgress());
    };
  }, []);

  const _navigateToArticle = () => {
    setTimeout(() => {
      if (conversionPercentage.converted) {
        const { wikiSource } = queryString.parse(location.search);
        const url = `/${language}/videowiki/${conversionPercentage.title}?wikiSource=${wikiSource}`;
        console.log("navigating to", { url, language });
        navigate(url);
      }
    }, 1000);
  };

  useEffect(() => {
    if (
      conversionPercentage.converted === true &&
      conversionPercentage.progress === 100
    ) {
      _stopPoller();
      setTimeout(() => {
        _navigateToArticle();
      }, 100);
    }
  }, [conversionPercentage, language]);

  const _startPoller = () => {
    const title = paramsTitle as string;
    const { wikiSource } = queryString.parse(location.search);

    _sessionPoller.current = setInterval(() => {
      dispatch(
        fetchConversionProgress({ title, wikiSource: wikiSource as string })
      );
    }, 10000);
  };

  const _stopPoller = () => {
    if (_sessionPoller.current) {
      clearInterval(_sessionPoller.current);
      _sessionPoller.current = null;
    }
  };

  const _render = () => {
    const title = paramsTitle as string;

    const progress = conversionPercentage ? conversionPercentage.progress : 0;

    return (
      <div className="u-page-center">
        <h2>{`Converting Wikipedia Article for ${title
          .split("_")
          .join(" ")} to VideoWiki`}</h2>
        <Progress
          className="c-app-conversion-progress"
          percent={progress}
          progress
          indicating
        />
        <div>
          <span>{`Converting - ${progress}% converted`}</span>
        </div>

        <div>
          <strong>Quick Fact: </strong>
          It takes 4-5 minutes to convert an article. So get some{" "}
          <img
            className="c-app-coffee"
            src="https://s3.eu-central-1.amazonaws.com/vwpmedia/statics/coffee.png"
          />{" "}
          until then.
        </div>
      </div>
    );
  };

  return _render();
};

export default WikiConvert;
