import React, { Component } from "react";
import userImg from "../assets/images/userImg.jpg";
import userImg1 from "../assets/images/userImg2.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCameraAlt,
  faEllipsis,
  faPaperclip,
} from "@fortawesome/free-solid-svg-icons";
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import moment from "moment";

class MembersPage extends Component {
  state = {
    groupList: [
      {
        groupName: "Group B",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam facilisis mi vitae ex accumsan laoreet. Fusce dapibus fringilla feugiat. Vestibulum sed tristique orci. Pellentesque pretium felis ut congue consequat. Ut et nisi est. Proin eget nisl interdum, sagittis ex sed, viverra quam. Fusce semper placerat felis, at egestas ligula",
        members: [
          {
            name: "Suman",
            image: userImg,
            userType: "Instructor",
          },
          {
            name: "User 1",
            image: userImg1,
            userType: "Student",
          },

          {
            name: "John Doe",
            image: userImg,
            userType: "Student",
          },
        ],
      },
      {
        groupName: "Group A",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam facilisis mi vitae ex accumsan laoreet. Fusce dapibus fringilla feugiat. Vestibulum sed tristique orci. Pellentesque pretium felis ut congue consequat. Ut et nisi est. Proin eget nisl interdum, sagittis ex sed, viverra quam. Fusce semper placerat felis, at egestas ligula",
        members: [
          {
            name: "Jane Doe",
            image: userImg1,
            userType: "Instructor",
          },
          {
            name: "Avilash",
            image: userImg,
            userType: "Student",
          },

          {
            name: "Suman",
            image: userImg1,
            userType: "Admin",
          },
        ],
      },
    ],
    groupChat: [
      {
        user: "Me",
        userId: 1,
        message: "Hello Everyone",
        userImg: userImg,
        date: "2024-03-24T10:12:50.500Z",
      },
      {
        user: "John Doe",
        userId: 13,
        message: "Hello Sir. How are you ?",
        userImg: userImg,
        date: "2024-03-24T10:12:50.500Z",
      },
      {
        user: "Suman",
        userId: 12,
        message: "Hello",
        userImg: userImg,
        date: "2024-03-25T10:12:50.500Z",
      },
      {
        user: "Me",
        userId: 1,
        message: "There will be a small meeting regarding your work today.",
        userImg: userImg,
        date: "2024-03-24T10:12:50.500Z",
      },
    ],
    selectedGroup: "",
    message: "",
    selectedGroupObject: null,
  };

  handleChange = (e) => {
    let { name, value } = e.target;
    this.setState({ [name]: value }, () => {
      if (name === "selectedGroup") {
        let choosenGroup = this.state.groupList.filter(
          (el) => el.groupName === value
        );
        this.setState({ selectedGroupObject: choosenGroup[0] });
      }
    });
  };

  componentDidMount() {
    this.config();
  }

  config = () => {
    this.setState({ selectedGroupObject: this.state.groupList[0] }, () => {
      this.setState({
        selectedGroup: this.state.selectedGroupObject.groupName,
      });
    });
  };

  render() {
    return (
      <div className="container-fluid customMargin">
        <div className="row">
          <div className="col-md-8">
            <div className="dataContainerBox">
              <div className="d-flex justify-content-between">
                <p className="contentTitle mb-0">{this.state.selectedGroup}</p>
              </div>
              <hr className="messageLine" />
              <div className="fullChatBox">
                {this.state.groupChat.length > 0
                  ? this.state.groupChat.map((message, mIdx) => {
                      if (message.userId === 1) {
                        //later will be changed by user identification
                        return (
                          <div key={mIdx} className="messageRowMine">
                            <div className="text-end">
                              <div className="messageBubble">
                                {message.message}
                              </div>
                              <span className="messageDate me-2">
                                {moment(message.date).fromNow()}
                              </span>
                            </div>
                            <img
                              src={message.userImg}
                              className="userMessageIcon"
                              alt="User message"
                            />
                          </div>
                        );
                      } else {
                        return (
                          <div key={mIdx} className="messageRow">
                            <img
                              src={message.userImg}
                              className="userMessageIcon"
                              alt="User message"
                            />
                            <div className="text-end">
                              <div className="messageBubble1">
                                <span>{message.user}</span>
                                <br></br>
                                {message.message}
                              </div>
                              <span className="messageDate">
                                {moment(message.date).fromNow()}
                              </span>
                            </div>
                          </div>
                        );
                      }
                    })
                  : null}
              </div>
              <hr className="messageLine" />
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faPaperclip} className="chatIcons" />
                <div style={{ flex: 1, margin: "0 10px" }}>
                  <input
                    type="text"
                    name="message"
                    value={this.state.message}
                    onChange={this.handleChange}
                    className="form-control"
                    placeholder="Write your message"
                  />
                </div>
                <FontAwesomeIcon icon={faCameraAlt} className="chatIcons" />
                <FontAwesomeIcon icon={faPaperPlane} className="chatIcons" />
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="dataContainerBox" style={{ height: "100%" }}>
              <div className="d-flex justify-content-end">
                <div>
                  <select
                    name="selectedGroup"
                    value={this.state.selectedGroup}
                    className="form-select"
                    onChange={this.handleChange}
                  >
                    <option value="" disabled>
                      Choose group
                    </option>
                    {this.state.groupList.length > 0
                      ? this.state.groupList.map((item, idx) => {
                          return (
                            <option value={item.groupName} key={idx}>
                              {item.groupName}
                            </option>
                          );
                        })
                      : "No groups added"}
                  </select>
                </div>
              </div>
              <p className="groupDesc">
                {this.state.selectedGroupObject
                  ? this.state.selectedGroupObject.description
                  : ""}
              </p>
              <div className="accordion" id="accordionExample">
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseOne"
                      aria-expanded="true"
                      aria-controls="collapseOne"
                    >
                      View Photos and Files
                    </button>
                  </h2>
                  <div
                    id="collapseOne"
                    class="accordion-collapse collapse show"
                    data-bs-parent="#accordionExample"
                  >
                    <div class="accordion-body">
                      <strong>This is the first item's accordion body.</strong>{" "}
                      It is shown by default, until the collapse plugin adds the
                      appropriate classes that we use to style each element.
                      These classes control the overall appearance, as well as
                      the showing and hiding via CSS transitions. You can modify
                      any of this with custom CSS or overriding our default
                      variables. It's also worth noting that just about any HTML
                      can go within the <code>.accordion-body</code>, though the
                      transition does limit overflow.
                    </div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseTwo"
                      aria-expanded="false"
                      aria-controls="collapseTwo"
                    >
                      Group Members
                    </button>
                  </h2>
                  <div
                    id="collapseTwo"
                    className="accordion-collapse collapse"
                    data-bs-parent="#accordionExample"
                  >
                    <div className="accordion-body">
                      {this.state.selectedGroupObject
                        ? this.state.selectedGroupObject.members.length > 0
                          ? this.state.selectedGroupObject.members.map(
                              (item, idx) => {
                                return (
                                  <div
                                    key={idx}
                                    className="d-flex justify-content-between mb-3"
                                  >
                                    <div className="d-flex align-items-center">
                                      <img
                                        src={item.image}
                                        alt="member"
                                        className="userMessageIcon me-3"
                                      ></img>
                                      <div>
                                        <p className="memberLabel">
                                          {item.name}
                                        </p>
                                        <p className="memberType">
                                          {item.userType}
                                        </p>
                                      </div>
                                    </div>
                                    <div>
                                      <FontAwesomeIcon
                                        icon={faEllipsis}
                                        className="memberMenu"
                                      />
                                    </div>
                                  </div>
                                );
                              }
                            )
                          : null
                        : null}
                    </div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseThree"
                      aria-expanded="false"
                      aria-controls="collapseThree"
                    >
                      Privacy & Support
                    </button>
                  </h2>
                  <div
                    id="collapseThree"
                    className="accordion-collapse collapse"
                    data-bs-parent="#accordionExample"
                  >
                    <div className="accordion-body">
                      <strong>This is the third item's accordion body.</strong>{" "}
                      It is hidden by default, until the collapse plugin adds
                      the appropriate classes that we use to style each element.
                      These classes control the overall appearance, as well as
                      the showing and hiding via CSS transitions. You can modify
                      any of this with custom CSS or overriding our default
                      variables. It's also worth noting that just about any HTML
                      can go within the <code>.accordion-body</code>, though the
                      transition does limit overflow.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MembersPage;
