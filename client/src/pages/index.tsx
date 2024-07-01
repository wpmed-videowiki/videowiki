import { Icon, Button, Popup, Input } from "semantic-ui-react";
import TopArticles from "../app/components/Articles/TopArticles";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

function RenderBox({ icon, text, key, link }) {
  return (
    <a className="c-app-home__wikilinks" target="_blank" href={link} key={key}>
      <Icon name={icon} size="large" /> <br />
      <span>{text}</span>
    </a>
  );
}

const Home = () => {
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const params = useParams();
  const { t } = useTranslation();

  const links = useMemo(
    () => [
      {
        icon: "book",
        text: t("Home.script-writing"),
        link: "https://mdwiki.org/wiki/WikiProjectMed:VideoWiki/Script-Writing",
      },
      {
        icon: "microphone",
        text: t("Home.voice-over"),
        link: "https://mdwiki.org/wiki/WikiProjectMed:VideoWiki/Voice-Over",
      },
      {
        icon: "file video outline",
        text: t("Home.video-editing"),
        link: "https://mdwiki.org/wiki/WikiProjectMed:VideoWiki/Video_Editing",
      },
      {
        icon: "star",
        text: t("Home.full-stack-content-creator"),
        link: "https://mdwiki.org/wiki/WikiProjectMed:VideoWiki/Full_Stack_Content_Creator",
      },
      {
        icon: "translate",
        text: t("Home.translator"),
        link: "https://mdwiki.org/wiki/WikiProjectMed:VideoWiki/Translators",
      },
    ],
    [t]
  );

  const onCreateNewVideo = () => {
    if (newVideoTitle && newVideoTitle.trim().length > 0) {
      let title = newVideoTitle;
      setNewVideoTitle("");
      if (title.indexOf("Wikipedia:VideoWiki/") === -1) {
        title = `Wikipedia:VideoWiki/${title}`;
      }
      document.body.click();
      setTimeout(() => {
        window.open(
          `https://${params.lang}.wikipedia.org/wiki/${title.trim()}`
        );
      }, 100);
    }
  };

  return (
    <div className="u-page-info u-center">
      <Helmet>
        <title>VideoWiki</title>
        <meta
          name="description"
          content={t("Home.building-collaborative-wiki-videos")}
        />
      </Helmet>
      <div className="joinUsLogo">
        <p>{t("Home.building-collaborative-wiki-videos")}</p>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <div style={{ flex: 1 }}></div>
          {links.map((link) =>
            RenderBox({ ...link, key: link.text + link.icon })
          )}
          <div style={{ flex: 1 }}></div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "2rem",
          }}
        >
          <Popup
            hideOnScroll
            trigger={
              <Button
                style={{
                  backgroundColor: "#3a9e3a",
                  color: "white",
                  border: "2px solid black",
                }}
                size="huge"
              >
                {t("Home.create-new-video")}
              </Button>
            }
            content={
              <Input
                value={newVideoTitle}
                onKeyDown={(e) => e.keyCode === 13 && onCreateNewVideo()}
                onChange={(e) => setNewVideoTitle(e.target.value)}
                style={{ width: "400px" }}
                action={
                  <Button color="blue" onClick={onCreateNewVideo}>
                    {t("Home.go")}
                  </Button>
                }
                placeholder={t("Home.enter-video-title")}
              />
            }
            on="click"
            position="bottom center"
          />
        </div>
      </div>
      {/* <TopArticles /> */}
    </div>
  );
};

export default Home;
