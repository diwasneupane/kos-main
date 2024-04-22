import React, { Component } from "react";
import InstructorList from "../components/Instructor/InstructorList";
import userImg from "../assets/images/userImg.jpg";
import userImg1 from "../assets/images/userImg2.jpg";
import CustomFullSpinner from "../utils/CustomFullSpinner";

class InstructorPage extends Component {
  state = {
    instructorList: [
      {
        name: "Jane Doe",
        image: userImg,
        email: "abc@gmail.com",
        phone: "9876543210",
      },
      {
        name: "John Doe",
        image: userImg1,
        email: "abc22@gmail.com",
        phone: "9876534210",
      },
      {
        name: "Suman Khatri",
        image: userImg,
        email: "suman@gmail.com",
        phone: "9876329190",
      },
    ],
    instructorModal: false,
    editData: null,
    edit: false,
  };

  toggleInstructorModal = () => {
    this.setState({
      instructorModal: !this.state.instructorModal,
      edit: false,
    });
  };

  deleteInstructor = (idx) => {
    let instructorList = [...this.state.instructorList];
    instructorList.splice(idx, 1);
    this.setState({ instructorList: instructorList });
  };

  editInstructor = (data) => {
    this.setState({ editData: data, edit: true }, () => {
      this.setState({ instructorModal: !this.state.instructorModal });
    });
  };

  render() {
    return (
      <div className="container-fluid customMargin">
        <div className="row" style={{ marginBottom: "1.5rem" }}>
          <div className="col">
            <InstructorList
              instructorList={this.state.instructorList}
              instructorModal={this.state.instructorModal}
              toggleInstructorModal={this.toggleInstructorModal}
              deleteInstructor={this.deleteInstructor}
              editInstructor={this.editInstructor}
              editData={this.state.editData}
              edit={this.state.edit}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default InstructorPage;
