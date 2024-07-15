import { Dropdown, DropdownItem } from "semantic-ui-react";

const OtherTools = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "2em",
        paddingRight: 10,
        paddingLeft: 10,
      }}
    >
      <Dropdown text="Other Tools" pointing className="link item">
        <Dropdown.Menu>
          <DropdownItem>
            <a
              href="https://kenburnseffect-tool.wmcloud.org/"
              target="_blank"
              style={{ width: "100%", height: "100%" }}
            >
              Ken Burns Effect
            </a>
          </DropdownItem>
          <DropdownItem>
            <a
              href="https://image-annotation-tool.wmcloud.org/"
              target="_blank"
              style={{ width: "100%", height: "100%" }}
            >
              Image Annotation
            </a>
          </DropdownItem>
          <DropdownItem>
            <a
              href="https://osm-zoom-tool.wmcloud.org/"
              target="_blank"
              style={{ width: "100%", height: "100%" }}
            >
              OSM Zoom
            </a>
          </DropdownItem>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default OtherTools;
