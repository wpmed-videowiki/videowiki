import { Card, Image } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface IArticleCardProps {
  url: string;
  image: string;
  title: string;
  className?: string;
  ns?: number;
}

const ArticleCard = (props: IArticleCardProps) => {
  const { url, image, title, className, ns = 0 } = props;
  const { t } = useTranslation();

  const appClassName = className || "c-app-card";
  const articleTitle = title
    .split("/")
    .pop()
    ?.split("_")
    .join(" ")
    .replace("overview", "");

  return (
    <Link to={url}>
      <Card className={appClassName} style={{ position: "relative" }}>
        {ns !== 0 && <div className="custom">{t("Home.custom")}</div>}
        <Image src={image} />
        <Card.Content>
          <Card.Header>{articleTitle}</Card.Header>
        </Card.Content>
      </Card>
    </Link>
  );
};

export default ArticleCard;
