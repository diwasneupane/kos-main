import React, { useEffect, useState } from "react";
import axios from "axios";
import AppButton from "../components/AppButton";
import Swal from "sweetalert2";

const MembersPage = ({ groupId }) => {
  const [group, setGroup] = useState(null);

  useEffect(() => {
    fetchGroupDetails(groupId);
  }, [groupId]);

  const fetchGroupDetails = async (id) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/group/groups/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setGroup(response.data.message); // Update with group data
    } catch (error) {
      console.error("Error fetching group details:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while fetching group details.",
      });
    }
  };

  if (!group) {
    return <p>Loading...</p>;
  }

  return (
    <div className="dataContainerBox">
      <h2>Group: {group.name}</h2>
      <p>Instructor: {group.instructor ? group.instructor.username : "N/A"}</p>
      <h3>Members</h3>
      <table className="table customTable">
        <thead>
          <tr>
            <th>Member Name</th>
            <th>Status</th>
            <th>Flag</th>
          </tr>
        </thead>
        <tbody>
          {group.students.map((student) => (
            <tr key={student._id}>
              <td>{student.username}</td>
              <td>{student.isActive ? "Active" : "Inactive"}</td>
              <td>{student.flagStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MembersPage;
