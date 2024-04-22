import React from "react";
import { Menu, MenuItem, Sidebar } from "react-pro-sidebar";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightFromBracket,
  faChalkboardTeacher,
  faChartLine,
  faGauge,
  faGears,
  faLayerGroup,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import koiLogo from "../assets/images/koiLogo.png";

const SideNav = ({
  menus = [],
  settingMenu = {},
  sidebarCollapsed = false,
  handleClick,
}) => {
  const location = useLocation(); // To handle dynamic path changes
  const currentPath = location.pathname;
  const navigate = useNavigate(); // To manage navigation smoothly

  return (
    <Sidebar
      className={`customSidebar ${
        sidebarCollapsed ? "collapseMargin" : "marginCustomBar"
      }`}
      collapsed={sidebarCollapsed}
    >
      <div className="d-flex justify-content-center mb-4">
        <img src={koiLogo} alt="Company" className="sidebarImg" />
      </div>
      <Menu style={{ flex: 1 }}>
        {menus
          .filter((x) => x.display)
          .map((menu, idx) => (
            <MenuItem
              key={idx}
              icon={<FontAwesomeIcon aria-hidden="true" icon={menu.iconName} />}
              className={currentPath === menu.link ? "sidebarActive" : ""}
              active={currentPath === menu.link}
              onClick={() => handleClick(menu)}
              component={<Link to={menu.link} />}
            >
              {menu.name}
            </MenuItem>
          ))}
      </Menu>
      <Menu>
        <MenuItem
          icon={
            <FontAwesomeIcon aria-hidden="true" icon={settingMenu.iconName} />
          }
          className={currentPath === settingMenu.link ? "sidebarActive" : ""}
          active={currentPath === settingMenu.link}
          onClick={() => handleClick(settingMenu)}
          component={<Link to={settingMenu.link} />}
        >
          {settingMenu.name}
        </MenuItem>
        <MenuItem
          icon={
            <FontAwesomeIcon aria-hidden="true" icon={faRightFromBracket} />
          }
          onClick={() => {
            localStorage.clear(); // Clear authentication
            navigate("/"); // Redirect without reloading the page
          }}
        >
          Log Out
        </MenuItem>
      </Menu>
    </Sidebar>
  );
};

export default SideNav;
