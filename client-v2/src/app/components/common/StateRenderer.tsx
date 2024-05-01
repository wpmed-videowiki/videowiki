import { Message } from "semantic-ui-react";

import LoaderOverlay from "./LoaderOverlay";
import { LoadingStateEnum } from "../../../types/types";

interface IStateRendererProps {
  componentState: LoadingStateEnum;
  loaderImage?: string;
  loaderDisabled?: boolean;
  loaderMessage: string;
  errorMessage: string;
  onRender?: () => JSX.Element | null;
}

const StateRenderer = (props: IStateRendererProps) => {
  const { componentState, loaderMessage, errorMessage, onRender } = props;

  switch (componentState) {
    case LoadingStateEnum.DONE:
      return onRender ?  onRender() : null;
    case LoadingStateEnum.LOADING:
      return !props.loaderDisabled ? (
        <LoaderOverlay loaderImage={props.loaderImage}>
          {loaderMessage}
        </LoaderOverlay>
      ) : null;
    case LoadingStateEnum.FAILED:
      return (
        <Message color="red" size="massive">
          {errorMessage}
        </Message>
      );
    default:
      return !props.loaderDisabled ? (
        <LoaderOverlay loaderImage={props.loaderImage}></LoaderOverlay>
      ) : null;
  }
};

export default StateRenderer;
