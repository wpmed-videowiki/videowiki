import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const logo = "/img/logo.png";

const Logo = () => {
  const {t} = useTranslation();
  return (
    <Link to="/" className="c-logo-wrapper u-center">
      <div>
        <div className="c-logo">
          <img className="c-logo__img" src={logo} />
        </div>
        <p id="logoText">
          <b>{t('Header.logo_description')}</b>
        </p>
      </div>
    </Link>
  );
};

export default Logo;
