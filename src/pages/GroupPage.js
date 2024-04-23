import React, { Component } from "react";
import userImg from "../assets/images/userImg.jpg";
import userImg1 from "../assets/images/userImg2.jpg";
import GroupList from "../components/Group/GroupList";
import GroupMemberList from "../components/Group/GroupMemberList";
import GroupMessage from "../components/Group/GroupMessage";

class GroupPage extends Component {
  state = {
    groupList: [
      {
        groupName: "Group A",
        instructor: {
          name: "John Doe",
          image: userImg,
          id: "1",
        },
        leader: {
          name: "User 5",
          image: userImg1,
          phone: "+12984456",
          email: "abc@gmail.com",
          id: "1",
        },
      },
      {
        groupName: "Group B",
        instructor: {
          name: "Jane Doe",
          image: userImg,
          id: "2",
        },
        leader: {
          name: "User 1",
          image: userImg1,
          phone: "+12984456",
          email: "abc@gmail.com",
          id: "2",
        },
      },
      {
        groupName: "Group C",
        instructor: {
          name: "Mr. Brown",
          image: userImg,
          id: "3",
        },
        leader: {
          name: "John Doe",
          image: userImg1,
          phone: "+12984456",
          email: "abc@gmail.com",
          id: "3",
        },
      },
    ],
    groupMembers: [
      {
        groupName: "Group B",
        members: [
          {
            name: "Suman",
            image: userImg,
            isActive: true,
            flagStatus: "Flag",
          },
          {
            name: "User 1",
            image: userImg1,
            isActive: true,
            flagStatus: "At risk",
          },
          ,
          {
            name: "John Doe",
            image: userImg,
            isActive: true,
            flagStatus: "Flag",
          },
        ],
      },
      {
        groupName: "Group A",
        members: [
          {
            name: "Jane Doe",
            image: userImg1,
            isActive: true,
            flagStatus: "Flag",
          },
          {
            name: "Avilash",
            image: userImg,
            isActive: false,
            flagStatus: "Flag",
          },
          ,
          {
            name: "Suman",
            image: userImg1,
            isActive: false,
            flagStatus: "Flag",
          },
        ],
      },
    ],
    selectedGroup: "",
    message: "",
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
    selectedGroupObject: null,
    addGroupModal: false,
    editData: null,
    edit: false,
  };

  handleChange = (e) => {
    let { name, value } = e.target;
    this.setState({ [name]: value });
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

  toggleAddGroupModal = () => {
    this.setState({ addGroupModal: !this.state.addGroupModal, edit: false });
  };

  deleteGroup = (idx) => {
    let groupList = [...this.state.groupList];
    groupList.splice(idx, 1);
    this.setState({ groupList: groupList });
  };

  editGroup = (data) => {
    this.setState({ editData: data, edit: true }, () => {
      this.setState({ addGroupModal: !this.state.addGroupModal });
    });
  };

  render() {
    return (
      <div className="container-fluid customMargin">
        <div className="row" style={{ marginBottom: "1.5rem" }}>
          <div className="col">
            <GroupList
              groupList={this.state.groupList}
              addGroupModal={this.state.addGroupModal}
              toggleAddGroupModal={this.toggleAddGroupModal}
              deleteGroup={this.deleteGroup}
              editGroup={this.editGroup}
              editData={this.state.editData}
              edit={this.state.edit}
            />
          </div>
        </div>
        <div className="row" style={{ marginBottom: "1.5rem" }}>
          <div className="col-md-6">
            <GroupMemberList groupMembers={this.state.groupMembers} />
          </div>
          <div className="col-md-6">
            <GroupMessage
              groupChat={this.state.groupChat}
              handleChange={this.handleChange}
              selectedGroup={this.state.selectedGroup}
              message={this.state.message}
              groupList={this.state.groupList}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default GroupPage;
