import {
  faChalkboardTeacher,
  faLaptopCode,
  faUser,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import React, { Component } from "react";
import GroupProgress from "../components/Dashboard/GroupProgress";
import EventCalendar from "../components/Dashboard/EventCalendar";
import Summary from "../components/Dashboard/Summary";
import DashboardCharts from "../components/Dashboard/DashboardCharts";

class DashboardPage extends Component {
  state = {
    summary: [
      { name: "Students", count: 450 },
      { name: "Instructors", count: 50 },
      { name: "Projects", count: 660 },
    ],
    groupProgress: [
      {
        groupName: "Group A",
        progress: "75%",
      },
      {
        groupName: "Group B",
        progress: "50%",
      },
      {
        groupName: "Group C",
        progress: "90%",
      },
      {
        groupName: "Group D",
        progress: "60%",
      },
    ],
    events: [
      {
        title: "Group A Project Discussion",
        date: "2015-02-10T10:12:50.500Z",
      },
      {
        title: "Group A Project Submission Deadline",
        date: "2015-02-10T10:12:50.500Z",
      },
      {
        title: "Semi Annual Meeting and Project Discussion",
        date: "2015-02-10T10:12:50.500Z",
      },
    ],
  };

  displayIcons = (idx) => {
    switch (idx) {
      case 0:
        return faUsers;
      case 1:
        return faChalkboardTeacher;
      case 2:
        return faLaptopCode;
      default:
        return faUser;
    }
  };

  render() {
    return (
      <div className="container-fluid customMargin">
        <Summary
          displayIcons={this.displayIcons}
          summary={this.state.summary}
        />
        <DashboardCharts />
        <div className="row" style={{ marginBottom: "1.5rem" }}>
          <div className="col-md-6">
            <GroupProgress groupProgress={this.state.groupProgress} />
          </div>
          <div className="col-md-6">
            <EventCalendar events={this.state.events} />
          </div>
        </div>
      </div>
    );
  }
}

export default DashboardPage;
