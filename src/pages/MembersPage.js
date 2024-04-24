import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faSearch } from "@fortawesome/free-solid-svg-icons";

const GroupDetailsWithSearch = ({ currentUser }) => {
  const [groupList, setGroupList] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupDetails, setGroupDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const serverUrl = process.env.REACT_APP_API_BASE_URL;
  const token = localStorage.getItem("authToken");

  const fetchGroupList = async () => {
    try {
      const response = await axios.get(`${serverUrl}/group/groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGroupList(response.data.message || []);
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
      setGroupDetails(response.data.message || {});
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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredMembers = groupDetails
    ? groupDetails.students.filter((student) =>
        student.fullName
          ? student.fullName.toLowerCase().includes(searchQuery.toLowerCase())
          : true
      )
    : [];

  const handleSendMessage = async () => {
    if (!selectedUser || !messageContent.trim()) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please select a user and enter a message.",
      });
      return;
    }

    try {
      await axios.post(
        `${serverUrl}/message/send`,
        {
          receiverId: selectedUser._id,
          content: messageContent,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Message sent successfully.",
      });
      setMessageContent("");
      setSelectedUser(null);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to send message.",
      });
    }
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#fff" }}>
      <h2>Select a Group to View Details</h2>
      <select
        value={selectedGroup}
        onChange={(e) => setSelectedGroup(e.target.value)}
        style={{
          padding: "10px",
          borderRadius: "5px",
          marginBottom: "20px",
          backgroundColor: "#fff",
          border: "1px solid #ddd",
          color: "#333",
        }}
      >
        <option value="">-- Select a Group --</option>
        {groupList.map((group) => (
          <option key={group._id} value={group._id}>
            {group.name}
          </option>
        ))}
      </select>

      {isLoading && <div>Loading group details...</div>}

      {groupDetails && (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "20px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h3>Group: {groupDetails.name}</h3>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <p>Instructor: {groupDetails.instructor?.username || "N/A"}</p>
            </div>
            <div>
              <button
                onClick={() => {
                  setSelectedUser(groupDetails.instructor);
                  Swal.fire({
                    title: "Send Message",
                    html: `
                    <input type="text" placeholder="Your message..." id="message" class="swal2-input" value="${messageContent}">
                  `,
                    preConfirm: () => {
                      const input = Swal.getPopup().querySelector("#message");
                      if (input.value) {
                        setMessageContent(input.value);
                      }
                    },
                    confirmButtonText: "Send",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      handleSendMessage();
                    }
                  });
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#2196F3",
                  color: "#fff",
                  borderRadius: "5px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <FontAwesomeIcon icon={faPaperPlane} /> Send Message
              </button>
            </div>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search members..."
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ddd",
              marginBottom: "20px",
              width: "100%",
              fontSize: "16px",
            }}
          />

          <h4>Members</h4>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              borderRadius: "5px",
              backgroundColor: "#fff",
              overflow: "hidden",
            }}
          >
            <thead>
              <tr
                style={{
                  textalign: "center",
                  backgroundColor: "#eaeaea",
                  fontWeight: "bold",
                }}
              >
                <th>Member Name</th>
                <th>Student ID</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((student) => (
                  <tr key={student._id}>
                    <td>{student.fullName || student.username}</td>
                    <td>{student.studentId}</td>
                    <td style={{ color: student.isApproved ? "green" : "red" }}>
                      {student.isApproved ? "Approved" : "Not Approved"}
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedUser(student);
                          Swal.fire({
                            title: "Send Message",
                            html: `
                                <input type="text" placeholder="Your message..." id="message" class="swal2-input" value="${messageContent}">
                              `,
                            preConfirm: () => {
                              const input =
                                Swal.getPopup().querySelector("#message");
                              if (input.value) {
                                setMessageContent(input.value);
                              }
                            },
                            confirmButtonText: "Send",
                          }).then((result) => {
                            if (result.isConfirmed) {
                              handleSendMessage();
                            }
                          });
                        }}
                        style={{
                          padding: "10px",
                          backgroundColor: "#4CAF50",
                          borderRadius: "5px",
                          border: "none",
                          color: "#fff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <FontAwesomeIcon icon={faPaperPlane} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
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

export default GroupDetailsWithSearch;
