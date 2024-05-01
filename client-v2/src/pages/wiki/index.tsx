import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import queryString from "query-string";
import { Button, Modal, Icon } from "semantic-ui-react";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { convertWiki, fetchWikiPage } from "../../app/slices/wikiSlice";
import { LoadingStateEnum } from "../../types/types";
import { toast } from "react-toastify";
import StateRenderer from "../../app/components/common/StateRenderer";

const WikiPage = () => {
  const [state, updateState] = useState({
    shouldRender: false,
    shouldShowError: false,
    wikiContentState: LoadingStateEnum.DONE,
    convertState: LoadingStateEnum.DONE,
  });

  const params = useParams();
  const dispatch = useAppDispatch();
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
      fetchWikiPage({ title: params.title!, wikiSource: wikiSource as string })
    );
  }, []);

  useEffect(() => {
    const queryParams = queryString.parse(location.search);

    if (state.wikiContentState === "loading" && wikiContentState === "done") {
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

    // if (
    //   this.props.match.url !== nextProps.match.url ||
    //   this.props.location.search !== nextProps.location.search
    // ) {
    //   const { wikiSource } = queryString.parse(location.search);
    //   nextProps.dispatch(
    //     actions.fetchWikiPage({
    //       title: nextProps.match.params.title,
    //       wikiSource,
    //     })
    //   );
    // }

    if (!queryParams.wikiSource && wikiSource) {
      return navigate(
        `/${language}/wiki/${params.title}?wikiSource=${wikiSource}`
      );
    }

    if (state.convertState === "loading" && convertState === "failed") {
      if (convertError && convertError.response && convertError.response.text) {
        toast.info(convertError.response.text);
      }
      navigate(`/${language}/`);
      setState({
        shouldShowError: true,
      });
    }
    if (state.convertState === "loading" && convertState === "done") {
      navigate(
        `/${language}/wiki/convert/${params.title}?wikiSource=${wikiSource}`
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
            <Icon name="checkmark" /> Got it
          </Button>
        </Modal.Actions>
      </Modal>
    ) : null;
  };

  const _handleConvertToVideoWiki = () => {
    const { wikiSource } = queryString.parse(location.search);
    const title = params.title as string;
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
      loaderMessage="Loading your article from the sum of all human knowledge!"
      errorMessage="Error while loading wiki content! Please try again later!"
      onRender={() => _render()}
    />
  );
};

export default WikiPage;
