import { useState } from "react";
import { Grid, Image, Modal, Button, Icon } from "semantic-ui-react";

import StateRenderer from "../StateRenderer";

import fileUtils from "../../../utils/fileUtils";
import { useAppDispatch, useAppSelector } from "../../../hooks";

const videoRefs: any = {};

interface IArticleMediaSearchResultsProps {
  currentTab: string;
}

const ArticleMediaSearchResults = ({
  currentTab,
}: IArticleMediaSearchResultsProps) => {
  const [state, setState] = useState<any>({
    isVideoModalOpen: false,
    currentVideo: null,
  });
  const {
    fetchImagesFromWikimediaCommonsState,
    fetchGifsFromWikimediaCommonsState,
    fetchVideosFromWikimediaCommonsState,
    searchImages,
    searchGifs,
    searchVideos,
  } = useAppSelector((state) => state.wiki);

  const dispatch = useAppDispatch();

  const handleModalClose = () => {
    setState({ isVideoModalOpen: false, currentVideo: null });
  };

  const downloadFile = (url) => {
    fileUtils.downloadFile(url);
  };

  const onVideoDragStart = (ev, video) => {
    // Fake the transfered data to the dropdown zone
    // Provide an image tag with data-origin-mimetype = video to upload the url as video
    ev.dataTransfer.setData(
      "text/html",
      `<image data-orig=${video.url} data-orig-desc=${
        video.descriptionurl
      } data-orig-mimetype="video/${video.mime.split("/")[1]}" > `
    );
  };

  const _renderImages = () => {
    if (searchImages.length === 0) {
      return <p>No Images have matched your search. Try again.</p>;
    }

    return searchImages.map((image) => (
      <Grid.Column key={image.url} className="c-bing__search-column">
        <Image
          src={image.url}
          data-orig={image.url}
          data-orig-desc={image.descriptionurl}
          data-orig-mimetype={image.mime}
          className="c-bing__result-image"
        />
      </Grid.Column>
    ));
  };

  const _renderGifs = () => {
    if (searchGifs.length === 0) {
      return <p>No Gifs have matched your search. Try again.</p>;
    }

    return searchGifs.map((gif) => (
      <Grid.Column key={gif.url} className="c-bing__search-column">
        <Image
          src={gif.url}
          data-orig={gif.url}
          data-orig-desc={gif.descriptionurl}
          data-orig-mimetype={gif.mime}
          className="c-bing__result-image"
        />
      </Grid.Column>
    ));
  };

  const _renderVideos = () => {
    if (searchVideos.length === 0) {
      return <p>No Videos have matched your search. Try again.</p>;
    }

    return searchVideos.map((video, index) => (
      <Grid.Column key={video.url} className="c-bing__search-column">
        <video
          draggable
          className="c-bing__result-image"
          width={"100%"}
          ref={(ref) => {
            videoRefs[index] = ref;
          }}
          data-orig={video.url}
          autoPlay={false}
          muted={true}
          src={video.url}
          // type={video.mime}
          onMouseOver={() => videoRefs[index].play()}
          onMouseLeave={() => {
            videoRefs[index].pause();
            videoRefs[index].currentTime = 0;
          }}
          onClick={() =>
            setState({ isVideoModalOpen: true, currentVideo: video })
          }
          onDragStart={(ev) => onVideoDragStart(ev, video)}
        />
      </Grid.Column>
    ));
  };

  const renderVideoModal = () => {
    const { currentVideo, isVideoModalOpen } = state;

    if (!currentVideo) {
      return;
    }

    return (
      <Modal
        style={{
          marginTop: "0px !important",
          marginLeft: "auto",
          marginRight: "auto",
        }}
        open={isVideoModalOpen}
        onClose={() => handleModalClose()}
        size="small"
      >
        <Modal.Actions>
          <Icon
            onClick={() => handleModalClose()}
            name="close"
            style={{ cursor: "pointer" }}
          />
        </Modal.Actions>
        <Modal.Content>
          <Button
            primary
            className="u-block-center u-display-block u-margin-bottom c-bing__video-modal__download"
            onClick={() => downloadFile(currentVideo.url)}
          >
            Download
          </Button>
          <video
            className="c-bing__result-image"
            width={"100%"}
            height={"400px"}
            data-orig={currentVideo.url}
            autoPlay={true}
            controls
          >
            <source src={currentVideo.url} type={currentVideo.mime} />
          </video>
        </Modal.Content>
      </Modal>
    );
  };

  const _renderItems = () => {
    if (
      (currentTab === "videos" && searchVideos.length === 0) ||
      (currentTab === "gifs" && searchGifs.length === 0) ||
      (currentTab === "images" && searchImages.length === 0)
    ) {
      return <p>Type in your search. Press Enter. Find the perfect image.</p>;
    }

    switch (currentTab) {
      case "images":
        return _renderImages();
      case "gifs":
        return _renderGifs();
      case "videos":
        return _renderVideos();
      default:
        return _renderImages();
    }
  };

  const _render = () => {
    return (
      <Grid columns={2} className="c-bing__search-result-container">
        {_renderItems()}
        {renderVideoModal()}
      </Grid>
    );
  };

  let componentState;
  switch (currentTab) {
    case "images":
      componentState = fetchImagesFromWikimediaCommonsState;
      break;
    case "gifs":
      componentState = fetchGifsFromWikimediaCommonsState;
      break;
    case "videos":
      componentState = fetchVideosFromWikimediaCommonsState;
      break;
    default:
      componentState = fetchImagesFromWikimediaCommonsState;
      break;
  }

  return (
    <div>
      <StateRenderer
        componentState={componentState}
        loaderMessage="Hold Tight! Loading images..."
        errorMessage="Error while loading images! Please try again later!"
        onRender={() => _render()}
      />
    </div>
  );
};

export default ArticleMediaSearchResults;
