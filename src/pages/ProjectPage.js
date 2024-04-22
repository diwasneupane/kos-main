import React, { Component } from "react";
import axios from "axios";
import ProjectList from "../components/Project/ProjectList";

class ProjectPage extends Component {
  state = {
    projectList: [],
    projectModal: false,
    editData: null,
    edit: false,
  };

  componentDidMount() {
    this.fetchProjects();
  }

  fetchProjects = async () => {
    try {
      const response = await axios.get("/api/v1/project/Projects");
      this.setState({ projectList: response.data });
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  toggleProjectModal = () => {
    this.setState({ projectModal: !this.state.projectModal, edit: false });
  };

  editProject = (data) => {
    this.setState({ editData: data, edit: true }, () => {
      this.toggleProjectModal(); // Open the modal for editing
    });
  };

  handleAdd = async (projectData) => {
    try {
      await axios.post("/api/v1/project/addProjects", projectData);
      this.fetchProjects(); // Refresh projects after adding
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  handleUpdate = async (projectData) => {
    try {
      await axios.patch(
        `/api/v1/project/updateProjects/${projectData.id}`,
        projectData
      );
      this.fetchProjects(); // Refresh projects after updating
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  deleteProject = async (idx) => {
    try {
      const project = this.state.projectList[idx];
      await axios.delete(`/api/v1/project/deleteProjects/${project.id}`);
      this.fetchProjects(); // Refresh projects after deletion
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  render() {
    return (
      <div className="container-fluid customMargin">
        <div className="row" style={{ marginBottom: "1.5rem" }}>
          <div className="col">
            <ProjectList
              projectList={this.state.projectList}
              projectModal={this.state.projectModal}
              toggleProjectModal={this.toggleProjectModal}
              editProject={this.editProject}
              deleteProject={this.deleteProject}
              editData={this.state.editData}
              edit={this.state.edit}
              handleAdd={this.handleAdd}
              handleUpdate={this.handleUpdate}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default ProjectPage;
