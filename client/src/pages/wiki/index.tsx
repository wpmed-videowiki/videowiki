import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import queryString from "query-string";
import { Button, Modal, Icon } from "semantic-ui-react";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { convertWiki, fetchWikiPage } from "../../app/slices/wikiSlice";
import { LoadingStateEnum } from "../../types/types";
import { toast } from "react-toastify";
import StateRenderer from "../../app/components/common/StateRenderer";
import { useTranslation } from "react-i18next";

const WikiPage = () => {
  const [state, updateState] = useState({
    shouldRender: false,
    shouldShowError: false,
    wikiContentState: LoadingStateEnum.DONE,
    convertState: LoadingStateEnum.DONE,
  });

  const params = useParams();
  const paramsTitle = params["*"] as string;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    wikiContentState,
    wikiContent,
    wikiSource,
    convertError,
    convertState,
  } = useAppSelector((state) => state.wiki);
  const { language } = useAppSelector((state) => state.ui);

  const setState = (newState) => updateState({ ...state, ...newState });

  useEffect(() => {
    const { wikiSource } = queryString.parse(location.search);
    dispatch(
      fetchWikiPage({ title: paramsTitle!, wikiSource: wikiSource as string })
    );
  }, []);

  useEffect(() => {
    const queryParams = queryString.parse(location.search);

    if (state.wikiContentState === "loading" && wikiContentState === "done") {
      setState({
        wikiContentState,
      });
      try {
        const parsedContent = JSON.parse(wikiContent);
        if (!parsedContent.redirect) {
          _handleConvertToVideoWiki();
        } else {
          navigate(parsedContent.path);
        }
      } catch (e) {
        _handleConvertToVideoWiki();
      }
    }

    if (!queryParams.wikiSource && wikiSource) {
      return navigate(
        `/${language}/wiki/${paramsTitle}?wikiSource=${wikiSource}`
      );
    }

    if (state.convertState === "loading" && convertState === "failed") {
      if (convertError && convertError.response && convertError.response.text) {
        toast.info(convertError.response.text);
      }
      setState({
        shouldShowError: true,
        convertState,
      });
      navigate(`/${language}`);
    }
    if (state.convertState === "loading" && convertState === "done") {
      setState({
        convertState,
      });
      navigate(
        `/${language}/wiki/convert/${paramsTitle}?wikiSource=${wikiSource}`
      );
    }
  }, [
    wikiContentState,
    convertState,
    state.convertState,
    state.wikiContentState,
  ]);

  useEffect(() => {
    setState({
      wikiContentState: wikiContentState,
    });
  }, [wikiContentState]);

  useEffect(() => {
    setState({
      convertState: convertState,
    });
  }, [convertState]);

  const handleClose = () => {
    setState({
      shouldShowError: false,
    });
  };

  const _renderError = () => {
    return state.shouldShowError && convertError && convertError.response ? (
      <Modal open={true} onClose={handleClose} basic size="small">
        <Modal.Content>
          <h3 className="c-editor-error-modal">{convertError.response.text}</h3>
        </Modal.Content>
        <Modal.Actions>
          <Button color="green" onClick={handleClose} inverted>
            <Icon name="checkmark" /> {t("Common.ok")}
          </Button>
        </Modal.Actions>
      </Modal>
    ) : null;
  };

  const _handleConvertToVideoWiki = () => {
    const { wikiSource } = queryString.parse(location.search);
    const title = paramsTitle as string;
    dispatch(convertWiki({ title, wikiSource: wikiSource as string }));
  };

  //   const _renderConvertToVideoWikiButton = () => {
  //     return (
  //       <Button
  //         primary
  //         className="u-block-center u-display-block u-margin-bottom"
  //         onClick={() => _handleConvertToVideoWiki()}
  //       >
  //         Convert this article to VideoWiki
  //       </Button>
  //     );
  //   };

  const _render = () => {
    try {
      const parsedContent = JSON.parse(wikiContent);
      if (parsedContent.redirect && state.shouldRender) {
        navigate(parsedContent.path);
        return null;
      }
    } catch (e) {}

    return (
      <div>
        {/* {this._renderConvertToVideoWikiButton()} */}
        {/* <div dangerouslySetInnerHTML={{ __html: wikiContent }} /> */}
        {_renderError()}
      </div>
    );
  };

  return (
    <StateRenderer
      componentState={convertState}
      loaderImage="/img/view-loader.gif"
      loaderMessage={t("Common.loading_article")}
      errorMessage={t("Common.loading_article_error")}
      onRender={() => _render()}
    />
  );
};

export default WikiPage;
