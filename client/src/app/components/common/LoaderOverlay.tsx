import React from "react";
import { Loader, Dimmer, Image } from "semantic-ui-react";

interface ILoaderOverlayProps {
  children?: React.ReactNode;
  loaderImage?: string;
}

const LoaderOverlay = (props: ILoaderOverlayProps) => {
  return props.loaderImage ? (
    <Dimmer active inverted>
      <div
        style={{
          color: "black",
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Image src={props.loaderImage} size="small" />
        <h3>{props.children}</h3>
      </div>
    </Dimmer>
  ) : (
    <Dimmer active inverted>
      <Loader size="large" active inverted>
        {props.children}
      </Loader>
    </Dimmer>
  );
};

export default LoaderOverlay;
