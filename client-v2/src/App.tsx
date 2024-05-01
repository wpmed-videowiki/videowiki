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
        path: "/:lang/wiki/convert/:title",
        element: <WikiConvert />,
      },
      {
        path: "/:lang/videos/progress/:id",
        element: <VideoConvertProgress />
      },
    ],
  },
]);

function App() {
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
    console.log('Websocket ')

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

export default App;
