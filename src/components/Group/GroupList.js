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
import Swal from "sweetalert2";
import Switch from "react-switch";

const getAuthToken = () => localStorage.getItem("authToken");

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
      setGroupList(response.data.message);
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
  };
  const toggleAtRiskStatus = async (groupId, currentAtRisk) => {
    const newAtRiskStatus = !currentAtRisk; // Toggle the current status
    const token = getAuthToken();

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/group/groups/${groupId}/flag-at-risk`,
        { atRisk: newAtRiskStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Update the group list
        const updatedGroupList = groupList.map((group) =>
          group._id === groupId ? { ...group, atRisk: newAtRiskStatus } : group
        );
        setGroupList(updatedGroupList);

        // Add a notification for the at-risk change
        addNotification({
          type: "at-risk",
          message: `Group "${
            groupList.find((g) => g._id === groupId).name
          }" has been flagged as ${
            newAtRiskStatus ? "at risk" : "not at risk"
          }.`,
          date: new Date(),
        });

        Swal.fire({
          icon: "success",
          title: "Status Updated",
          text: "The group's 'at risk' status has been updated!",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while toggling the 'at risk' status.",
      });
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
      const response = await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/group/groups/${editData._id}`,
        groupData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Full response:", response);
      if (response && response.status === 200) {
        const updatedGroupList = groupList.map((group) =>
          group._id === editData._id ? { ...response.data.message } : group
        );
        setGroupList(updatedGroupList);

        toggleAddGroupModal();

        Swal.fire({
          icon: "success",
          title: "Group Updated",
          text: "The group has been updated successfully!",
        });
      } else {
        console.error("Unexpected response or status:", response);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Unexpected response from server.",
        });
      }
    } catch (error) {
      console.error("Error updating group:", error);
      Swal.fire({
        icon: "error",
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

  const addNotification = (notification) => {
    const storedNotifications = localStorage.getItem("notifications");
    const existingNotifications = storedNotifications
      ? JSON.parse(storedNotifications)
      : [];
    const updatedNotifications = [...existingNotifications, notification];
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
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
        <thead className="text-center">
          <tr>
            <th className="w-20%">Group Name</th>
            <th className="w-20%">Instructor</th>
            <th className="w-20%">Students</th>
            <th className="w-20%">Projects</th>
            <th className="w-20%">Actions</th>
          </tr>
        </thead>
        <tbody>
          {groupList.length > 0 ? (
            groupList.map((group) => (
              <tr key={group._id} className="text-center ">
                <td className="tableData">{group.name}</td>
                <td>{group.instructor ? group.instructor.username : "N/A"}</td>
                <td>
                  {group.students.map((student) => student.username).join(", ")}
                </td>
                <td>
                  {group.projects.map((project) => project.title).join(", ")}
                </td>
                <td>
                  <div className="d-flex justify-content-around align-items-center">
                    <Switch
                      onChange={() =>
                        toggleAtRiskStatus(group._id, group.atRisk)
                      }
                      checked={group.atRisk}
                      boxShadow="0px 1px 5px rgba(0, 0, 0, 0.5)"
                      offColor="#2DBFCD" // Aesthetic choice for 'off' state
                      onColor="#FFA500" // Aesthetic choice for 'on' state
                      uncheckedIcon={false} // Hides the icons for simplicity
                      checkedIcon={false}
                      height={18}
                      width={36}
                    />
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      className="actionIcons editIcon"
                      onClick={() => editGroup(group)}
                    />
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      className="actionIcons deleteIcon"
                      onClick={() => deleteGroup(group._id)}
                    />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center">
                No groups found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <ModalWindow
        modal={addGroupModal}
        toggleModal={toggleAddGroupModal} // This is correct
        modalHeader={edit ? "Edit Group" : "Add Group"}
        size="lg"
        modalBody={
          <GroupAddModal
            edit={edit}
            editData={editData}
            toggleModal={toggleAddGroupModal} // Make sure this is passed
            onSubmit={edit ? handleEditGroup : addGroup} // Ensure correct handling
            onGroupAdded={fetchGroupList} // If there's a prop for after a group is added
          />
        }
      />
    </div>
  );
};

export default GroupList;
