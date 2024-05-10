import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faPaperclip,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import moment from "moment";
import io from "socket.io-client";
import userImg1 from "../../assets/images/userImg.jpg";
import defaultAvatar from "../../assets/images/userImg2.jpg";
import { IconContext } from "react-icons";
import { RiFilePdf2Fill, RiFileWordLine } from "react-icons/ri";

const socket = io(process.env.REACT_APP_SOCKET_URL);

const GroupMessage = () => {
  const [groupList, setGroupList] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groupMessages, setGroupMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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

      let filteredGroups;

      if (decodedToken.role === "admin") {
        filteredGroups = response.data.message;
      } else if (
        decodedToken.role === "student" ||
        decodedToken.role === "instructor"
      ) {
        filteredGroups = response.data.message.filter((group) => {
          if (decodedToken.role === "student") {
            return group.students.some(
              (student) => student._id === currentUserId
            );
          } else {
            return group.instructor._id === currentUserId;
          }
        });
      }

      setGroupList(filteredGroups);
      if (filteredGroups.length > 0) {
        setSelectedGroup(filteredGroups[0]._id);
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

      const messages = response.data.message.messages.map((message) => {
        // If message has an attached file, construct the download URL
        const filename = message.filename || message.attachment?.filename;
        console.log(filename);
        const fileUrl = filename
          ? ` http://localhost:3000//uploads/${filename}`
          : null;

        console.log(fileUrl);
        return {
          ...message,
          fileUrl, // Add fileUrl to the message data
          senderName: message.sender.username,
          senderAvatar:
            message.sender._id === currentUserId ? userImg1 : defaultAvatar,
          isCurrentUser: message.sender._id === currentUserId,
        };
      });
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
    if (newMessage.trim() === "" && !selectedFile) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Message content or file cannot be empty.",
      });
      return;
    }

    setIsLoading(true);

    const data = new FormData();
    data.append("groupId", selectedGroup);

    if (newMessage.trim() !== "") {
      data.append("content", newMessage);
    }

    data.append("senderId", currentUserId);
    if (selectedFile) {
      data.append("file", selectedFile);
    }

    try {
      const response = await axios.post(
        `${serverUrl}/message/send-message-to-group`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Response from server:", response.data);

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
      setSelectedFile(null);
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

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredMessages = groupMessages.filter(
    (message) =>
      message.content &&
      message.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <div style={{ flex: 1, overflowY: "auto", maxHeight: "400px" }}>
        {groupMessages.map((message) => (
          <div
            key={message._id}
            style={{
              display: "flex",
              justifyContent: message.isCurrentUser ? "flex-end" : "flex-start",
              alignItems: "center",
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
            <div
              style={{
                backgroundColor: message.isCurrentUser ? "#d1e7dd" : "#f8d7da",
                padding: "10px",
                borderRadius: "10px",
                textAlign: "left",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                position: "relative",
              }}
            >
              <strong>{message.senderName}</strong>
              <br />
              {message.content}
              <div style={{ fontSize: "0.8em", color: "#666" }}>
                {moment(message.createdAt).fromNow()}
              </div>
              {message.attachment && (
                <div>
                  <span>Attached file:</span>
                  <IconContext.Provider value={{ color: "#007bff" }}>
                    {message.attachment.mimeType ===
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? (
                      <RiFileWordLine size={20} />
                    ) : (
                      <RiFilePdf2Fill size={20} />
                    )}
                  </IconContext.Provider>

                  <button
                    onClick={() => {
                      // Implement the logic to download or open the file
                      window.open(
                        ` http://localhost:3000//uploads/${message.attachment.filename}`
                      );
                    }}
                    style={{
                      cursor: "pointer",
                      textDecoration: "underline",
                      color: "#007bff",
                    }}
                  >
                    {message.attachment.filename}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

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
  );
};

export default GroupMessage;
