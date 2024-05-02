import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  Outlet,
  RouterProvider,
  createBrowserRouter,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import Header from "./app/components/Header";
import Footer from "./app/components/Footer";
import { useEffect, useRef } from "react";

import "semantic-ui-css/semantic.min.css";
import "basscss/css/basscss.min.css";
import "./stylesheets/main.scss";
import Home from "./pages";
import AllArticlesPage from "./pages/articles";
import VideowikiArticlePage from "./pages/videowiki/[title]";
import WikiPage from "./pages/wiki";
import WikiConvert from "./pages/wiki/convert/[title]";
import { LANG_API_MAP, websocketConfig } from "./app/utils/config";
import websockets from "./app/websockets";
import VideoConvertProgress from "./pages/videos/progress/[id]";
import VideosHistory from "./pages/videos/history/[title]";
import Commons from "./pages/commons/[file]";
import YouTubeAuthPage from "./pages/auth/youtube";
import ExportHumanVoice from "./pages/export/humanvoice/[title]";
import { setLanguage } from "./app/slices/uiSlice";

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

const RootLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { language } = useAppSelector((state) => state.ui);

  useEffect(() => {
    const routeLanguage = Object.keys(LANG_API_MAP).find(
      (lang) => location.pathname.indexOf(`/${lang}`) === 0
    );
    if (routeLanguage && language !== routeLanguage) {
      dispatch(setLanguage(routeLanguage));
    }
    const newLanguage = routeLanguage || language;
    if (location.pathname.indexOf(`/${newLanguage}`) !== 0) {
      navigate(`/${newLanguage}${location.pathname}${location.search || ""}`, {
        state: location.state,
      });
    }
  }, [location.pathname, location.search]);

  return (
    <div className="c-app">
      <Header />
      <div className="c-app__main">
        <Outlet />
      </div>
      <Footer />
      <ToastContainer />
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Redirect />,
  },
  {
    path: "/:lang",
    element: <RootLayout />,
    children: [
      {
        path: "/:lang/",
        element: <Home />,
      },
      {
        path: "/:lang/auth/youtube",
        element: <YouTubeAuthPage />,
      },
      {
        path: "/:lang/articles",
        element: <AllArticlesPage />,
      },
      {
        path: "/:lang/videowiki/*",
        element: <VideowikiArticlePage />,
      },
      {
        path: "/:lang/wiki/*",
        element: <WikiPage />,
      },
      {
        path: "/:lang/wiki/convert/*",
        element: <WikiConvert />,
      },
      {
        path: "/:lang/videos/progress/:id",
        element: <VideoConvertProgress />,
      },
      {
        path: "/:lang/videos/history/*",
        element: <VideosHistory />,
      },
      {
        path: "/:lang/commons/*",
        element: <Commons />,
      },
      {
        path: "/:lang/export/humanvoice/*",
        element: <ExportHumanVoice />,
      },
      {
        path: "*",
        element: <h1 className="u-center">Not found</h1>,
      },
    ],
  },
]);

function Router() {
  const websocketConection = useRef<any>(null);
  useEffect(() => {
    const routeLanguage = Object.keys(LANG_API_MAP).find(
      (lang) => location.pathname.indexOf(`/${lang}`) === 0
    );
    if (!websocketConection.current && routeLanguage) {
      websocketConection.current = websockets.createWebsocketConnection(
        websocketConfig.url(routeLanguage),
        websocketConfig.options(routeLanguage)
      );
      websockets.subscribeToEvent(
        websockets.websocketsEvents.HEARTBEAT,
        (data) => {
          console.log("SOCKET HEARTBEAT", data);
        }
      );
    }

    return () => {
      if (websocketConection.current) {
        console.log("Disconnecting websocket");
        websockets.disconnectConnection();
        websocketConection.current = null;
      }
    };
  }, []);

  return <RouterProvider router={router} />;
}

export default Router;
