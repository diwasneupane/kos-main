import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faPaperclip,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import moment from "moment";
import io from "socket.io-client";

import userImage1 from "../../assets/images/userImg.jpg";
import userImage2 from "../../assets/images/userImg2.jpg";

const socket = io(process.env.REACT_APP_SOCKET_URL);

const GroupMessage = () => {
  const [groupList, setGroupList] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groupMessages, setGroupMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]); // For filtered messages
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Search term
  const [isLoading, setIsLoading] = useState(false);

  const messageListRef = useRef(null);

  const token = localStorage.getItem("authToken");
  const currentUser = jwtDecode(token);
  const currentUserId = currentUser.userId;

  const serverUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchGroupList();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupMessages(selectedGroup);

      socket.emit("joinGroup", selectedGroup);

      socket.on("newMessage", (message) => {
        setGroupMessages((prevMessages) => [...prevMessages, message]);
        scrollToBottom();
      });
    }

    return () => {
      socket.off("newMessage");
    };
  }, [selectedGroup]);

  useEffect(() => {
    filterMessages();
    scrollToBottom(); // Scroll to the bottom when the component updates
  }, [groupMessages, searchTerm]); // Apply search term

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
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${serverUrl}/group/groups/${groupId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const messages = response.data.message.messages.map((message) => ({
        ...message,
        senderName: message.sender.username,
      }));

      setGroupMessages(messages);
      filterMessages(); // Apply filtering when new messages are fetched
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch messages for the selected group.",
      });
    } finally {
      setIsLoading(false);
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

    const formData = {
      groupId: selectedGroup,
      content: newMessage,
      senderId: currentUserId,
    };

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

      socket.emit("sendMessage", response.data.message);

      setGroupMessages((prevMessages) => [
        ...prevMessages,
        response.data.message,
      ]);
      setNewMessage("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to send the message.",
      });
    }
  };

  const filterMessages = () => {
    const filtered = groupMessages.filter((message) =>
      message.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMessages(filtered);
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
        <div>
          <FontAwesomeIcon icon={faSearch} style={{ cursor: "pointer" }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search messages..."
            style={{
              padding: "5px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              marginLeft: "10px",
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <div>Loading messages...</div>
      ) : (
        <div
          ref={messageListRef}
          style={{ maxHeight: "300px", overflowY: "auto", margin: "10px 0" }}
        >
          {filteredMessages.length === 0 ? (
            <div>No messages found</div>
          ) : (
            filteredMessages.map((message) => (
              <div key={message._id} style={{ margin: "10px 0" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      message.sender._id === currentUserId
                        ? "flex-end"
                        : "flex-start",
                    alignItems: "center",
                  }}
                >
                  {message.sender._id !== currentUserId && (
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
                  )}
                  <div
                    style={{
                      backgroundColor:
                        message.sender._id === currentUserId
                          ? "#d1e7dd"
                          : "#f8d7da",
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
          style={{ cursor: "pointer", color: "#007bff" }}
        />
      </div>
    </div>
  );
};

export default GroupMessage;
