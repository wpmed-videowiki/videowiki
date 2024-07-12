import { useEffect, useState } from "react";
import { Search } from "semantic-ui-react";

import { getLanguageFromWikisource } from "../../utils/wikiUtils";
import { useAppDispatch, useAppSelector } from "../../hooks";
import {
  onSearchWikiFailure,
  onSearchWikiLoading,
  onSearchWikiSuccess,
  resetSearchBar,
} from "../../slices/wikiSlice";
import { useDebounce } from "use-debounce";
import { useTranslation } from "react-i18next";

const METAWIKI_SOURCE = "https://meta.wikimedia.org";

const WikiSearch = () => {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch] = useDebounce(searchText, 500);
  const { language } = useAppSelector((state) => state.ui);
  const DEFAULT_WIKISOURCE = `https://${language}.wikipedia.org`;

  const { searchResults, isSearchResultLoading } = useAppSelector(
    (state) => state.wiki
  );
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const _resetSearchBar = () => {
    dispatch(resetSearchBar());
  };

  const search = async (searchText: string, wikiSource: string) => {
    dispatch(onSearchWikiLoading());

    try {
      if (wikiSource === "https://mdwiki.org") {
        searchText = searchText.replace(/_/g, " ");
      }
      if (!wikiSource && searchText.toLowerCase().startsWith("video:")) {
        wikiSource = "https://mdwiki.org";
        searchText = searchText.replace(/_/g, " ");
      } else {
        wikiSource = DEFAULT_WIKISOURCE;
      }
      const query = `/w/api.php?action=query&list=search&srsearch=${searchText}&format=json&redirects=1&origin=*&limit=7`;

      const wikiSearch = fetch(`${wikiSource}${query}`)
        .then((response) => response.json())
        .then((data) =>
          data.query.search.map((result) => ({
            title: result.title,
            description: wikiSource,
          }))
        );

      const metawikiSearch = fetch(`${METAWIKI_SOURCE}${query}`)
        .then((response) => response.json())
        .then((data) =>
          data.query.search.map((result) => ({
            title: result.title,
            description: METAWIKI_SOURCE,
          }))
        );

      const result = await Promise.all([wikiSearch, metawikiSearch]);
      console.log("result", result);
      dispatch(onSearchWikiSuccess(result.flat()));
    } catch (err) {
      dispatch(onSearchWikiFailure());
    }
  };

  const _handleResultSelect = (e, { result }) => {
    let { title } = result;
    const { description } = result;

    title = title.split(" ").join("_");
    console.log(
      "lang from wikisource",
      description,
      getLanguageFromWikisource(description)
    );
    window.location.href = `/${getLanguageFromWikisource(
      description
    )}/videowiki/${title}?wikiSource=${description}`;
  };

  const _handleSearchChange = (e, { value }) => {
    if (searchText !== value) {
      setSearchText(value);
    }
  };

  useEffect(() => {
    let searchText = debouncedSearch as unknown as string;
    if (debouncedSearch.length < 1) {
      return _resetSearchBar();
    }

    const urlRegex = /^(https:\/\/.+)\/wiki\/(.*)$/;
    const urlMatch = decodeURI(searchText).match(urlRegex);
    let wikiSource;

    if (urlMatch && urlMatch.length == 3) {
      wikiSource = urlMatch[1];
      searchText = urlMatch[2];
    }

    let action = {
      searchText,
      wikiSource: "",
    };

    if (wikiSource) {
      action["wikiSource"] = wikiSource;
    }

    search(searchText, wikiSource);
  }, [debouncedSearch]);

  return (
    <div style={{ flex: 10 }}>
      <Search
        className="c-search-bar"
        loading={isSearchResultLoading}
        onResultSelect={_handleResultSelect}
        onSearchChange={(e, { value }) => _handleSearchChange(e, { value })}
        results={searchResults}
        value={searchText}
        placeholder={t("Header.search_placeholder")}
        noResultsMessage={t("Header.search_no_results")}
        fluid
      />
    </div>
  );
};

export default WikiSearch;
