import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    backend: {
      request: function (options, url, payload, callback) {
        fetch(url.toLowerCase())
          .then((res) => {
            return res.text();
          })
          .then((res) => {
            callback(null, {
              status: "success",
              data: res,
            });
          })
          .catch((err) => {
            callback(err, null);
          });
      },
    },
  });

export default i18n;
