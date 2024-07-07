import _ from "lodash";
import { useEffect } from "react";
import { Message, Grid, Icon, Card, Popup } from "semantic-ui-react";

import { useAppDispatch, useAppSelector } from "../../hooks";
import { fetchContributors } from "../../slices/articleSlice";
import { useTranslation } from "react-i18next";

interface IContributorsProps {
  title: string;
}

const Contributors = (props: IContributorsProps) => {
  const { fetchContributorsState, contributors } = useAppSelector(
    (state) => state.article
  );
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const _renderLoading = () => {
    return null;
  };

  const _renderFailure = () => {
    return (
      <Message negative>
        <p>{t("Editor.failed_to_load_contributors")}</p>
      </Message>
    );
  };

  const _renderIcons = (numIcons) => {
    return _.times(numIcons, (i) => (
      <Grid.Column key={i}>
        <Icon name="user" />
      </Grid.Column>
    ));
  };

  const _renderContributorsCount = () => {
    return <span className="c-contributors__count">{contributors.length}</span>;
  };

  const _renderContributorsNames = () => {
    return contributors.map((person, i) => <div key={i}>{person}</div>);
  };

  const _render = () => {
    const numIcons = contributors.length > 5 ? 5 : contributors.length;

    return (
      <Card className="c-contributors">
        <Card.Content
          header={t("Editor.contributors")}
          className="c-contributors__header"
        />
        <Card.Content className="c-contributors__description">
          <Popup
            trigger={_renderContributorsCount()}
            hoverable
            position="bottom right"
            size="large"
            className="c-contributors__popup"
          >
            {_renderContributorsNames()}
          </Popup>
          <Grid className="c-contributors__icons">
            {_renderIcons(numIcons)}
          </Grid>
        </Card.Content>
      </Card>
    );
  };

  useEffect(() => {
    const { title } = props;
    dispatch(fetchContributors({ title }));
  }, [props.title]);

  switch (fetchContributorsState) {
    case "done":
      return _render();
    case "loading":
      return _renderLoading();
    case "failed":
      return _renderFailure();
    default:
      return _render();
  }
};

export default Contributors;
