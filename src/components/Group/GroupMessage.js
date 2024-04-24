import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faPaperclip } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode"; // Correct import for jwt-decode
import moment from "moment";
import io from "socket.io-client";

import userImage1 from "../../assets/images/userImg.jpg"; // Sample user image

const socket = io(process.env.REACT_APP_SOCKET_URL);

const GroupMessage = () => {
  const [groupList, setGroupList] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groupMessages, setGroupMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messageListRef = useRef(null);

  const token = localStorage.getItem("authToken");
  const decodedToken = jwtDecode(token); // Correct jwtDecode usage
  const currentUserId = decodedToken._id;
  console.log("Retrieved token:", currentUserId);
  // const token = localStorage.getItem("authToken");

  const serverUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchGroupList(); // Load group list on component mount
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupMessages(selectedGroup);
      socket.emit("joinGroup", selectedGroup);
    }

    return () => {
      socket.off("newMessage"); // Clean up when the component unmounts or group changes
    };
  }, [selectedGroup]);

  useEffect(() => {
    scrollToBottom(); // Scroll to the bottom when messages update
  }, [groupMessages]);

  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  };

  const fetchGroupList = async () => {
    try {
      const response = await axios.get(`${serverUrl}/group/groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setGroupList(response.data.message || []); // Set the list of groups
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch groups.",
      });
    }
  };

  const fetchGroupMessages = async (groupId) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${serverUrl}/group/groups/${groupId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the authorization header
          },
        }
      );

      const messages = response.data.message.messages.map((message) => ({
        ...message,
        senderName: message.sender.username,
        isCurrentUser: message.sender._id === currentUserId, // Check if the sender is the current user
      }));

      setGroupMessages(messages);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch messages for the selected group.",
      });
    } finally {
      setIsLoading(false); // Hide loading when done
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

    // Disable interaction while waiting for server response
    setIsLoading(true);

    const data = {
      groupId: selectedGroup,
      content: newMessage,
      senderId: currentUserId,
    };

    try {
      const response = await axios.post(
        `${serverUrl}/message/send-message-to-group`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newMessageObj = {
        ...response.data.message,
        sender: {
          _id: currentUserId,
          username: decodedToken.username,
        },
        senderName: decodedToken.username,
      };

      // Only update messages after server response
      setGroupMessages((prevMessages) => [...prevMessages, newMessageObj]);
      setNewMessage(""); // Clear input after successful submission
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to send the message.",
      });
    } finally {
      setIsLoading(false); // Re-enable interaction after completion
    }
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#f0f0f0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
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
          ref={messageListRef}
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
                    justifyContent: message.isCurrentUser
                      ? "flex-end"
                      : "flex-start", // Align messages based on whether they are from the current user or others
                    alignItems: "center",
                  }}
                >
                  {message.isCurrentUser ? (
                    <div
                      style={{
                        backgroundColor: "#d1e7dd", // Background color for messages sent by the current user
                        padding: "10px",
                        borderRadius: "10px",
                        textAlign: "left",
                      }}
                    >
                      <strong>{message.senderName}</strong>
                      <br />
                      {message.content}
                      <div style={{ fontSize: "0.8em", color: "#666" }}>
                        {moment(message.createdAt).fromNow()}
                      </div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={userImage1}
                        alt="Sender"
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          marginRight: "10px",
                        }}
                      />
                      <div
                        style={{
                          backgroundColor: "#f8d7da", // Background color for messages from others
                          padding: "10px",
                          borderRadius: "10px",
                          textAlign: "left",
                        }}
                      >
                        <strong>{message.senderName}</strong>
                        <br />
                        {message.content}
                        <div style={{ fontSize: "0.8em", color: "#666" }}>
                          {moment(message.createdAt).fromNow()}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <FontAwesomeIcon
          icon={faPaperclip}
          onClick={() => document.getElementById("fileInput").click()}
          style={{ cursor: "pointer" }}
        />
        <input
          id="fileInput"
          type="file"
          style={{ display: "none" }}
          onChange={() => console.log("File selected")}
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
          style={{ cursor: "pointer", color: "#007bff" }}
        />
      </div>
    </div>
  );
};

export default GroupMessage;
