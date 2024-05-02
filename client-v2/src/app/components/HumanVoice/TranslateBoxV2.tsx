import { useEffect, useState } from "react";
import { TextArea, Button, Card } from "semantic-ui-react";

interface ITranslateBoxV2Props {
  value: string;
  loading: boolean;
  onSave: (value: string, slideIndex: number, subslideIndex: number) => void;
  currentSlideIndex: number;
  currentSubslideIndex: number;
  disabled: boolean;
}

const TranslateBoxV2 = (props: ITranslateBoxV2Props) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (props.value !== value) {
      setValue(props.value);
    }
  }, []);

  useEffect(() => {
    if (props.value !== value) {
      props.onSave(value, props.currentSlideIndex, props.currentSubslideIndex);
      setValue(props.value);
    }
  }, [props.value]);

  const onValueChange = (value) => {
    setValue(value);
  };

  const { loading } = props;

  return (
    <Card style={{ margin: 0, width: "100%", borderRadius: 0 }}>
      <Card.Header
        style={{ backgroundColor: "#d4e0ed", color: "", borderRadius: 0 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h4 style={{ color: "#333333", margin: 0, padding: "1rem" }}>
            Slide {props.currentSlideIndex + 1}
          </h4>
          <Button
            basic
            loading={loading}
            disabled={
              loading || value.trim() === props.value.trim() || !value.trim()
            }
            style={{
              backgroundColor: "transparent",
              boxShadow: "none",
              margin: 0,
              padding: "1rem",
            }}
            onClick={() =>
              props.onSave(
                value,
                props.currentSlideIndex,
                props.currentSubslideIndex
              )
            }
          >
            Update
          </Button>
        </div>
      </Card.Header>
      <div style={{ margin: 0, padding: 0, position: "relative" }}>
        <TextArea
          disabled={props.disabled}
          style={{
            padding: 20,
            paddingRight: 40,
            width: "100%",
            border: "none",
          }}
          rows={6}
          placeholder="Translate slide text"
          value={value}
          onChange={(e, { value }) => {
            onValueChange(value);
          }}
        />

        {/* {this._renderSlideTranslateBoxV2()} */}
      </div>
    </Card>
  );
};

export default TranslateBoxV2;
