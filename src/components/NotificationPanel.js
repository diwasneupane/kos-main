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
import { jwtDecode } from "jwt-decode";

const NotificationPanel = ({ onUpdateNotificationCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        console.log("Auth token:", authToken);

        const decodedToken = jwtDecode(authToken);
        const currentUserId = decodedToken._id;
        console.log("Current user ID:", currentUserId);

        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/notification/notification`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        console.log("Response data:", response.data);

        // Fetch sender role for each notification
        const notificationsWithRole = await Promise.all(
          response.data.notifications.map(async (notification) => {
            const senderRole = await fetchSenderRole(notification.sender);
            return { ...notification, senderRole };
          })
        );

        // Filter notifications based on current user's ID
        const filteredNotifications = notificationsWithRole.filter(
          (notification) => {
            console.log("Notification:", notification);

            // Check if the current user's ID is in the group associated with the notification
            const userIsInGroup =
              (notification.groupDetails &&
                notification.groupDetails.students.some(
                  (student) => student._id === currentUserId
                )) ||
              notification.groupDetails.instructor._id === currentUserId;

            console.log("User is in group:", userIsInGroup);

            // Display the notification only if the user is part of the group
            return userIsInGroup;
          }
        );

        console.log("Filtered notifications:", filteredNotifications);

        // Update state with filtered notifications
        setNotifications(filteredNotifications);
        console.log("Filtered notifications state:", filteredNotifications);
        setUnreadCount(filteredNotifications.length);
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
  const fetchSenderRole = async (senderId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/role/${senderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.role;
    } catch (error) {
      console.error("Error fetching sender's role:", error);
      return "Unknown"; // Return a default value if role fetch fails
    }
  };

  const handleNotificationClick = async (index, notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    markNotificationAsRead(index);

    try {
      const authToken = localStorage.getItem("authToken");

      // Fetch sender role
      // const senderRole = await fetchSenderRole(notification.sender);

      // Delete the notification
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/notification/delete-notification/${notification._id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      console.log("Notification deleted successfully");

      // Update state to remove the deleted notification
      const updatedNotifications = [...notifications];
      updatedNotifications.splice(index, 1);
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.length);
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
              {notification.type === "general" ? (
                <FontAwesomeIcon icon={faBell} />
              ) : (
                <FontAwesomeIcon icon={faExclamationTriangle} color="orange" />
              )}

              <div className="notificationText">
                <strong>{notification.message}</strong>
                <div className="notificationRole">
                  Sender {notification.senderRole}
                </div>
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
