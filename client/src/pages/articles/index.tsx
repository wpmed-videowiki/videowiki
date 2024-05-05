import AllArticles from "../../app/components/Articles/AllArticles";
import { Helmet } from "react-helmet";

const AllArticlesPage = () => {
  return (
    <>
      <Helmet>
        <title>All Articles</title>
      </Helmet>
      <AllArticles />
    </>
  );
};

export default AllArticlesPage;
