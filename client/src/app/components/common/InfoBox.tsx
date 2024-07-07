import { useEffect } from "react";
import StateRenderer from "./StateRenderer";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { getInfoBox } from "../../slices/wikiSlice";
import { useTranslation } from "react-i18next";

interface IInofBoxProps {
  title: string;
  titleWikiSource?: string;
}

const InfoBox = (props: IInofBoxProps) => {
  const { infobox, infoboxState } = useAppSelector((state) => state.wiki);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const _render = () => {
    return (
      <div>
        <div dangerouslySetInnerHTML={{ __html: infobox }} />
      </div>
    );
  };

  useEffect(() => {
    const { title, titleWikiSource } = props;

    let action = {
      title,
      wikiSource: "",
    };

    if (titleWikiSource) {
      action["wikiSource"] = titleWikiSource;
    }

    dispatch(getInfoBox(action));
  }, [props.title, props.titleWikiSource]);
  return (
    <StateRenderer
      componentState={infoboxState}
      loaderDisabled={true}
      loaderMessage={t("InfoBox.loading")}
      errorMessage={t("InfoBox.loading_error")}
      onRender={() => _render()}
    />
  );
};

export default InfoBox;
