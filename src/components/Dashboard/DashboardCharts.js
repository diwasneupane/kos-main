import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import axios from "axios";

const DashboardCharts = () => {
  const [totalProjects, setTotalProjects] = useState(0);
  const [projectStatus, setProjectStatus] = useState({
    ongoing: 0,
    pending: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchProjectData();
  }, []);

  const fetchProjectData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/v1/project/projects"
      );
      const projects = response.data.projects;
      setTotalProjects(projects.length);
      calculateProjectStatus(projects);
    } catch (error) {
      console.error("Error fetching project data:", error);
    }
  };

  const calculateProjectStatus = (projects) => {
    let ongoingCount = 0;
    let pendingCount = 0;
    let completedCount = 0;

    projects.forEach((project) => {
      switch (project.status) {
        case "ongoing":
          ongoingCount++;
          break;
        case "pending":
          pendingCount++;
          break;
        case "completed":
          completedCount++;
          break;
        default:
          break;
      }
    });

    setProjectStatus({
      ongoing: ongoingCount,
      pending: pendingCount,
      completed: completedCount,
    });
  };

  const doughnutData = {
    labels: ["Ongoing", "Pending", "Completed"],
    datasets: [
      {
        label: "Project Status",
        data: [
          projectStatus.ongoing,
          projectStatus.pending,
          projectStatus.completed,
        ],
        backgroundColor: ["#f36d38", "#13deb9", "#25628f"],
      },
    ],
  };

  return (
    <div className="row" style={{ marginBottom: "1.5rem" }}>
      <div className="col-md-4">
        <div className="dataContainerBox">
          <p className="contentTitle mb-0">Yearly Updates</p>
          <p className="contentSubtitle">Total Projects</p>
          <div className="position-relative" style={{ padding: "0.5rem 5rem" }}>
            <Doughnut
              data={doughnutData}
              options={{
                cutout: "90%",
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      usePointStyle: true,
                      pointStyle: "circle",
                      padding: 40,
                    },
                  },
                },
              }}
            />
            <div className="chartTitle">
              <p>
                Projects
                <br />
                {totalProjects}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-8">
        <div className="dataContainerBox">
          <div className="d-flex justify-content-between">
            <div>
              <p className="contentTitle mb-0">Performance</p>
              <p className="contentSubtitle mb-0">Overview</p>
            </div>
            <div>
              <select name="duration" className="form-select">
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="thisYear">This Year</option>
              </select>
            </div>
          </div>
          {/* Include Line chart or other performance-related data here */}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
