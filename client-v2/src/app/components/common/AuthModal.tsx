import { Modal, Icon } from "semantic-ui-react";
import AuthButtons from "../Header/AuthButtons";

interface IAuthModalProps {
  open: boolean;
  onClose: () => void;
  heading?: string;
  target: any;
}

const AuthModal = ({
  onClose,
  open,
  target,
  heading = "Only logged in users can upload files.",
}: IAuthModalProps) => (
  <Modal
    style={{
      marginLeft: "auto",
      marginRight: "auto",
      textAlign: "center",
      maxWidth: "350px",
    }}
    onClose={onClose}
    size="small"
    open={open}
  >
    <Modal.Header style={{ borderBottom: 0 }}>
      <a
        style={{
          position: "absolute",
          color: "black",
          top: 5,
          right: 5,
          fontSize: "1rem",
        }}
        href="javascript:void(0)"
        onClick={onClose}
      >
        <Icon name="close" />
      </a>
    </Modal.Header>
    <Modal.Content style={{ paddingTop: 0 }}>
      <Modal.Description>
        <p>{heading}</p>
        <p>A good chance to Log In</p>
      </Modal.Description>
    </Modal.Content>
    <AuthButtons
      fluid
      onAuth={onClose}
      noMargen
      style={{ height: 50, borderRadius: 0 }}
      target={target}
    />
  </Modal>
);

export default AuthModal;
