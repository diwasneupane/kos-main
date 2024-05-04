import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faFilter,
  faClose,
  faPaperPlane,
  faPaperclip,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { jwtDecode } from "jwt-decode";
import moment from "moment";
import io from "socket.io-client";
import Scrollbars from "react-custom-scrollbars";
import UserMessage from "../utils/MessageBox";
import AppButton from "../components/AppButton";

import userImg1 from "../assets/images/userImg.jpg";
import defaultAvatar from "../assets/images/userImg2.jpg";

import { IconContext } from "react-icons";
import { RiFilePdf2Fill, RiFilePdfLine, RiFileWordLine } from "react-icons/ri";

const socket = io(process.env.REACT_APP_SOCKET_URL);

const GroupDetailsWithSearch = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showStudents, setShowStudents] = useState(true);
  const [userId, setUserId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [userMessages, setUserMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messageListRef = useRef(null);

  const token = localStorage.getItem("authToken");
  const decodedToken = jwtDecode(token);
  const currentUserId = decodedToken._id;

  const serverUrl = process.env.REACT_APP_API_BASE_URL;

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${serverUrl}/users/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data.message || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while fetching the users.",
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenMessageModal = (user) => {
    setSelectedUser(user._id);
    setUserId(user._id);
    setShowMessageModal(true);
    fetchUserMessages(user._id);
    handleSendMessage(user._id);
  };
  const fetchUserMessages = async (userId) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${serverUrl}/message/user-messages/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        setUserMessages([]);
      } else {
        let messages = response.data.messages.map((message) => ({
          ...message,
          senderName: message.sender.username,
          senderAvatar:
            message.sender._id === currentUserId ? userImg1 : defaultAvatar,
          isCurrentUser: message.sender._id === currentUserId,
        }));

        // Reverse the order of messages before updating state
        messages = messages.reverse();

        if (messages.length === 0) {
          messages.push({
            _id: "default",
            content: "You have started a conversation with this user.",
            createdAt: new Date(),
            sender: { username: "System" },
            senderName: "System",
            senderAvatar: defaultAvatar,
            isCurrentUser: false,
          });
        }

        setUserMessages(messages);
        if (messageListRef.current) {
          messageListRef.current.scrollTop =
            messageListRef.current.scrollHeight;
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch messages for the selected user.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (userId) => {
    if (newMessage.trim() === "" && !selectedFile) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Message content or file cannot be empty.",
      });
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("content", newMessage);
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    try {
      const response = await axios.post(
        `${serverUrl}/message/send-message-to-user/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newMessageObj = response.data.message;
      setUserMessages((prevMessages) => [...prevMessages, newMessageObj]);
      setNewMessage("");
      setSelectedFile(null);

      if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to send the message.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (array, query) => {
    return array.filter((user) =>
      user.username.toLowerCase().includes(query.toLowerCase())
    );
  };

  const handleFilterChange = (filter) => {
    setShowStudents(filter === "student");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(userId);
    }
  };

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileDownload = (file) => {
    const url = URL.createObjectURL(file);
    window.open(url);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredUsers = handleSearch(users, searchQuery).filter((user) =>
    showStudents ? user.role === "student" : user.role === "instructor"
  );

  const filteredMessages = userMessages.filter((message) =>
    message.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: "20px", backgroundColor: "#fff" }}>
      <h2>Users List</h2>
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <AppButton
          name="Filter Student"
          customStyle="addBtnColor"
          icon={faFilter}
          onClick={() => handleFilterChange("student")}
        />
        <AppButton
          name="Filter Instructor"
          customStyle="addBtnColor"
          icon={faFilter}
          onClick={() => handleFilterChange("instructor")}
        />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchInputChange}
        placeholder="Search users..."
        style={{
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ddd",
          marginBottom: "20px",
          width: "100%",
        }}
      />
      <table
        style={{
          width: "100%",
          border: "1px solid #ddd",
          borderCollapse: "collapse",
          textAlign: "center",
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Username
            </th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Role</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user._id}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {user.username}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {user.role}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                <FontAwesomeIcon
                  icon={faEnvelope}
                  style={{ color: "#2196F3", cursor: "pointer" }}
                  onClick={() => {
                    handleOpenMessageModal(user);
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showMessageModal && (
        <div
          style={{
            position: "fixed",
            top: 20,
            paddingTop: "3rem",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "25px",
              borderRadius: "5px",
              maxWidth: "530px",
              position: "relative",
            }}
          >
            <FontAwesomeIcon
              icon={faClose}
              style={{
                position: "absolute",
                top: "10px",
                fontSize: "30px",
                color: "#25628F",
                right: "10px",
                paddingLeft: "1px",
                paddingBottom: "100px",
                cursor: "pointer",
              }}
              onClick={() => setShowMessageModal(false)}
            />
            <div
              style={{
                display: "flex",
                height: "82vh",
                width: "65vh",
                flexDirection: "column",
                backgroundColor: "white",
                padding: "10px",
                border: "2px dashed #25628F",
              }}
            >
              <div
                style={{
                  backgroundColor: "#25628F",
                  padding: "20px",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                <h3 style={{ margin: "0", marginRight: "20px" }}>
                  Messages with {selectedUser ? selectedUser.username : ""}
                </h3>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                style={{
                  margin: "10px 0",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  width: "100%",
                }}
                placeholder="Search messages..."
              />
              <div style={{ flex: 1, position: "relative" }}>
                {isLoading ? (
                  <div>Loading messages...</div>
                ) : (
                  <Scrollbars
                    autoHide
                    autoHideTimeout={1000}
                    autoHideDuration={200}
                    style={{ maxHeight: "400px", position: "relative" }}
                    renderThumbVertical={({ style, ...props }) => (
                      <div
                        {...props}
                        style={{
                          ...style,
                          backgroundColor: "rgba(0,0,0,.3)",
                          borderRadius: "3px",
                          cursor: "pointer",
                          position: "absolute",
                          right: "2px",
                          top: "2px",
                          bottom: "2px",
                          width: "5px",
                          zIndex: "999",
                        }}
                      />
                    )}
                    ref={messageListRef}
                  >
                    <div
                      style={{
                        marginBottom: "10px",
                        display: "flex",
                        flexDirection: "column-reverse",
                      }}
                    >
                      {filteredMessages
                        .slice()
                        .reverse()
                        .map((message, index) => (
                          <div
                            key={message._id}
                            style={{
                              marginBottom: "10px",
                              display: "flex",
                              justifyContent:
                                message.isCurrentUser ||
                                index === filteredMessages.length - 1
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
                                position: "relative",
                              }}
                            >
                              <img
                                src={message.senderAvatar}
                                alt="User Avatar"
                                style={{
                                  width: "30px",
                                  height: "30px",
                                  borderRadius: "50%",
                                  marginRight: "10px",
                                }}
                              />
                              <strong>{message.senderName}</strong>
                              <br />
                              {message.content}
                              <div style={{ fontSize: "0.8em", color: "#666" }}>
                                {moment(message.createdAt).fromNow()}
                              </div>
                              {message.file && (
                                <div
                                  style={{
                                    position: "absolute",
                                    bottom: "10px",
                                    right: "10px",
                                    display: "grid",
                                    gridTemplateColumns: "auto auto",
                                    gap: "5px",
                                  }}
                                >
                                  {/* Icons and download button */}
                                </div>
                              )}
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
                    backgroundColor: "white",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faPaperclip}
                    onClick={() => document.getElementById("fileInput").click()}
                    style={{ cursor: "pointer", color: "#25628F" }}
                  />
                  <input
                    id="fileInput"
                    type="file"
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                  />
                  {selectedFile && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span>
                        {selectedFile.type === "application/pdf"
                          ? "PDF File"
                          : selectedFile.name}
                      </span>
                      <FontAwesomeIcon
                        icon={faTimesCircle}
                        onClick={handleRemoveFile}
                        style={{
                          cursor: "pointer",
                          color: "#dc3545",
                          marginLeft: 5,
                        }}
                      />
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
                    onClick={() => handleSendMessage(userId)}
                    style={{ cursor: "pointer", color: "#25628F" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetailsWithSearch;
