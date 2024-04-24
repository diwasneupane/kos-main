import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faEnvelope,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "./ModalNotification";
const NotificationPanel = ({ onUpdateNotificationCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const storedNotifications = localStorage.getItem("notifications");
    if (storedNotifications) {
      const parsedNotifications = JSON.parse(storedNotifications);
      setNotifications(parsedNotifications);
      setUnreadCount(parsedNotifications.length);
      onUpdateNotificationCount(parsedNotifications.length); // Update Header
    }
  }, []);

  const markNotificationAsRead = (index) => {
    const updatedNotifications = [...notifications];
    updatedNotifications.splice(index, 1);
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.length);
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    onUpdateNotificationCount(updatedNotifications.length); // Update Header
  };

  const handleNotificationClick = (index, notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    markNotificationAsRead(index); // Mark as read and decrease count
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
      <div class="notificationBody">
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
