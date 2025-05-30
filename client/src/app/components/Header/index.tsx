import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Popup, Icon, Dropdown } from "semantic-ui-react";

import WikiSearch from "./WikiSearch";
import Logo from "./Logo";
import AuthButtons from "./AuthButtons";
import UserProfileDropdown from "./UserProfileDropdown";

import { useAppDispatch, useAppSelector } from "../../hooks";
import { fetchArticleCount } from "../../slices/articleSlice";
import { validateSession } from "../../slices/authSlice";
import {
  closeBetaDisclaimer,
  setLanguage,
  setWiki,
} from "../../slices/uiSlice";
import { useTranslation } from "react-i18next";
import OtherTools from "./OtherTools";

const LANG_OPTIONS = [
  {
    text: "English",
    key: "en",
    value: "en",
  },
  {
    text: "Chinese (zh-hant)",
    key: "zh-hant",
    value: "zh-hant",
  },
];

const WIKI_LANG_OPTIONS = [
  {
    text: "MDWiki ( English )",
    value: "md-en",
    key: "md-en",
  },
  {
    text: "EN ( English )",
    value: "en",
    key: "en",
  },
  {
    text: "HI ( हिंदी )",
    value: "hi",
    key: "hi",
  },
  {
    text: "ES ( Español )",
    value: "es",
    key: "es",
  },
  {
    text: "AR ( العربية )",
    value: "ar",
    key: "ar",
  },
  {
    text: "JA ( 日本人 )",
    value: "ja",
    key: "ja",
  },
  {
    text: "UK ( Ukrainian )",
    value: "uk",
    key: "uk",
  },
  {
    text: "FR ( Française )",
    value: "fr",
    key: "fr",
  },
  {
    text: "OR (Odia)",
    value: "or",
    key: "or",
  },
  {
    text: "TE (Telegu)",
    value: "te",
    key: "te",
  },
  {
    text: "GU (Gujarati)",
    value: "gu",
    key: "gu",
  },
  {
    text: "BN (Bengali)",
    value: "bn",
    key: "bn",
  },
  {
    text: "SAT (Santali)",
    value: "sat",
    key: "sat",
  },
  {
    text: "PA (Punjabi)",
    value: "pa",
    key: "pa",
  },
  {
    text: "SV ( Svenska )",
    value: "sv",
    key: "sv",
  },
  {
    text: "IT ( Italian )",
    value: "it",
    key: "it",
  },
  {
    text: "KN ( Kannada )",
    value: "kn",
    key: "kn",
  },
  {
    text: "ML ( Malayalam )",
    value: "ml",
    key: "ml",
  },
  {
    text: "TA ( Tamil )",
    value: "ta",
    key: "ta",
  },
  {
    text: "EU ( Basque )",
    value: "eu",
    key: "eu",
  },
  {
    text: "HA ( Hausa )",
    value: "ha",
    key: "ha",
  },
  {
    text: "ZH ( 中文 )",
    value: "zh",
    key: "zh",
  },
  {
    text: "NE ( Nepali )",
    value: "ne",
    key: "ne",
  },
];

let _sessionPoller: any = null;

const Header = () => {
  const { wiki, language, showBetaDisclaimer } = useAppSelector(
    (state) => state.ui
  );
  const { session } = useAppSelector((state) => state.auth);
  const { fetchArticleCountState, articleCount } = useAppSelector(
    (state) => state.article
  );
  const location = useLocation();

  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();

  const _startPoller = () => {
    _sessionPoller = setInterval(() => {
      dispatch(fetchArticleCount(wiki));
      dispatch(validateSession());
    }, 60000);
  };

  const _stopPoller = () => {
    clearInterval(_sessionPoller);
    _sessionPoller = null;
  };

  useEffect(() => {
    dispatch(fetchArticleCount(wiki));
    _startPoller();
    return () => {
      _stopPoller();
    };
  }, [wiki]);

  useEffect(() => {
    dispatch(fetchArticleCount(wiki));
    dispatch(validateSession());
  }, [location.pathname, wiki]);

  const onCloseDisclaimer = () => {
    dispatch(closeBetaDisclaimer());
  };

  const _renderBetaDisclaimer = () => {
    if (!showBetaDisclaimer) return;

    return (
      <p
        style={{
          textAlign: "center",
          margin: 0,
          padding: 10,
          backgroundColor: "#0099ff",
        }}
      >
        <Popup
          wide="very"
          position="bottom center"
          trigger={
            <a
              href="javascript:void(0)"
              style={{
                color: "white",
                fontWeight: "bold",
                textDecoration: "underline",
              }}
            >
              {t("Header.read_beta_disclaimer")}
            </a>
          }
          content={
            <div
              style={{
                textAlign: "left",
                fontSize: 16,
              }}
            >
              <p>{t("Header.beta_disclaimer_1")}</p>
              <p>{t("Header.beta_disclaimer_2")}</p>
            </div>
          }
        />
        <a
          style={{
            position: "absolute",
            right: 30,
            color: "white",
            fontWeight: "bold",
          }}
          onClick={onCloseDisclaimer}
        >
          <Icon name="close" />
        </a>
      </p>
    );
  };

  const onLanguageSelect = (e, { value }) => {
    console.log({ value });
    i18n.changeLanguage(value, (err, t) => {
      console.log(err, t);
      // window.location.reload()
    });
  };

  const onWikiLanguageSelect = (e, { value }) => {
    let isMDwiki = false;

    if (value === "md-en") {
      isMDwiki = true;
      value = "en";
    }

    if (
      language !== value ||
      (isMDwiki && !wiki) ||
      (!isMDwiki && wiki === "mdwiki")
    ) {
      dispatch(setLanguage(value));
      if (!isMDwiki) {
        dispatch(setWiki(undefined));
      } else {
        dispatch(setWiki("mdwiki"));
      }

      setTimeout(() => {
        window.location.href = `/${value}`;
      }, 500);
    }
  };

  const _renderWikiLanguages = () => {
    return (
      <div
        style={{
          minWidth: "7%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <span>Wiki</span>
        <Dropdown
          inline
          placeholder={t("Header.language")}
          className={"select-lang-dropdown"}
          value={wiki === "mdwiki" ? "md-en" : language}
          options={WIKI_LANG_OPTIONS}
          onChange={(e, { value }) => onWikiLanguageSelect(e, { value })}
        />
      </div>
    );
  };

  const _renderLanguages = () => {
    return (
      <div
        style={{
          minWidth: "7%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <span>Language</span>
        <Dropdown
          inline
          placeholder={t("Header.language")}
          className={"select-lang-dropdown"}
          value={i18n.language.toLowerCase()}
          options={LANG_OPTIONS}
          onChange={(e, { value }) => onLanguageSelect(e, { value })}
        />
      </div>
    );
  };

  const _renderUser = () => {
    return session && session.user ? (
      <UserProfileDropdown />
    ) : (
      <AuthButtons
        style={{ maxWidth: "10rem", lineHeight: "20px", padding: ".5rem" }}
      />
    );
  };

  const _renderArticleCount = () => {
    return <div>{`( ${articleCount || "-"} ${t("Header.articles")} )`}</div>;
  };

  const _renderAllArticle = () => {
    return (
      <Link to={`/${language}/articles`} className="c-app-header__link">
        <div>{t("Header.all_articles")}</div>
        {_renderArticleCount()}
      </Link>
    );
  };

  const _renderWikiScripts = () => {
    let href = "";
    if (wiki && wiki === "mdwiki" && language === "en") {
      href = "https://mdwiki.org/wiki/Category:Videowiki_scripts";
    } else if (language === "en") {
      href = "https://en.wikipedia.org/wiki/Category:Videowiki_scripts";
    } else {
      return null;
    }

    return (
      <div style={{ textAlign: "center" }} className="c-app-header__link">
        <a href={href} target="_blank" >
          {t("Header.video_scripts")}
        </a>
      </div>
    );
  };
  return (
    <div>
      {_renderBetaDisclaimer()}
      <header className="c-app__header">
        <Logo />
        <OtherTools />
        <WikiSearch />
        {_renderAllArticle()}
        {_renderWikiLanguages()}
        {_renderLanguages()}
        {_renderWikiScripts()}
        {_renderUser()}
      </header>
    </div>
  );
};

export default Header;
