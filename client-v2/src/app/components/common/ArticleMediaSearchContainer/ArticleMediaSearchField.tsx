import { useState } from "react";
import { Form } from "semantic-ui-react";

import { useAppDispatch } from "../../../hooks";
import {
  fetchGifsFromWikimediaCommons,
  fetchImagesFromWikimediaCommons,
  fetchVideosFromWikimediaCommons,
} from "../../../slices/wikiSlice";

const ArticleMediaSearchField = () => {
  const [searchText, setSearchText] = useState("");

  const dispatch = useAppDispatch();

  const _handleSearchChange = (e, { value }) => {
    if (searchText !== value) {
      setSearchText(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchImagesFromWikimediaCommons({ searchText }));
    dispatch(fetchGifsFromWikimediaCommons({ searchText }));
    dispatch(fetchVideosFromWikimediaCommons({ searchText }));
  };

  return (
    <div className="c-bing__search-bar">
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Input
            placeholder="Search Wikimedia Commons"
            name="search_images"
            value={searchText}
            onChange={_handleSearchChange}
            icon="search"
            className="c-bing__search-input"
          />
        </Form.Group>
      </Form>
    </div>
  );
};

export default ArticleMediaSearchField;
