import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Radio, Grid } from "semantic-ui-react";

function getUniqueSortedRefs(refs) {
  let newRefs: any[] = [];
  refs.forEach((ref) => {
    if (
      newRefs.map((r) => r.referenceNumber).indexOf(ref.referenceNumber) === -1
    ) {
      newRefs.push(ref);
    }
  });

  newRefs = newRefs.sort((a, b) => a.referenceNumber - b.referenceNumber);
  return newRefs;
}

interface IEditorReferencesProps {
  currentSlide: any;
  currentSlideIndex: number;
  currentSubmediaIndex: number;
  article: any;
  mode: string;
  language: string;
  defaultVisible: boolean;
}

const EditorReferences = (props: IEditorReferencesProps) => {
  const [referencesVisible, setReferencesVisible] = useState(
    props.defaultVisible
  );
  const { t } = useTranslation();

  const getDecriptionUrl = () => {
    const { currentSlide, currentSubmediaIndex } = props;
    const descriptionUrl =
      currentSlide &&
      currentSlide.media &&
      currentSlide &&
      currentSlide.media[currentSubmediaIndex]
        ? currentSlide.media[currentSubmediaIndex].descriptionurl
        : null;
    return descriptionUrl;
  };

  const getAudioUrl = () => {
    const { article, currentSlideIndex } = props;
    return `${location.origin}/${props.language}/commons/File:${article.title}__${article.version}__audio__${currentSlideIndex}`;
  };

  const getTextRefs = () => {
    const { article, currentSlideIndex } = props;
    const currentSlide = article.slides[currentSlideIndex];
    const currentSlideHtml = article.slidesHtml[currentSlideIndex];
    if (
      article.referencesList &&
      currentSlide.references &&
      currentSlide.references.length > 0
    ) {
      return getUniqueSortedRefs(
        currentSlide.references.map((ref) => ({
          referenceNumber: ref.referenceNumber,
          html: article.referencesList[ref.referenceNumber],
        }))
      );
    } else if (
      article.referencesList &&
      currentSlideHtml.references &&
      currentSlideHtml.references.length > 0
    ) {
      return getUniqueSortedRefs(
        currentSlideHtml.references.map((ref) => ({
          referenceNumber: ref.referenceNumber,
          html: article.referencesList[ref.referenceNumber],
        }))
      );
    }
    return null;
  };

  const decriptionUrl = getDecriptionUrl();
  const audioUrl = getAudioUrl();
  const textRefs = getTextRefs();

  return (
    <div
      style={{
        padding: "2rem",
        fontWeight: "bold",
        fontSize: "1.2rem",
        border: "1px solid #444",
        borderTop: 0,
        background: "#eee",
      }}
    >
      <Grid verticalAlign="middle" centered>
        <Grid.Row>
          <Grid.Column computer={2} mobile={4}>
            {t("Editor.references")}
          </Grid.Column>

          <Grid.Column computer={2} mobile={12}>
            <Radio
              style={{ marginTop: 5 }}
              toggle
              checked={referencesVisible}
              onChange={(e, { checked }) => setReferencesVisible(!!checked)}
            />
          </Grid.Column>

          <Grid.Column computer={12} mobile={16}>
            {referencesVisible && (
              <ul style={{ listStyle: "none" }}>
                {decriptionUrl && (
                  <li
                    style={{
                      padding: "10px 0",
                      margin: "5px 0",
                      wordBreak: "break-all",
                    }}
                  >
                    <span style={{ display: "inline-block", width: "12%" }}>
                      {t("Editor.visual")} -{" "}
                    </span>
                    <a
                      style={{
                        width: "88%",
                        display: "inline-block",
                        verticalAlign: "top",
                        float: "right",
                      }}
                      href={decriptionUrl}
                      target="_blank"
                    >
                      {decriptionUrl}
                    </a>
                  </li>
                )}
                <li
                  style={{
                    padding: "10px 0",
                    margin: "5px 0",
                    wordBreak: "break-all",
                  }}
                >
                  <span style={{ display: "inline-block", width: "12%" }}>
                    {t("Editor.audio")} -{" "}
                  </span>
                  <a
                    style={{
                      width: "88%",
                      display: "inline-block",
                      verticalAlign: "top",
                      float: "right",
                    }}
                    href={audioUrl}
                    target="_blank"
                  >
                    {audioUrl}
                  </a>
                </li>

                {textRefs && (
                  <li
                    className="c-editor__references-text-refs"
                    style={{
                      padding: "10px 0",
                      margin: "5px 0",
                      wordBreak: "break-all",
                    }}
                  >
                    <span style={{ display: "inline-block", width: "12%" }}>
                      {t("Editor.text")} -{" "}
                    </span>
                    {textRefs.map((ref, index) => (
                      <p
                        key={ref.html + index}
                        style={{
                          width: "88%",
                          display: "inline-block",
                          verticalAlign: "top",
                          float: "right",
                          fontSize: "12px",
                        }}
                      >
                        [{ref.referenceNumber}]{" "}
                        <span dangerouslySetInnerHTML={{ __html: ref.html }} />
                      </p>
                    ))}
                  </li>
                )}
              </ul>
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
};

export default EditorReferences;
