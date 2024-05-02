import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faPaperclip,
  faFilePdf,
  faFileWord,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import moment from "moment";
import io from "socket.io-client";
import Scrollbars from "react-custom-scrollbars";
import userImg1 from "../../assets/images/userImg.jpg";
import defaultAvatar from "../../assets/images/userImg2.jpg";

import { IconContext } from "react-icons";
import { RiFilePdfLine, RiFileWordLine } from "react-icons/ri";

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
        senderAvatar:
          message.sender._id === currentUserId ? userImg1 : defaultAvatar,
        isCurrentUser: message.sender._id === currentUserId,
      }));

      setGroupMessages(messages); // Reverse array to show recent messages at the bottom
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
        senderAvatar: userImg1,
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
  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "78vh",
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
        <h3 style={{ margin: "0", marginRight: "20px" }}>Groups</h3>
        <div style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
          {groupList.map((group) => (
            <div
              key={group._id}
              style={{
                marginRight: "10px",
                cursor: "pointer",
                padding: "10px",
                // backgroundColor: "white",
                borderRadius: "5px",
                backgroundColor:
                  selectedGroup === group._id ? "#2DC0CD" : "#4a5568",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                display: "inline-block",
              }}
              onClick={() => setSelectedGroup(group._id)}
            >
              {group.name}
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        {isLoading ? (
          <div>Loading messages...</div>
        ) : (
          <Scrollbars
            autoHide
            autoHideTimeout={1000}
            autoHideDuration={200}
            style={{ maxHeight: "400px" }}
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
                        <IconContext.Provider value={{ color: "#007bff" }}>
                          {message.file.type === "application/pdf" ? (
                            <RiFilePdfLine size={20} />
                          ) : (
                            <RiFileWordLine size={20} />
                          )}
                        </IconContext.Provider>
                        <button
                          onClick={() => handleFileDownload(message.file)}
                          style={{
                            border: "none",
                            background: "none",
                            color: "#007bff",
                            cursor: "pointer",
                          }}
                        >
                          {message.file.type === "application/pdf"
                            ? "PDF File"
                            : message.file.name}
                        </button>
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
            <div style={{ display: "flex", alignItems: "center" }}>
              <span>
                {selectedFile.type === "application/pdf"
                  ? "PDF File"
                  : selectedFile.name}
              </span>
              <FontAwesomeIcon
                icon={faTimesCircle}
                onClick={handleRemoveFile}
                style={{ cursor: "pointer", color: "#dc3545", marginLeft: 5 }}
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
            onClick={handleSendMessage}
            style={{ cursor: "pointer", color: "#25628F" }}
          />
        </div>
      </div>
    </div>
  );
};

export default GroupMessage;
