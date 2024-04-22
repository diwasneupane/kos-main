import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faBell,
  faEnvelope,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import NotificationPanel from "./NotificationPanel";
import { jwtDecode } from "jwt-decode";
import getUserRoles from "../utils/Permissions";
import userImg from "../assets/images/userImg.jpg";

class Header extends Component {
  state = {
    username: "",
    userRoles: [],
  };

  componentDidMount() {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const username = decodedToken.username || "User";
        const userRoles = getUserRoles(); // Get roles using the function provided
        this.setState({ username, userRoles });
      } catch (error) {
        console.error("Error decoding JWT token:", error);
      }
    }
  }

  handleNotificationClick = () => {
    const panel = document.getElementById("nPanel");
    if (panel) {
      panel.classList.toggle("panelHeight");
    }
  };

  render() {
    const { toggleSidebar, searchData, handleSearch, onLogout } = this.props;
    const { username, userRoles } = this.state;

    const userType = userRoles.length > 0 ? userRoles[0] : "User";

    return (
      <header className="headerDiv">
        <FontAwesomeIcon
          icon={faBars}
          className="sidebarToggle"
          onClick={toggleSidebar}
        />
        <div className="searchDiv">
          <FontAwesomeIcon icon={faSearch} className="searchIcon" />
          <input
            type="text"
            className="searchBar"
            value={searchData}
            onChange={handleSearch}
            placeholder="Search"
          />
        </div>
        <div className="emptyDiv"></div>
        <div className="userInfoDiv">
          <FontAwesomeIcon icon={faEnvelope} className="mailIcon" />
          <div
            className="position-relative"
            style={{ cursor: "pointer" }}
            onClick={this.handleNotificationClick}
          >
            <FontAwesomeIcon icon={faBell} className="bellIcon" />
            <span className="badge headerBadge">5</span>
            <div className="notificationPanel" id="nPanel">
              <NotificationPanel />
            </div>
          </div>
          <span
            className="dropdown d-flex align-items-center"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ cursor: "pointer" }}
          >
            <div
              className="d-flex align-items-center"
              style={{ margin: "0 10px" }}
            >
              <img src={userImg} className="userImage" alt="User" />
              <div className="ms-3">
                <p className="userLabel">{username}</p>
                <p className="userType">{userType}</p>
              </div>
            </div>
          </span>
        </div>
      </header>
    );
  }
}

export default Header;
