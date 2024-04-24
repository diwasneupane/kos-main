import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faSearch } from "@fortawesome/free-solid-svg-icons";

const GroupDetailsWithSearch = () => {
  const [groupList, setGroupList] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupDetails, setGroupDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageContent, setMessageContent] = useState("");
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

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
        `${serverUrl}/send-message-to-user`,
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
        title: "Message Sent",
        text: `Message sent to ${
          selectedUser.fullName || selectedUser.username
        }.`,
      });
      setMessageContent(""); // Reset the message content
      setSelectedUser(null);
      setUnreadMessageCount((count) => count + 1); // Increase unread message count
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to send message. Please try again.",
      });
    }
  };

  const handleSendMessageClick = (user) => {
    setSelectedUser(user);
    Swal.fire({
      title: `Send Message to ${user.fullName || user.username}`,
      input: "text",
      inputPlaceholder: "Type your message here...",
      confirmButtonText: "Send",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        setMessageContent(result.value);
        handleSendMessage();
      }
    });
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
          border: "1px solid #ddd",
          marginBottom: "20px",
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
            <p>Instructor: {groupDetails.instructor?.username || "N/A"}</p>
            <button
              onClick={() => handleSendMessageClick(groupDetails.instructor)}
              style={{
                padding: "10px",
                backgroundColor: "#2196F3",
                color: "#fff",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
              }}
            >
              <FontAwesomeIcon icon={faPaperPlane} />
              Send Message
            </button>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members..."
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ddd",
              marginBottom: "20px",
              width: "100%",
            }}
          />

          <h4>Members</h4>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              borderRadius: "5px",
              backgroundColor: "#fff",
            }}
          >
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Student ID</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {groupDetails.students &&
                groupDetails.students.map((student) => (
                  <tr key={student._id}>
                    <td>{student.fullName || student.username}</td>
                    <td>{student.studentId}</td>
                    <td style={{ color: student.isApproved ? "green" : "red" }}>
                      {student.isApproved ? "Approved" : "Not Approved"}
                    </td>
                    <td>
                      <button
                        onClick={() => handleSendMessageClick(student)}
                        style={{
                          padding: "10px",
                          backgroundColor: "#4CAF50",
                          borderRadius: "5px",
                          border: "none",
                          color: "#fff",
                          cursor: "pointer",
                        }}
                      >
                        <FontAwesomeIcon icon={faPaperPlane} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GroupDetailsWithSearch;
