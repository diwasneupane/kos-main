import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import UserMessage from "../utils/MessageBox";

const GroupDetailsWithSearch = () => {
  const [groupList, setGroupList] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupDetails, setGroupDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageContent, setMessageContent] = useState("");
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [showMessageModal, setShowMessageModal] = useState(false);

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

  const handleSendMessage = async (userId) => {
    try {
      await axios.post(
        `${serverUrl}/message/send-message-to-user`,
        {
          receiverId: userId,
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

  const handleOpenMessageModal = (user) => {
    setSelectedUser(user);
    setMessageContent(""); // Reset message content
    setShowMessageModal(true);
  };

  const handleSearch = (array, query) => {
    return array.filter((item) =>
      item.username.toLowerCase().includes(query.toLowerCase())
    );
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
        <div>
          <h3>Group: {groupDetails.name}</h3>
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
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {groupDetails.instructors &&
                handleSearch(groupDetails.instructors, searchQuery).map(
                  (instructor) => (
                    <tr key={instructor._id}>
                      <td>{instructor.username}</td>
                      <td>Instructor</td>
                      <td>
                        <FontAwesomeIcon
                          icon={faPaperPlane}
                          style={{ color: "#2196F3", cursor: "pointer" }}
                          onClick={() => handleOpenMessageModal(instructor)}
                        />
                      </td>
                    </tr>
                  )
                )}
              {groupDetails.students &&
                handleSearch(groupDetails.students, searchQuery).map(
                  (student) => (
                    <tr key={student._id}>
                      <td>{student.username}</td>
                      <td>Student</td>
                      <td>
                        <FontAwesomeIcon
                          icon={faPaperPlane}
                          style={{ color: "#2196F3", cursor: "pointer" }}
                          onClick={() => handleOpenMessageModal(student)}
                        />
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <UserMessage
          user={selectedUser}
          onClose={() => setShowMessageModal(false)}
          onSendMessage={handleSendMessage}
          messageContent={messageContent}
          setMessageContent={setMessageContent}
        />
      )}
    </div>
  );
};

export default GroupDetailsWithSearch;
