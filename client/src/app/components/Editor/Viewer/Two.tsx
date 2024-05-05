interface ITwoProps {
  media: any[];
  current: number;
  renderItem: (item: any, isActive: boolean) => any;
}

const Two = ({ media, current, renderItem }: ITwoProps) => (
  <div style={{ height: "400px" }}>
    {media.map((item, index) => {
      const isActive = index === current;

      return (
        <div className={isActive ? "two-active" : "two"} key={index}>
          {renderItem(item, isActive)}
        </div>
      );
    })}
  </div>
);

export default Two;
