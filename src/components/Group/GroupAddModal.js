import React, { Component } from "react";
import AppButton from "../AppButton";

class GroupAddModal extends Component {
  state = {
    groupName: "",
    instructor: "",
    leader: "",
    phone: "",
    email: "",
    groupDescription: "",
  };

  handleChange = (e) => {
    let { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSubmit = () => {
    //API call to store group
  };

  handleUpdate = () => {
    //API call to update group
  };

  componentDidMount = () => {
    if (this.props.edit) {
      this.configData();
    }
  };

  configData = () => {
    let editData = this.props.editData;
    this.setState({
      groupName: editData.groupName,
      instructor: editData.instructor.id,
      leader: editData.leader.id,
      phone: editData.leader.phone,
      email: editData.leader.email,
      groupDescription: "",
    });
  };

  render() {
    return (
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-md-3 mt-1">
            <strong>Group Name</strong>
          </div>
          <div className="col-md-9">
            <input
              type="text"
              className="form-control"
              name="groupName"
              value={this.state.groupName}
              onChange={this.handleChange}
            />
          </div>
        </div>
        <div className="row mb-2">
          <div className="col-md-3 mt-1">
            <strong>Group Description</strong>
          </div>
          <div className="col-md-9">
            <textarea
              className="form-control"
              name="groupDescription"
              value={this.state.groupDescription}
              onChange={this.handleChange}
            />
          </div>
        </div>
        <div className="row mb-2">
          <div className="col-md-3 mt-1">
            <strong>Instructor</strong>
          </div>
          <div className="col-md-9">
            <select
              name="instructor"
              value={this.state.instructor}
              onChange={this.handleChange}
              className="form-select"
            >
              <option value="" disabled>
                Choose Instructor
              </option>
              <option value={"1"}>John Doe</option>
              <option value={"2"}>Jane Doe</option>
            </select>
          </div>
        </div>
        <div className="row mb-2">
          <div className="col-md-3 mt-1">
            <strong>Group Leader</strong>
          </div>
          <div className="col-md-9">
            <select
              name="leader"
              value={this.state.leader}
              onChange={this.handleChange}
              className="form-select"
            >
              <option value="" disabled>
                Choose Group Leader
              </option>
              <option value={"1"}>John Doe</option>
              <option value={"2"}>Jane Doe</option>
            </select>
          </div>
        </div>
        <div className="row mb-2">
          <div className="col-md-3 mt-1">
            <strong>Contact Email</strong>
          </div>
          <div className="col-md-9">
            <input
              type="email"
              className="form-control"
              name="email"
              value={this.state.email}
              onChange={this.handleChange}
            />
          </div>
        </div>
        <div className="row mb-4">
          <div className="col-md-3 mt-1">
            <strong>Contact Phone</strong>
          </div>
          <div className="col-md-9">
            <input
              type="text"
              className="form-control"
              name="phone"
              value={this.state.phone}
              onChange={this.handleChange}
            />
          </div>
        </div>
        <div className="d-flex justify-content-end">
          <AppButton
            name="Submit"
            customStyle="btnColorSecondary"
            onChange={this.props.edit ? this.handleUpdate : this.handleSubmit}
          />
        </div>
      </div>
    );
  }
}

export default GroupAddModal;
