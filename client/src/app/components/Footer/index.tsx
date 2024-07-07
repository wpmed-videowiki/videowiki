import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Popup } from "semantic-ui-react";
import { httpPost } from "../../apis/Common";
import { useAppSelector } from "../../hooks";
import { Trans, useTranslation } from "react-i18next";

const Footer = () => {
  const [term, setTerm] = useState("");
  const location = useLocation();
  const pathname = location.pathname;

  const { language } = useAppSelector((state) => state.ui);
  const { t } = useTranslation();

  const _renderContactUs = () => {
    return <span className="c-app-footer__contact">{t('Footer.contact_us')}</span>;
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
        <Trans i18nKey="Footer.text_audio_license" components={[<a />]} />
      </p>
      <p className="c-app-footer__top-line">
        <Trans i18nKey="Footer.software_license" components={[<a />]} />
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
            {t("Footer.about_us")}
          </a>
        </span>

        <Popup trigger={_renderContactUs()} hoverable>
          <span>
            {t("Footer.email")} -{"\u00A0"}
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
            {t("Footer.terms_of_use")}
          </a>
        </span>
        <span className="c-app-footer__about">
          <a
            href="/docs/VideoWiki Privacy Policy August 2018.pdf"
            className="c-app-footer__link"
            target="_blank"
          >
            {t("Footer.privacy_policy")}
          </a>
        </span>
        <span className="c-app-footer__about">
          <a
            href="https://medium.com/videowiki"
            className="c-app-footer__link"
            target="_blank"
          >
            {t("Footer.blog")}
          </a>
        </span>
        <span className="c-app-footer__about">
          <a
            href="https://mdwiki.org/wiki/WikiProjectMed:VideoWiki/Bug_report"
            className="c-app-footer__link"
            target="_blank"
          >
            {t("Footer.report_bugs")}
          </a>
        </span>
      </div>
    </footer>
  ) : null;
};

export default Footer;
