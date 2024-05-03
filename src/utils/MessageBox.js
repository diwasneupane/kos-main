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
import Scrollbars from "react-custom-scrollbars";
import { RiFilePdf2Fill, RiFileWordLine } from "react-icons/ri";
import { IconContext } from "react-icons";
const UserMessage = () => {
  const [userMessages, setUserMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const messageListRef = useRef(null);

  const token = localStorage.getItem("authToken");
  const decodedToken = jwtDecode(token);
  const currentUserId = decodedToken._id;

  const serverUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchUserMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [userMessages]);

  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  };

  const fetchUserMessages = async () => {
    try {
      const response = await axios.get(`${serverUrl}/message/user-messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserMessages(response.data.message || []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch user messages.",
      });
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

    const data = new FormData();
    data.append("content", newMessage);
    if (selectedFile) {
      data.append("file", selectedFile);
    }

    try {
      await axios.post(`${serverUrl}/message/send-message-to-user`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setNewMessage("");
      setSelectedFile(null);
      fetchUserMessages();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to send the message.",
      });
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

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <input
          type="file"
          style={{ marginLeft: "10px" }}
          onChange={handleFileSelect}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
      <div>
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
            {userMessages.map((message) => (
              <div
                key={message._id}
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "flex-start",
                }}
              >
                <div
                  style={{
                    backgroundColor:
                      message.senderId === currentUserId
                        ? "#d1e7dd"
                        : "#f8d7da",
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
                          <RiFilePdf2Fill size={20} />
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
      </div>
    </div>
  );
};

export default UserMessage;
