import { useEffect } from "react";
import { Container } from "semantic-ui-react";
import moment from "moment";
import { useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchAudioFileInfo } from "../../app/slices/articleSlice";
import StateRenderer from "../../app/components/common/StateRenderer";

const styles: any = {
  container: {
    height: 60,
  },
  title: {
    fontWeight: "bold",
    display: "inline-block",
    width: 200,
    padding: "1.4rem",
    paddingLeft: "1.8rem",
    textAlign: "left",
    backgroundColor: "#61bbff",
    borderLeft: "1px solid",
    borderRight: "2px solid",
    borderBottom: "2px solid rgb(97, 187, 255)",
    borderTop: "none",
    verticalAlign: "top",
  },
  description: {
    display: "inline-block",
    padding: "1.2rem",
    position: "relative",
  },
};

const Commons = () => {
  const { audioInfo, fetchAudioFileInfoState } = useAppSelector(
    (state) => state.article
  );

  const params = useParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (params.file) {
      dispatch(fetchAudioFileInfo(params.file));
    }
  }, [params.file]);

  const _renderFileInfo = () => {
    if (!audioInfo || !audioInfo.title) return <span>loading</span>;

    const date = audioInfo.date
      ? moment(audioInfo.date).format("DD MMMM YYYY")
      : "Unknow";
    const authorsSource =
      audioInfo && audioInfo.wikiSource
        ? `https://xtools.wmflabs.org/articleinfo/${audioInfo.wikiSource.replace(
            "https://",
            ""
          )}/${audioInfo.title}?format=html`
        : "";

    return (
      <Container>
        <div style={{ border: "2px solid", borderLeft: "1px solid" }}>
          <div style={styles.container}>
            <div
              style={{
                ...styles.title,
                padding: "1.4rem 1.4rem 1.4rem 1.8rem",
              }}
            >
              File
            </div>
            <div
              style={{
                ...styles.description,
                padding: ".3rem",
                paddingLeft: "1rem",
                paddingTop: ".6rem",
              }}
            >
              <audio controls src={audioInfo.source} />
            </div>
          </div>

          <div style={styles.container}>
            <div style={styles.title}>Description</div>
            <div style={styles.description}>
              This is a spoken excerpt of the Wikipedia article:{" "}
              <a
                target="_blank"
                href={`${audioInfo.wikiSource}/wiki/${audioInfo.title}`}
              >
                {audioInfo.title.replace(/\_/g, " ")}
              </a>
            </div>
          </div>

          <div style={styles.container}>
            <div style={styles.title}>Accent</div>
            <div style={styles.description}>American English</div>
          </div>

          <div style={styles.container}>
            <div style={styles.title}>Gender</div>
            <div style={styles.description}>Female</div>
          </div>

          <div style={styles.container}>
            <div style={styles.title}>Duration</div>
            <div style={styles.description}>
              00:{audioInfo.duration} seconds ({audioInfo.size} MB)
            </div>
          </div>

          <div style={styles.container}>
            <div style={styles.title}>Date</div>
            <div style={styles.description}>{date}</div>
          </div>

          {authorsSource && (
            <div style={styles.container}>
              <div style={styles.title}>Source</div>
              <div style={styles.description}>
                Text-to-speech engine, Derivate of{" "}
                <a
                  target="_blank"
                  href={`${audioInfo.wikiSource}/wiki/${audioInfo.title}`}
                >
                  {audioInfo.title.replace(/\_/g, " ")}
                </a>
              </div>
            </div>
          )}

          <div style={styles.container}>
            <div style={styles.title}>Authors</div>
            <div style={styles.description}>
              VideoWiki Foundation,{" "}
              <a target="_blank" href={authorsSource}>
                Authors of the Article
              </a>
            </div>
          </div>

          <div style={styles.container}>
            <div style={styles.title}>Licence</div>
            <div style={styles.description}>
              <a
                target="_blank"
                href="https://creativecommons.org/licenses/by-sa/4.0/"
              >
                Creative Commons 4.0
              </a>
            </div>
          </div>
        </div>
      </Container>
    );
  };

  return (
    <StateRenderer
      componentState={fetchAudioFileInfoState}
      loaderImage="/img/view-loader.gif"
      loaderMessage="Loading!"
      errorMessage="Error while loading! Please try again later!"
      onRender={() => _renderFileInfo()}
    />
  );
};

export default Commons;
