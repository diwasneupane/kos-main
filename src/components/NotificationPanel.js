import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faEnvelope,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "./ModalNotification";
import io from "socket.io-client";
import axios from "axios";

const NotificationPanel = ({ onUpdateNotificationCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/notification/notification`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        const notificationsWithRole = response.data.notifications.map(
          (notification) => {
            // Assuming sender object contains the sender's role
            const senderRole = notification.sender.role || "Unknown";
            return { ...notification, senderRole };
          }
        );
        setNotifications(notificationsWithRole);
        console.log(notificationsWithRole);
        setUnreadCount(notificationsWithRole.length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchData();

    const socket = io();

    socket.on("newNotification", (notification) => {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        notification,
      ]);

      setUnreadCount((prevCount) => prevCount + 1);

      onUpdateNotificationCount((prevCount) => prevCount + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [onUpdateNotificationCount]);

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(
        `http://localhost:3000/api/v1/notification/delete-notification/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification._id !== id)
      );
      setUnreadCount((prevCount) => prevCount - 1);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = async (index, notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    markNotificationAsRead(index);

    // Delete the notification from the server
    try {
      const authToken = localStorage.getItem("authToken");
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/notification/delete-notification/${notification._id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      console.log("Notification deleted successfully");
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };
  const markNotificationAsRead = (index) => {
    const updatedNotifications = [...notifications];
    updatedNotifications.splice(index, 1);
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.length);
  };

  const renderIcon = (type) => {
    switch (type) {
      case "at-risk":
        return <FontAwesomeIcon icon={faExclamationTriangle} color="orange" />;
      case "message":
        return <FontAwesomeIcon icon={faEnvelope} color="blue" />;
      default:
        return <FontAwesomeIcon icon={faBell} />;
    }
  };

  return (
    <div className="notificationPanelBody">
      <div className="notificationHeader">
        <FontAwesomeIcon icon={faBell} />
        {unreadCount > 0 && (
          <span className="notificationCount">{unreadCount}</span>
        )}
      </div>
      <div className="notificationBody">
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <div
              key={notification._id}
              className="notificationItem"
              onClick={() => handleNotificationClick(index, notification)}
            >
              {/* Render icon based on notification type */}
              {notification.type === "general" ? (
                <FontAwesomeIcon icon={faBell} />
              ) : (
                <FontAwesomeIcon icon={faExclamationTriangle} color="orange" />
              )}

              <div className="notificationText">
                {/* Render notification message */}
                <strong>{notification.message}</strong>
                {/* Render sender's role */}
                <div className="notificationSender">
                  Sender Role: {notification.senderRole}
                </div>
                {/* Render notification date */}
                <div className="notificationDate">
                  {new Date(notification.date).toDateString()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="noNotifications">No notifications</div>
        )}
      </div>
      <div className="notificationFooter ">
        <Link to="/notifications">See all</Link>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedNotification ? (
          <div>
            <h3>Notification Details</h3>
            <p>{selectedNotification.message}</p>
            <p>Date: {new Date(selectedNotification.date).toDateString()}</p>
          </div>
        ) : (
          <p>No details available</p>
        )}
      </Modal>
    </div>
  );
};

export default NotificationPanel;
