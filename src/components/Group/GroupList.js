import React, { useState, useEffect } from "react";
import axios from "axios";
import AppButton from "../AppButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPenToSquare,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import ModalWindow from "../../utils/ModalWindow";
import GroupAddModal from "./GroupAddModal";
import Swal from "sweetalert2"; // Import SweetAlert2 for alerts

// Helper function to get the token
const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

const GroupList = () => {
  const [groupList, setGroupList] = useState([]);
  const [addGroupModal, setAddGroupModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    fetchGroupList();
  }, []);

  const fetchGroupList = async () => {
    const token = getAuthToken();
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/group/groups`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setGroupList(response.data.message); // Assuming "message" contains the group list
    } catch (error) {
      console.error("Error fetching groups:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while fetching the group list.",
      });
    }
  };

  const toggleAddGroupModal = () => {
    setAddGroupModal(!addGroupModal);
    if (!addGroupModal) {
      setEditData(null);
      setEdit(false);
    }
  };

  const addGroup = async (groupData) => {
    const token = getAuthToken();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/group/group`,
        groupData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        setGroupList([...groupList, response.data.message]);
        toggleAddGroupModal(); // Close the modal after adding
      }
    } catch (error) {
      console.error("Error adding group:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while adding the group.",
      });
    }
  };

  const editGroup = (group) => {
    setEdit(true);
    setEditData(group);
    toggleAddGroupModal(); // Open the modal for editing
  };

  const handleEditGroup = async (groupData) => {
    const token = getAuthToken();
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/group/groups/${editData._id}`,
        groupData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const updatedGroupList = groupList.map((group) =>
          group._id === editData._id ? { ...response.data.message } : group
        );
        setGroupList(updatedGroupList);

        toggleAddGroupModal(); // Close the modal

        Swal.fire({
          icon: "success",
          title: "Group Updated",
          text: "The group has been updated successfully!",
        });
      }
    } catch (error) {
      console.error("Error updating group:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while updating the group.",
      });
    }
  };

  const deleteGroup = async (groupId) => {
    const token = getAuthToken();
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/group/groups/${groupId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setGroupList(groupList.filter((group) => group._id !== groupId));

        Swal.fire({
          icon: "success",
          title: "Group Deleted",
          text: "The group has been deleted successfully!",
        });
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while deleting the group.",
      });
    }
  };

  return (
    <div className="dataContainerBox">
      <AppButton
        name="Add Group"
        customStyle="addBtnColor"
        icon={faPlus}
        onClick={toggleAddGroupModal}
      />
      <table className="table customTable mt-3">
        <thead>
          <tr>
            <th>Group Name</th>
            <th>Instructor</th>
            <th>Students</th>
            <th>Projects</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {groupList.length > 0 ? (
            groupList.map((group) => (
              <tr key={group._id}>
                <td className="tableData">{group.name}</td>
                <td>{group.instructor ? group.instructor.username : "N/A"}</td>
                <td>
                  {group.students.map((student) => student.username).join(", ")}
                </td>
                <td>
                  {group.projects.map((project) => project.title).join(", ")}
                </td>
                <td>
                  <span className="d-flex justify-content-between">
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      className="actionIcons editIcon"
                      onClick={() => editGroup(group)}
                    />
                    |
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      className="actionIcons deleteIcon"
                      onClick={() => deleteGroup(group._id)}
                    />
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>No groups found</td>
            </tr>
          )}
        </tbody>
      </table>

      <ModalWindow
        modal={addGroupModal}
        toggleModal={toggleAddGroupModal}
        modalHeader={edit ? "Edit Group" : "Add Group"}
        size="lg"
        modalBody={
          <GroupAddModal
            edit={edit}
            editData={editData}
            onSubmit={handleEditGroup}
          />
        }
      />
    </div>
  );
};

export default GroupList;
