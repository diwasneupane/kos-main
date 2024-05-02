import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faPaperclip } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import moment from "moment";
import io from "socket.io-client";
import Scrollbars from "react-custom-scrollbars";

import userImage1 from "../../assets/images/userImg.jpg";

const socket = io(process.env.REACT_APP_SOCKET_URL);

const GroupMessage = () => {
  const [groupList, setGroupList] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groupMessages, setGroupMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const messageListRef = useRef(null);

  const token = localStorage.getItem("authToken");
  const decodedToken = jwtDecode(token);
  const currentUserId = decodedToken._id;

  const serverUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchGroupList();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupMessages(selectedGroup);
      socket.emit("joinGroup", selectedGroup);
    }

    return () => {
      socket.off("newMessage");
    };
  }, [selectedGroup]);

  useEffect(() => {
    scrollToBottom();
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

      setGroupList(response.data.message || []);
      if (response.data.message && response.data.message.length > 0) {
        setSelectedGroup(response.data.message[0]._id);
      }
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
        isCurrentUser: message.sender._id === currentUserId,
      }));

      setGroupMessages(messages);
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

      setGroupMessages((prevMessages) => [...prevMessages, newMessageObj]);
      setNewMessage("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to send the message.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileDownload = () => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      window.open(url);
    }
  };

  return (
    <div style={{ display: "flex", height: "70vh" }}>
      <div
        style={{
          width: "20%",
          backgroundColor: "#2d3748",
          color: "#fff",
          padding: "20px",
          overflowY: "auto",
          boxShadow: "3px 0 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h3 style={{ marginBottom: "20px" }}>Groups</h3>
        <ul style={{ listStyle: "none", padding: "0" }}>
          {groupList.map((group) => (
            <li
              key={group._id}
              style={{
                marginBottom: "10px",
                cursor: "pointer",
                padding: "10px",
                borderRadius: "5px",
                backgroundColor:
                  selectedGroup === group._id ? "#4a5568" : "inherit",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              onClick={() => setSelectedGroup(group._id)}
            >
              {group.name}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ padding: "20px", backgroundColor: "#edf2f7", flex: 1 }}>
        {isLoading ? (
          <div>Loading messages...</div>
        ) : (
          <Scrollbars
            autoHide
            autoHideTimeout={1000}
            autoHideDuration={200}
            style={{ maxHeight: "400px" }}
          >
            <div ref={messageListRef} style={{ marginBottom: "10px" }}>
              {groupMessages.map((message) => (
                <div
                  key={message._id}
                  style={{
                    marginBottom: "10px",
                    display: "flex",
                    justifyContent: message.isCurrentUser
                      ? "flex-end"
                      : "flex-start",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: message.isCurrentUser
                        ? "#d1e7dd"
                        : "#f8d7da",
                      padding: "10px",
                      borderRadius: "10px",
                      textAlign: "left",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
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
              ))}
            </div>
          </Scrollbars>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "20px",
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
            onChange={handleFileSelect}
          />
          {selectedFile && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <span>{selectedFile.name}</span>
              <button
                onClick={handleFileDownload}
                style={{ marginLeft: "10px" }}
              >
                Download
              </button>
            </div>
          )}
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              margin: "0 10px",
              backgroundColor: "#fff",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              height: "40px",
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
    </div>
  );
};

export default GroupMessage;
