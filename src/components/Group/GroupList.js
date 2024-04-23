import React, { useState, useEffect } from "react";
import axios from "axios";
import AppButton from "../AppButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { faPenToSquare, faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import { faRocketchat } from "@fortawesome/free-brands-svg-icons";
import ModalWindow from "../../utils/ModalWindow";
import GroupAddModal from "./GroupAddModal";

// Helper function to get the token
const getAuthToken = () => {
  // Replace with your method to retrieve the token
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
    const token = getAuthToken(); // Retrieve the token
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/group/groups`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request
          },
        }
      );

      // If response has the expected structure
      const groups = response.data.message; // Assuming message contains the group list
      setGroupList(groups); // Set the group list state
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const toggleAddGroupModal = () => {
    setAddGroupModal(!addGroupModal);
    if (!addGroupModal) {
      setEditData(null); // Reset edit data when opening the modal
      setEdit(false);
    }
  };

  const addGroup = async (groupData) => {
    const token = getAuthToken(); // Retrieve the token
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/groups`,
        groupData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request
          },
        }
      );

      if (response.status === 201) {
        setGroupList([...groupList, response.data.message]); // Add the new group to the list
        toggleAddGroupModal(); // Close modal after adding
      }
    } catch (error) {
      console.error("Error adding group:", error);
    }
  };

  const editGroup = (group) => {
    setEdit(true);
    setEditData(group); // Set the data for editing
    toggleAddGroupModal(); // Open the modal for editing
  };

  const deleteGroup = async (groupId) => {
    const token = getAuthToken(); // Retrieve the token
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/group/groups/${groupId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request
          },
        }
      );
      setGroupList(groupList.filter((group) => group._id !== groupId)); // Remove the group from the list
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  const handleAddGroup = (groupData) => {
    if (edit) {
      // Handle update logic
      const updatedGroupList = groupList.map((group) =>
        group._id === editData._id ? { ...editData, ...groupData } : group
      );
      setGroupList(updatedGroupList);
    } else {
      addGroup(groupData); // Call addGroup for new group
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
                <td className="tableData" width={"20%"}>
                  {group.name}
                </td>
                <td>
                  {/* Display the instructor name or a placeholder */}
                  {group.instructor ? group.instructor.name : "N/A"}
                </td>
                <td>
                  {/* Display student names */}
                  {group.students.map((student) => (
                    <div key={student._id}>{student.name}</div>
                  ))}
                </td>
                <td>
                  {/* Display project titles */}
                  {group.projects.map((project) => (
                    <div key={project._id}>{project.title}</div>
                  ))}
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
                    |
                    <FontAwesomeIcon
                      icon={faRocketchat}
                      className="actionIcons chatIcon"
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

      <div className="d-flex justify-content-end">
        <AppButton name="View All" customStyle="btnColorSecondary" />
      </div>

      <ModalWindow
        modal={addGroupModal}
        toggleModal={toggleAddGroupModal}
        modalHeader={edit ? "Update Group" : "Add New Group"}
        size="lg"
        modalBody={
          <GroupAddModal
            edit={edit}
            editData={editData}
            onSubmit={handleAddGroup}
          />
        }
      />
    </div>
  );
};

export default GroupList;
