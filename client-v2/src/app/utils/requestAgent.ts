import { LANG_API_MAP } from "./config";
import superagent from "superagent";
import superagentUse from "superagent-use";

const request = superagentUse(superagent);

const ENVIRONMENT = process.env.NODE_ENV;

request.use((req) => {
  const lang = localStorage.getItem("language") || "en";
  const token = localStorage.getItem("token") || "";
  const session = localStorage.getItem("session")
    ? JSON.parse(localStorage.getItem("session")!)
    : null;
  const anonymousId = session && session.anonymousId ? session.anonymousId : "";

  if (token) {
    req.header["x-access-token"] = token;
  }
  if (anonymousId) {
    req.header["x-vw-anonymous-id"] = anonymousId;
  }
  if (req.url.indexOf("/api") === 0) {
    if (ENVIRONMENT === "production") {
      req.url = req.url.replace("/api/", `/${lang}/api/`);
    } else {
      req.url = `${LANG_API_MAP[lang]}${req.url}`;
    }
  }
  return req;
});

export default request;
