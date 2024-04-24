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
import { jwtDecode } from "jwt-decode";

const getAuthToken = () => localStorage.getItem("authToken");

const getUserRoleFromToken = () => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const decodedToken = jwtDecode(token);
    const role = decodedToken.role;
    console.log(role);
    return role;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

const GroupList = () => {
  const [groupList, setGroupList] = useState([]);
  const [addGroupModal, setAddGroupModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [edit, setEdit] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const role = getUserRoleFromToken();
    setUserRole(role);
    if (role !== "student") {
      fetchGroupList();
    }
  }, []);

  const fetchGroupList = async () => {
    const token = getAuthToken();
    if (!token) return;

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

  const addGroup = async (groupData) => {
    const token = getAuthToken();
    if (!token || userRole === "student") return;

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
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while adding the group.",
      });
    }
  };

  const editGroup = (group) => {
    if (userRole === "student") return;
    setEdit(true);
    setEditData(group);
    toggleAddGroupModal(); // Open the modal for editing
  };

  const handleEditGroup = async (groupData) => {
    const token = getAuthToken();
    if (!token || userRole === "student") return;

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

      if (response.status === 200) {
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
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: "An error occurred while updating the group.",
      });
    }
  };

  const deleteGroup = async (groupId) => {
    const token = getAuthToken();
    if (!token || userRole === "student") return;

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
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while deleting the group.",
      });
    }
  };

  const toggleAtRiskStatus = async (groupId, currentAtRisk) => {
    if (userRole === "student") return;

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
        const updatedGroupList = groupList.map((group) =>
          group._id === groupId ? { ...group, atRisk: newAtRiskStatus } : group
        );
        setGroupList(updatedGroupList);

        Swal.fire({
          icon: "success",
          title: "Status Updated",
          text: "The group's 'at risk' status has been updated!",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: "An error occurred while toggling the 'at risk' status.",
      });
    }
  };

  return (
    <div className="dataContainerBox">
      {userRole !== "student" && ( // Only show if the user is not a student
        <AppButton
          name="Add Group"
          customStyle="addBtnColor"
          icon={faPlus}
          onClick={toggleAddGroupModal}
        />
      )}
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
              <tr key={group._id} className="text-center">
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
                      offColor="#2DBFCD" // 'Off' color
                      onColor="#FFA500" // 'On' color
                      uncheckedIcon={false}
                      checkedIcon={false}
                      height={18}
                      width={36}
                      // style={{
                      //   cursor:
                      //     userRole === "student" ? "not-allowed" : "pointer",
                      // }}
                      disabled={userRole === "student"} // Disable for students
                    />
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      className="actionIcons editIcon"
                      onClick={() => editGroup(group)}
                      style={{
                        cursor:
                          userRole === "student" ? "not-allowed" : "pointer",
                      }}
                      // disabled={userRole === "student"} // Disable for students
                    />
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      className="actionIcons deleteIcon"
                      onClick={() => deleteGroup(group._id)}
                      style={{
                        cursor:
                          userRole === "student" ? "not-allowed" : "pointer",
                      }}
                      disabled={userRole === "student"} // Disable for students
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
        toggleModal={toggleAddGroupModal}
        modalHeader={edit ? "Edit Group" : "Add Group"}
        size="lg"
        modalBody={
          <GroupAddModal
            edit={edit}
            editData={editData}
            toggleModal={toggleAddGroupModal}
            onSubmit={edit ? handleEditGroup : addGroup}
            disabled={userRole === "student"} // Disable for students
          />
        }
      />
    </div>
  );
};

export default GroupList;
