import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const GroupDetailsWithDropdown = () => {
  const [groupList, setGroupList] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupDetails, setGroupDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchGroupList = async () => {
    const serverUrl = process.env.REACT_APP_API_BASE_URL;
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(`${serverUrl}/group/groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGroupList(response.data.message);
    } catch (error) {
      console.error("Error fetching group list:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while fetching the group list.",
      });
    }
  };

  const fetchGroupDetails = async (groupId) => {
    const serverUrl = process.env.REACT_APP_API_BASE_URL;
    const token = localStorage.getItem("authToken");
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${serverUrl}/group/groups/${groupId}/members`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setGroupDetails(response.data.message);
    } catch (error) {
      console.error("Error fetching group details:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while fetching group details.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupList();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupDetails(selectedGroup);
    }
  }, [selectedGroup]);

  return (
    <div
      style={{ padding: "20px", backgroundColor: "#fff" }}
      className="dataContainerBox"
    >
      <h2 style={{ marginBottom: "20px" }}>Select a Group to View Details</h2>
      <select
        value={selectedGroup}
        onChange={(e) => setSelectedGroup(e.target.value)}
        style={{
          padding: "10px",
          borderRadius: "5px",
          marginBottom: "20px",
          backgroundColor: "#fff",
          border: "1px solid #ddd",
        }}
      >
        <option value="">-- Select a Group --</option>
        {groupList.map((group) => (
          <option key={group._id} value={group._id}>
            {group.name}
          </option>
        ))}
      </select>

      {isLoading && (
        <div style={{ fontSize: "1.2em" }}>Loading group details...</div>
      )}

      {groupDetails && (
        <div>
          <h3>Group: {groupDetails.name}</h3>
          <p>Instructor: {groupDetails.instructor?.username || "N/A"}</p>

          <h4>Members</h4>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#fff",
              borderRadius: "5px",
              overflow: "hidden",
            }}
          >
            <thead>
              <tr
                style={{
                  textAlign: "center",
                  backgroundColor: "#eaeaea",
                  fontWeight: "bold",
                }}
              >
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Member Name
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Student ID
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {groupDetails.students.length > 0 ? (
                groupDetails.students.map((student) => (
                  <tr key={student._id} style={{ textAlign: "center" }}>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {student.fullName || student.username}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {student.studentId}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        border: "1px solid #ddd",
                        color: student.isApproved ? "green" : "red",
                      }}
                    >
                      {student.isApproved ? "Approved" : "Not Approved"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    style={{ padding: "10px", border: "1px solid #ddd" }}
                  >
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GroupDetailsWithDropdown;
