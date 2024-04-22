import React, { Component } from "react";
import AppButton from "../AppButton";
import axios from "axios";

class ProjectAddModal extends Component {
  state = {
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "Pending", // Default status
    loading: false, // To manage loading state
    error: null, // To manage error feedback
  };

  componentDidMount() {
    if (this.props.edit) {
      this.configData();
    }
  }

  configData = () => {
    let editData = this.props.editData;
    this.setState({
      title: editData.title,
      description: editData.description,
      startDate: editData.startDate,
      endDate: editData.endDate,
      status: editData.status,
    });
  };

  handleChange = (e) => {
    let { name, value } = e.target;
    this.setState({ [name]: value });
  };

  validateForm = () => {
    const { title, description, startDate, endDate } = this.state;
    if (!title || !description || !startDate || !endDate) {
      return "All fields must be filled out.";
    }
    if (new Date(startDate) > new Date(endDate)) {
      return "End date must be after start date.";
    }
    return null;
  };

  handleSubmit = async () => {
    const error = this.validateForm();
    if (error) {
      this.setState({ error });
      return;
    }

    this.setState({ loading: true, error: null });

    try {
      if (this.props.edit) {
        await this.props.handleUpdate(this.state);
      } else {
        await axios.post(
          " http://localhost:3000/api/v1/project/addProjects",
          this.state
        );
        this.props.refreshProjects(); // Callback to refresh project list
      }
      this.props.onClose(); // Close modal on success
    } catch (err) {
      console.error(err); // Log error for debugging
      this.setState({ error: "Failed to save the project. Please try again." });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { loading, error } = this.state;

    return (
      <div className="container-fluid">
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row mb-2">
          <div className="col-md-3">
            <strong>Project Title</strong>
          </div>
          <div className="col-md-9">
            <input
              type="text"
              className="form-control"
              name="title"
              value={this.state.title}
              onChange={this.handleChange}
            />
          </div>
        </div>

        <div className="row mb-2">
          <div className="col-md-3">
            <strong>Description</strong>
          </div>
          <div className="col-md-9">
            <textarea
              className="form-control"
              name="description"
              value={this.state.description}
              onChange={this.handleChange}
            />
          </div>
        </div>

        <div class="row mb-2">
          <div class="col-md-3">
            <strong>Start Date</strong>
          </div>
          <div class="col-md-9">
            <input
              type="date"
              className="form-control"
              name="startDate"
              value={this.state.startDate}
              onChange={this.handleChange}
            />
          </div>
        </div>

        <div class="row mb-2">
          <div class="col-md-3">
            <strong>End Date</strong>
          </div>
          <div class="col-md-9">
            <input
              type="date"
              className="form-control"
              name="endDate"
              value={this.state.endDate}
              onChange={this.handleChange}
            />
          </div>
        </div>

        <div class="row mb-2">
          <div class="col-md-3">
            <strong>Status</strong>
          </div>
          <div class="col-md-9">
            <select
              className="form-control"
              name="status"
              value={this.state.status}
              onChange={this.handleChange}
            >
              <option value="Pending">Pending</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="d-flex justify-content-end">
          <AppButton
            name={loading ? "Submitting..." : "Submit"}
            customStyle="btnColorSecondary"
            onClick={this.handleSubmit}
            disabled={loading}
          />
        </div>
      </div>
    );
  }
}

export default ProjectAddModal;
