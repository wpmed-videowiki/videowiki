import { Modal, ModalContent, ModalActions, Button } from "semantic-ui-react";

interface IInvalidPublishModalProps {
  onClose: () => void;
  open: boolean;
}

const InvalidPublishModal = (props: IInvalidPublishModalProps) => {
  return (
    <Modal
      size="tiny"
      open={props.open}
      onClose={props.onClose}
      style={{ textAlign: "center" }}
    >
      <ModalContent>
        <h3>Add voice over and translated text to ALL the slides</h3>
      </ModalContent>
      <ModalActions style={{ padding: 0 }}>
        <Button
          style={{ margin: 0, borderRadius: 0 }}
          fluid
          primary
          onClick={props.onClose}
        >
          Got it
        </Button>
      </ModalActions>
    </Modal>
  );
};
export default InvalidPublishModal;
