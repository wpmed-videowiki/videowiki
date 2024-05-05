import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Popup } from "semantic-ui-react";
import { httpPost } from "../../apis/Common";
import { useAppSelector } from "../../hooks";

const Footer = () => {
  const [term, setTerm] = useState("");
  const location = useLocation();
  const pathname = location.pathname;

  const { language } = useAppSelector((state) => state.ui);

  const _renderContactUs = () => {
    return <span className="c-app-footer__contact">Contact Us</span>;
  };

  const _renderSubmitEmail = (email) => {
    const url = `/api/slackEmail/`;
    const data = {
      email,
    };

    return httpPost(url, data).then((res: any) => {
      alert(res.text);
      setTerm("");
    });
  };

  const onInputChange = (term) => {
    setTerm(term);
  };

  return pathname === `/${language}/` ||
    `/${language}` ||
    pathname === "/login" ||
    pathname === "/signup" ? (
    <footer className="c-app-footer">
      <p className="c-app-footer__top-line">
        Text and audio are available under the
        <a
          style={{ fontWeight: "bold", color: "black" }}
          href="https://creativecommons.org/licenses/by-sa/3.0/"
          target="_blank"
        >
          {" "}
          Creative Commons Attribution-ShareAlike License 3.0 or later.
        </a>{" "}
        Images including those within videos are under various Open and Creative
        Common Licenses.
      </p>
      <p className="c-app-footer__top-line">
        The VideoWiki software is available under the GNU General Public License
        3.0 and is on{" "}
        <a
          style={{ color: "white" }}
          href="https://github.com/videowikips/videowiki"
          target="_blank"
        >
          https://github.com/videowikips/videowiki
        </a>
      </p>
      <div style={{ position: "absolute", right: 10, top: 30 }}>
        <a
          href="https://creativecommons.org/licenses/by-sa/3.0/"
          target="_blank"
        >
          <img src="/img/cc-by-sa.png" style={{ width: 150 }} />
        </a>
      </div>
      <div className="c-app-footer__actions">
        <span className="c-app-footer__about">
          <a
            href="https://mdwiki.org/wiki/Main_Page"
            className="c-app-footer__link"
            target="_blank"
          >
            About Us
          </a>
        </span>

        <Popup trigger={_renderContactUs()} hoverable>
          <span>
            Email -{"\u00A0"}
            <a
              className="c-app-footer__link"
              href="mailto:wikiprojectmed@gmail.com"
            >
              wikiprojectmed@gmail.com
            </a>
          </span>
        </Popup>

        <span className="c-app-footer__about">
          <a
            href="/docs/VideoWiki_Terms_of_Use.pdf"
            className="c-app-footer__link"
            target="_blank"
          >
            Terms of Use
          </a>
        </span>
        <span className="c-app-footer__about">
          <a
            href="/docs/VideoWiki Privacy Policy August 2018.pdf"
            className="c-app-footer__link"
            target="_blank"
          >
            Privacy Policy
          </a>
        </span>
        <span className="c-app-footer__about">
          <a
            href="https://medium.com/videowiki"
            className="c-app-footer__link"
            target="_blank"
          >
            Blog
          </a>
        </span>
        <span className="c-app-footer__about">
          <a
            href="https://mdwiki.org/wiki/WikiProjectMed:VideoWiki/Bug_report"
            className="c-app-footer__link"
            target="_blank"
          >
            Report Bugs
          </a>
        </span>
      </div>
    </footer>
  ) : null;
};

export default Footer;
