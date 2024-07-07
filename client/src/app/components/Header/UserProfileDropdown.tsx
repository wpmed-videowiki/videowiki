import { Dropdown, Image } from "semantic-ui-react";

import { useAppDispatch, useAppSelector } from "../../hooks";
import { setToken, setUser, validateSession } from "../../slices/authSlice";
import { useTranslation } from "react-i18next";

const UserProfileDropdown = () => {
  const { session } = useAppSelector((state) => state.auth);
  const { user } = session;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const _handleOptionSelect = (e) => {
    const selection = e.target.getAttribute("name");

    if (
      selection === "signout" ||
      e.target.innerText === t("Header.sign_out")
    ) {
      dispatch(setUser({ user: null }));
      dispatch(setToken({ token: "" }));
      dispatch(validateSession());
    }
  };

  const _getUserNameNode = () => {
    return (
      <span>
        <Image avatar src="/img/avatar.png" /> {user.username}
      </span>
    );
  };

  let articlesEditCount = 0;
  let articlesEdited = [];
  let totalEditCount = 0;

  if (user) {
    articlesEdited = user.articlesEdited;
    totalEditCount = user.totalEdits;
  }

  if (articlesEdited) {
    articlesEditCount = articlesEdited.length;
  } else {
    articlesEditCount = 0;
  }

  const options = [
    {
      key: "edited",
      text: t("Header.articles_edited", { count: articlesEditCount }),
      name: "edited",
    },
    {
      key: "total",
      text: t("Header.total_edits", { count: totalEditCount }),
      name: "total",
    },
    {
      key: "sign-out",
      text: t("Header.sign_out"),
      icon: "sign out",
      name: "signout",
    },
  ];
  return (
    <div style={{ position: "relative", top: "-20px" }}>
      <Dropdown
        trigger={_getUserNameNode()}
        options={options}
        pointing="top right"
        icon={null}
        onChange={_handleOptionSelect}
      />
    </div>
  );
};

export default UserProfileDropdown;
