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
import { Suspense, lazy, useEffect, useRef } from "react";

import "semantic-ui-css/semantic.min.css";
import "basscss/css/basscss.min.css";
import "./stylesheets/main.scss";
import { LANG_API_MAP, websocketConfig } from "./app/utils/config";
import websockets from "./app/websockets";
import { setLanguage, setWiki } from "./app/slices/uiSlice";

const Home = lazy(() => import("./pages"));
const AllArticlesPage = lazy(() => import("./pages/articles"));
const VideowikiArticlePage = lazy(() => import("./pages/videowiki/[title]"));
const WikiPage = lazy(() => import("./pages/wiki"));
const WikiConvert = lazy(() => import("./pages/wiki/convert/[title]"));
const VideoConvertProgress = lazy(() => import("./pages/videos/progress/[id]"));
const VideosHistory = lazy(() => import("./pages/videos/history/[title]"));
const Commons = lazy(() => import("./pages/commons/[file]"));
const YouTubeAuthPage = lazy(() => import("./pages/auth/youtube"));
const ExportHumanVoice = lazy(
  () => import("./pages/export/humanvoice/[title]")
);

// the * in title param to handle articles having "/"" in their titles
// https://github.com/ReactTraining/react-router/issues/313#issuecomment-261403303

const Redirect = () => {
  const { language } = useAppSelector((state) => state.ui);
  const navigate = useNavigate();
  useEffect(() => {
    navigate(`/${language}`);
  }, [language]);

  return null;
};

const RootLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { language } = useAppSelector((state) => state.ui);

  const routeLanguage = Object.keys(LANG_API_MAP).find(
    (lang) => location.pathname.indexOf(`/${lang}`) === 0
  );
  if (routeLanguage && language !== routeLanguage) {
    dispatch(setLanguage(routeLanguage));
    if (routeLanguage !== "en") {
      dispatch(setWiki(undefined));
    }
  }

  const newLanguage = routeLanguage || language;
  if (location.pathname.indexOf(`/${newLanguage}`) !== 0) {
    navigate(`/${newLanguage}${location.pathname}${location.search || ""}`, {
      state: location.state,
    });
    return null;
  }

  return (
    <div className="c-app">
      <Header />
      <div className="c-app__main">
        <Suspense fallback={<div className="u-center">Loading...</div>}>
          <Outlet />
        </Suspense>
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
