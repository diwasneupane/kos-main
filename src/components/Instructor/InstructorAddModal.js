import React, { Component } from "react";
import AppButton from "../AppButton";

class InstructorAddModal extends Component {
  state = {
    name: "",
    image: "",
    email: "",
    phone: "",
    imagePreview: "",
    imageFile: null,
  };

  componentDidMount() {
    if (this.props.edit) {
      this.configData();
    }
  }

  configData = () => {
    let editData = this.props.editData;
    this.setState({
      name: editData.name,
      email: editData.email,
      phone: editData.phone,
    });
  };

  handleChange = (e) => {
    let { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleImageChange = (e) => {
    if (e.target.files.length > 0) {
      this.setState(
        {
          image: e.target.value,
          imageFile: e.target.files[0],
        },
        function () {
          let image = URL.createObjectURL(this.state.imageFile);
          this.setState({ imagePreview: image });
        }
      );
    }
  };

  handleSubmit = () => {
    //API call to store group
  };

  handleUpdate = () => {
    //API call to update group
  };

  removeImage = () => {
    this.setState({
      imagePreview: "",
      imageFile: null,
      image: "",
    });
  };

  render() {
    return (
      <div className="container-fluid">
        {this.state.imagePreview ? (
          <div className="row mb-4">
            <div className="col d-flex justify-content-center">
              <div className="userPhotoHolder">
                <img
                  src={this.state.imagePreview}
                  className="userPhoto"
                  alt="User"
                />
              </div>
            </div>
          </div>
        ) : null}
        <div className="row mb-2">
          <div className="col-md-3 mt-1">
            <strong>Image</strong>
          </div>
          <div className="col-md-9">
            {this.state.imagePreview ? (
              <div className="d-flex">
                <input
                  className="form-control"
                  disabled
                  type="text"
                  value={this.state.image}
                />
                <AppButton
                  name="Remove"
                  customStyle="removeBtn"
                  onClick={this.removeImage}
                />
              </div>
            ) : (
              <input
                accept="image/png, image/jpeg"
                className="form-control"
                name="image"
                onChange={this.handleImageChange}
                type="file"
                value={this.state.image}
              />
            )}
          </div>
        </div>
        <div className="row mb-2">
          <div className="col-md-3 mt-1">
            <strong>Full Name</strong>
          </div>
          <div className="col-md-9">
            <input
              type="text"
              className="form-control"
              name="name"
              value={this.state.name}
              onChange={this.handleChange}
            />
          </div>
        </div>
        <div className="row mb-2">
          <div className="col-md-3 mt-1">
            <strong>Email</strong>
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
            <strong>Phone</strong>
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

export default InstructorAddModal;
