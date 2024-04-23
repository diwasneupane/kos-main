import React, { Component } from "react";
import DashboardRoutes from "../../routes/DashboardRoutes";
import SideNav from "../SideNav";
import {
  faChalkboardTeacher,
  faChartLine,
  faGauge,
  faGears,
  faLayerGroup,
  faUserGraduate,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import {
  checkAdmin,
  checkInstructor,
  checkStudent,
} from "../../utils/Permissions";
import Header from "../Header";
import { getRoles } from "@testing-library/react";

const admin = checkAdmin(getRoles);
const instructor = checkInstructor(getRoles);
const student = checkStudent(getRoles);
class DashboardTemplate extends Component {
  state = {
    selectedMenu: null,
    menus: [
      {
        name: "Dashboard",
        iconName: faGauge,
        link: "/dashboard",
        display: true,
      },
      {
        name: "Projects",
        iconName: faLayerGroup,
        link: "/dashboard/project",
        display: admin,
      },
      {
        name: "Projects",
        iconName: faLayerGroup,
        link: "/dashboard/studentProject",
        display: student,
      },
      {
        name: "Groups",
        iconName: faUsers,
        link: "/dashboard/groupPage",
        display: admin || student,
      },
      {
        name: "Instructors",
        iconName: faChalkboardTeacher,
        link: "/dashboard/instructorPage",
        display: admin || instructor,
      },
      {
        name: "Student Verify",
        iconName: faUserGraduate,
        link: "/dashboard/StudentVerifyList",
        display: admin || instructor,
      },
      {
        name: "Analytics",
        iconName: faChartLine,
        link: "/dashboard/instructors",
        display: admin,
      },
      {
        name: "Members",
        iconName: faUsers,
        link: "/dashboard/membersPage",
        display: admin,
      },
    ],
    settingMenu: {
      name: "Settings",
      iconName: faGears,
      link: "/dashboard/settings",
    },
    sidebarCollapsed: false,
  };

  handleClick = (menu) => {
    this.setState({ selectedMenu: menu, parentMenu: null });
  };

  toggleSidebar = () => {
    this.setState({ sidebarCollapsed: !this.state.sidebarCollapsed });
  };

  componentDidMount = () => {
    this.config();
  };

  config = () => {
    let pathname = window.location.pathname;
    let menus = this.state.menus.filter((el) => el.link === pathname);
    this.setState({ selectedMenu: menus[0] });
  };

  render() {
    return (
      <div style={{ display: "flex" }}>
        <SideNav
          menus={this.state.menus}
          handleClick={this.handleClick}
          settingMenu={this.state.settingMenu}
          sidebarCollapsed={this.state.sidebarCollapsed}
        />
        <div style={{ flex: 1, height: "100vh", overflow: "auto" }}>
          <Header toggleSidebar={this.toggleSidebar}></Header>
          <p className="pageTitle">
            {this.state.selectedMenu ? this.state.selectedMenu.name : null}
          </p>
          <DashboardRoutes></DashboardRoutes>
        </div>
      </div>
    );
  }
}

export default DashboardTemplate;
