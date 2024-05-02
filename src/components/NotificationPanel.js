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

const NotificationPanel = ({ onUpdateNotificationCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Establish WebSocket connection
    const socket = io();

    // Listen for "newNotification" events
    socket.on("newNotification", (notification) => {
      // Update notifications state with the new notification
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        notification,
      ]);

      // Update unread count
      setUnreadCount((prevCount) => prevCount + 1);

      // Call parent function to update notification count in header
      onUpdateNotificationCount((prevCount) => prevCount + 1);
    });

    // Clean up function to disconnect from the WebSocket server
    return () => {
      socket.disconnect();
    };
  }, [onUpdateNotificationCount]);

  // Function to mark a notification as read
  const markNotificationAsRead = (index) => {
    const updatedNotifications = [...notifications];
    updatedNotifications.splice(index, 1);
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.length);
    // You may also want to update the server/database to mark the notification as read
  };

  // Function to handle click on a notification
  const handleNotificationClick = (index, notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    markNotificationAsRead(index); // Mark notification as read
  };

  // Function to render icon based on notification type
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
      {/* Notification header */}
      <div className="notificationHeader">
        <FontAwesomeIcon icon={faBell} />
        {unreadCount > 0 && (
          <span className="notificationCount">{unreadCount}</span>
        )}
      </div>
      {/* Notification body */}
      <div className="notificationBody">
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <div
              key={index}
              className="notificationItem"
              onClick={() => handleNotificationClick(index, notification)}
            >
              {renderIcon(notification.type)}
              <div className="notificationText">
                <strong>{notification.message}</strong>
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
      {/* Notification footer */}
      <div className="notificationFooter ">
        <Link to="/notifications">See all</Link>
      </div>
      {/* Notification modal */}
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
