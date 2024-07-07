import classnames from "classnames";
import { useTranslation } from "react-i18next";
import { Grid, Icon } from "semantic-ui-react";

interface SlidesListV2Props {
  slides: any[];
  currentSlideIndex: number;
  translateable?: boolean;
  onSubslideClick: (index: number) => void;
}

const SlidesListV2 = (props: SlidesListV2Props) => {
  const { t } = useTranslation();
  const getsubSlideBorderColor = (subslide) => {
    if (subslide.text && subslide.audio) {
      return "green";
    } else {
      return "gray";
    }
  };

  const renderSubslide = (slide, index, maxIndex) => {
    const completed = slide.completed;
    return (
      <Grid.Row
        key={`slide-list-${slide.position}`}
        onClick={() => props.onSubslideClick(index)}
      >
        <Grid.Column width={16}>
          <div
            className={classnames({
              "slide-item": true,
              active: index === props.currentSlideIndex,
            })}
          >
            <span>{t("HumanVoice.slide", { slideNumber: index + 1 })}</span>
            <div>
              <span className="timing">
                {/* {formatTime(subslide.startTime * 1000)} - {formatTime(subslide.endTime * 1000)} */}
              </span>
              {completed && (
                <Icon
                  className="marker-icons"
                  name="check circle"
                  color="green"
                />
              )}
            </div>
          </div>
        </Grid.Column>
      </Grid.Row>
    );
  };

  return (
    <Grid className="slides-list-v2">{props.slides.map(renderSubslide)}</Grid>
  );
};

export default SlidesListV2;
