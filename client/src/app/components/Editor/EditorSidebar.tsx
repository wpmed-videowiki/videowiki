import { Sidebar, Menu, Progress } from "semantic-ui-react";
// import { Scrollbars } from "react-custom-scrollbars";

interface IEditrSidebarProps {
  toc: any[];
  visible: boolean;
  currentSlideIndex: number;
  navigateToSlide: (slideIndex: number) => void;
}

const EditorSidebar = (props: IEditrSidebarProps) => {
  const _renderMenuItem = () => {
    const { toc, currentSlideIndex, navigateToSlide } = props;
    return toc.map((item, index) => {
      const title = `${item["tocnumber"]} ${item["title"]}`;
      const { numSlides, slideStartPosition } = item;

      let active = false;
      let percent = 0;

      if (
        currentSlideIndex >= slideStartPosition &&
        currentSlideIndex < slideStartPosition + numSlides
      ) {
        active = true;
        percent = Math.floor(
          (100 * (currentSlideIndex - slideStartPosition)) / numSlides
        );
      }

      return active ? (
        <Progress percent={percent} className="c-menu-progress" key={index}>
          <div className="c-menu-progress-item">
            <Menu.Item
              name={title}
              content={title}
              active={active}
              className={`c-sidebar__menu-item--level-${item["toclevel"]}`}
              key={index}
              link={true}
              onClick={() => navigateToSlide(slideStartPosition)}
            />
          </div>
        </Progress>
      ) : (
        <Menu.Item
          name={title}
          content={title}
          active={active}
          className={`c-sidebar__menu-item--level-${item["toclevel"]}`}
          key={index}
          link={true}
          onClick={() => navigateToSlide(slideStartPosition)}
        />
      );
    });
  };

  const { visible } = props;
  return (
    <Sidebar
      as={Menu}
      animation="slide along"
      width="thin"
      visible={visible}
      icon="labeled"
      vertical
      inverted
      className="c-sidebar"
    >
      <div
        style={{
          height: "calc(100vh - 60px)",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {_renderMenuItem()}
      </div>
    </Sidebar>
  );
};

export default EditorSidebar;
