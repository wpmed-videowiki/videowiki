import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  Outlet,
  RouterProvider,
  createBrowserRouter,
  useNavigate,
} from "react-router-dom";
import { useAppSelector } from "./app/hooks";
import Header from "./app/components/Header";
import Footer from "./app/components/Footer";
import { useEffect } from "react";

import "semantic-ui-css/semantic.min.css";
import "basscss/css/basscss.min.css";
import "./stylesheets/main.scss";
import Home from "./pages";
import AllArticlesPage from "./pages/articles";
import VideowikiArticlePage from "./pages/videowiki/[title]";
import WikiPage from "./pages/wiki";
import WikiConvert from "./pages/wiki/convert/[title]";

// the * in title param to handle articles having "/"" in their titles
// https://github.com/ReactTraining/react-router/issues/313#issuecomment-261403303

const Redirect = () => {
  const { language } = useAppSelector((state) => state.ui);
  const navigate = useNavigate();
  useEffect(() => {
    navigate(`/${language}`);
  }, []);

  return null;
};
function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Redirect />,
    },
    {
      path: "/:lang",
      element: (
        <div className="c-app">
          <Header />
          <div className="c-app__main">
            <Outlet />
          </div>
          <Footer />
          <ToastContainer />
        </div>
      ),
      children: [
        {
          path: "/:lang/",
          element: <Home />,
        },
        {
          path: "/:lang/articles",
          element: <AllArticlesPage />,
        },
        {
          path: "/:lang/videowiki/:title",
          element: <VideowikiArticlePage />,
        },
        {
          path: "/:lang/wiki/:title",
          element: <WikiPage />,
        },
        {
          path: '/:lang/wiki/convert/:title',
          element: <WikiConvert />,
        }
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
