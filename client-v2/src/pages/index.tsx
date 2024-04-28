import { Icon, Button, Popup, Input } from "semantic-ui-react";
import TopArticles from "../app/components/Articles/TopArticles";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";

const links = [
  {
    icon: "book",
    text: "Script-writing",
    link: "https://mdwiki.org/wiki/WikiProjectMed:VideoWiki/Script-Writing",
  },
  {
    icon: "microphone",
    text: "Voice-over",
    link: "https://mdwiki.org/wiki/WikiProjectMed:VideoWiki/Voice-Over",
  },
  {
    icon: "file video outline",
    text: "Video Editing",
    link: "https://mdwiki.org/wiki/WikiProjectMed:VideoWiki/Video_Editing",
  },
  {
    icon: "star",
    text: (
      <p>
        Full Stack <br />
        Content Creator
      </p>
    ),
    link: "https://mdwiki.org/wiki/WikiProjectMed:VideoWiki/Full_Stack_Content_Creator",
  },
  {
    icon: "translate",
    text: "Translator",
    link: "https://mdwiki.org/wiki/WikiProjectMed:VideoWiki/Translators",
  },
];

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
          content="We are building collaborative wiki-based videos in local languages. Join Us."
        />
      </Helmet>
      <div className="joinUsLogo">
        <p>
          We are building collaborative wiki-based videos in local languages.
          Join Us.
        </p>
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
                Create a New Video
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
                    Go
                  </Button>
                }
                placeholder="Enter title of the video"
              />
            }
            on="click"
            position="bottom center"
          />
        </div>
      </div>
      <TopArticles />
    </div>
  );
};

export default Home;
