import { Link } from "react-router-dom";

const logo = "/img/logo.png";

const Logo = () => {
  return (
    <Link to="/" className="c-logo-wrapper u-center">
      <div>
        <div className="c-logo">
          <img className="c-logo__img" src={logo} />
        </div>
        <p id="logoText">
          <b>The Free Multi-Media Encyclopedia that anyone can edit.</b>
        </p>
      </div>
    </Link>
  );
};

export default Logo;
