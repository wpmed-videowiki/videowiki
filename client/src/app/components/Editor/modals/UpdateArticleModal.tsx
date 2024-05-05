import { useState } from "react";
import { Button, Icon, Popup, Modal, Progress } from "semantic-ui-react";
import request from "../../../utils/requestAgent";
import { toast } from "react-toastify";

interface IUpdateArticleModalProps {
  title: string;
  wikiSource: string;
}

let updateInterval: any;

const UpdateArticleModal = (props: IUpdateArticleModalProps) => {
  const [state, updateState] = useState({
    open: false,
    updating: false,
    submitLoadingPercentage: 0,
  });

  const setState = (data) => {
    updateState((state) => ({ ...state, ...data }));
  };

  const onClose = () => {
    setState({ open: false });
  };

  const onUpdate = () => {
    setState({ submitLoadingPercentage: 10, updating: true });
    updateInterval = setInterval(() => {
      updateState((state) => ({
        ...state,
        submitLoadingPercentage:
          state.submitLoadingPercentage >= 90
            ? state.submitLoadingPercentage
            : state.submitLoadingPercentage + 10,
      }));
    }, 5000);
    request
      .get(
        `/api/wiki/updateArticle?title=${props.title}&wikiSource=${props.wikiSource}`
      )
      .then(() => {
        setState({ updating: false, submitLoadingPercentage: 0 });
        clearInterval(updateInterval);
        toast.success("Article updated successfully");
        onClose();
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      })
      .catch(() => {
        setState({ updating: false, submitLoadingPercentage: 0 });
        toast.error("Error updating article");
      });
  };

  const { title } = props;
  return (
    <a
      onClick={() => setState({ open: true })}
      className="c-editor__footer-wiki c-editor__footer-sidebar c-editor__toolbar-publish c-app-footer__link "
    >
      <Popup
        trigger={<Icon name="refresh" inverted color="grey" />}
        onClick={() => setState({ open: true })}
      >
        Update article
      </Popup>
      <Modal size="small" open={state.open} onClose={() => onClose()}>
        <Modal.Header>Update {title.split("_").join(" ")}</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <p>
              Do you want to update the article "{title.split("_").join(" ")}"
              now?
            </p>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          {state.updating ? (
            <div style={{ marginBottom: "5rem !important" }}>
              <Progress
                // className="c-upload-progress"
                percent={Math.floor(state.submitLoadingPercentage)}
                progress
                indicating
              >
                Hold on tight! We are updating the article for you
              </Progress>
            </div>
          ) : (
            <div>
              <Button onClick={() => onClose()}>Cancel</Button>
              <Button primary onClick={() => onUpdate()}>
                Yes
              </Button>
            </div>
          )}
        </Modal.Actions>
      </Modal>
    </a>
  );
};

export default UpdateArticleModal;
