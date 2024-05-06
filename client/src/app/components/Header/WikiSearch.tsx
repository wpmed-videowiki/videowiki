import { useEffect, useState } from "react";
import { Search } from "semantic-ui-react";
import { useNavigate } from "react-router-dom";

import { getLanguageFromWikisource } from "../../utils/wikiUtils";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { resetSearchBar, searchWiki } from "../../slices/wikiSlice";
import { useDebounce } from "use-debounce";

const WikiSearch = () => {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch] = useDebounce(searchText, 500);
  const { searchResults, isSearchResultLoading } = useAppSelector(
    (state) => state.wiki
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const _resetSearchBar = () => {
    dispatch(resetSearchBar());
  };

  const _handleResultSelect = (e, {result}) => {
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
      )}/videowiki/${title}?wikiSource=${description}`
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

    dispatch(searchWiki(action));
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
        placeholder="Search a Topic or Paste a URL"
        fluid
      />
    </div>
  );
};

export default WikiSearch;
