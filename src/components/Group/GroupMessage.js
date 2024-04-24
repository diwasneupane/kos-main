import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faPaperclip } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2"; // For error handling
import moment from "moment";
import userImage1 from "../../assets/images/userImg.jpg"; // User images

const GroupMessage = ({ currentUserId }) => {
  const [groupList, setGroupList] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groupMessages, setGroupMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const serverUrl = process.env.REACT_APP_API_BASE_URL; // Base server URL
  const token = localStorage.getItem("authToken"); // Authorization token

  useEffect(() => {
    fetchGroupList(); // Fetch groups on component mount
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupMessages(selectedGroup); // Fetch messages when a group is selected
    }
  }, [selectedGroup]);

  const fetchGroupList = async () => {
    try {
      const response = await axios.get(`${serverUrl}/group/groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGroupList(response.data.message || []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch groups.",
      });
    }
  };

  const fetchGroupMessages = async (groupId) => {
    setIsLoading(true); // Set loading indicator
    try {
      const response = await axios.get(
        `${serverUrl}/group/groups/${groupId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // The messages are under response.data.message.messages
      const messages = response.data.message.messages.map((msg) => ({
        _id: msg._id,
        content: msg.content,
        sender: {
          _id: msg.sender._id,
          username: msg.sender.username,
        },
        attachment: msg.attachment,
        createdAt: msg.createdAt,
      }));

      setGroupMessages(messages); // Set the group messages in state
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch messages for the selected group.",
      });
    } finally {
      setIsLoading(false); // Reset loading indicator
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Message content cannot be empty.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("groupId", selectedGroup);
    formData.append("content", newMessage);
    formData.append("senderId", currentUserId);

    try {
      const response = await axios.post(
        `${serverUrl}/message/send-message-to-group`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setGroupMessages([...groupMessages, response.data.message]); // Add the new message to the list
      setNewMessage(""); // Clear the message input
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to send the message.",
      });
    }
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#f0f0f0" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>Group Messages</h3>
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "5px",
            backgroundColor: "#fff",
            border: "1px solid #ccc",
          }}
        >
          <option value="" disabled>
            Select a group
          </option>
          {groupList.map((group) => (
            <option key={group._id} value={group._id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div>Loading messages...</div>
      ) : (
        <div
          style={{ maxHeight: "300px", overflowY: "auto", margin: "10px 0" }}
        >
          {groupMessages.length === 0 ? (
            <div>No messages found</div>
          ) : (
            groupMessages.map((message) => (
              <div key={message._id} style={{ margin: "10px 0" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      message.sender._id === currentUserId
                        ? "flex-end"
                        : "flex-start",
                  }}
                >
                  {message.sender._id !== currentUserId && (
                    <img
                      src={userImage1} // Default user image
                      alt="Sender"
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        marginRight: "10px",
                      }}
                    />
                  )}
                  <div
                    style={{
                      backgroundColor:
                        message.sender._id === currentUserId
                          ? "#d1e7dd"
                          : "#f8d7da",
                      padding: "10px",
                      borderRadius: "10px",
                    }}
                  >
                    {message.content}
                    <div
                      style={{
                        fontSize: "0.8em",
                        color: "#666",
                        textAlign: "right",
                      }}
                    >
                      {moment(message.createdAt).fromNow()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center" }}>
        <FontAwesomeIcon
          icon={faPaperclip}
          onClick={() => document.getElementById("fileInput").click()}
          style={{ cursor: "pointer" }}
        />
        <input
          id="fileInput"
          type="file"
          style={{ display: "none" }}
          onChange={() => console.log("File selected")} // Placeholder for file selection
        />
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            margin: "0 10px",
          }}
          placeholder="Write your message..."
        />
        <FontAwesomeIcon
          icon={faPaperPlane}
          onClick={handleSendMessage}
          style={{ cursor: "pointer" }}
        />
      </div>
    </div>
  );
};

export default GroupMessage;
