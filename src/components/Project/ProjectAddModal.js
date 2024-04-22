import React, { Component } from "react";
import AppButton from "../AppButton";
import axios from "axios";
import { getAuthToken } from "../../utils/Auth"; // Assuming this function retrieves the token

class ProjectAddModal extends Component {
  state = {
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "Pending",
    loading: false,
    error: null,
  };

  componentDidMount() {
    if (this.props.edit) {
      this.initializeEditData();
    }
  }

  initializeEditData = () => {
    const { editData } = this.props;
    if (editData) {
      this.setState({
        title: editData.title,
        description: editData.description,
        startDate: editData.startDate,
        endDate: editData.endDate,
        status: editData.status,
      });
    }
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  validateForm = () => {
    const { title, description, startDate, endDate } = this.state;
    if (!title || !description || !startDate || !endDate) {
      return "All fields must be filled out.";
    }
    if (new Date(startDate) > new Date(endDate)) {
      return "End date must be after the start date.";
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
      const {
        edit,
        handleAdd,
        handleUpdate,
        onClose,
        editData,
        refreshProjects,
      } = this.props;

      if (edit) {
        await handleUpdate({
          ...this.state,
          id: editData._id, // Make sure to pass a valid ID for updates
        });
      } else {
        await handleAdd(this.state); // Call handleAdd from parent component
        if (refreshProjects) {
          refreshProjects(); // Refresh the project list after a successful add
        }
      }

      if (onClose) {
        onClose(); // Close modal on successful submission
      }
    } catch (err) {
      console.error("Error during submission:", err);
      this.setState({
        error: "Failed to submit the project. Please try again.",
      });
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

        <div className="row mb-2">
          <div className="col-md-3">
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

        <div className="row mb-2">
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
