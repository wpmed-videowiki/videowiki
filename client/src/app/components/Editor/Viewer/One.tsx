interface IOneProps {
  media: any[];
  renderItem: (item: any, isActive: boolean) => any;
}

const One = ({ media, renderItem }: IOneProps) => (
  <div style={{ height: "100%" }}>
    {media.map((mitem) => (
      <div
        className={"one one-active"}
        style={{ width: "100%", height: "100%" }}
        key={`ien-slide-${mitem.url}`}
      >
        {renderItem(mitem, true)}
      </div>
    ))}
  </div>
);

export default One;
