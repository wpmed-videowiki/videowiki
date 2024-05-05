import { useState } from "react";

import ArticleMediaSearchField from "./ArticleMediaSearchField";
import ArticleMediaSearchResults from "./ArticleMediaSearchResults";

const ArticleMediaSearchContainer = () => {
  const [currentTab, setCurrentTab] = useState<any>("images");

  return (
    <div className="c-bing-container">
      <ArticleMediaSearchField />
      <section className="searchControls">
        <div className="searchFilters">
          <ul className="searchFilterMediaType">
            <li
              onClick={() => setCurrentTab("images")}
              className={`searchFilterMediaTypeOption ${
                currentTab === "images"
                  ? "searchFilterMediaTypeOption--selected"
                  : ""
              }`}
            >
              <a className="searchFilterMediaTypeOption__link">Images</a>
            </li>
            <li
              onClick={() => setCurrentTab("gifs")}
              className={`searchFilterMediaTypeOption ${
                currentTab === "gifs"
                  ? "searchFilterMediaTypeOption--selected"
                  : ""
              }`}
            >
              <a className="searchFilterMediaTypeOption__link">Gifs</a>
            </li>
            <li
              onClick={() => setCurrentTab("videos")}
              className={`searchFilterMediaTypeOption ${
                currentTab === "videos"
                  ? "searchFilterMediaTypeOption--selected"
                  : ""
              }`}
            >
              <a className="searchFilterMediaTypeOption__link">Videos</a>
            </li>
          </ul>
        </div>
      </section>
      <ArticleMediaSearchResults currentTab={currentTab} />
    </div>
  );
};

export default ArticleMediaSearchContainer;
