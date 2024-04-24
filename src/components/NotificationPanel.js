import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ClampLines from "react-clamp-lines";
import ModalWindow from "../utils/ModalWindow";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const storedNotifications = localStorage.getItem("notifications");
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    }
  }, []);

  const addNotification = (notification) => {
    const updatedNotifications = [...notifications, notification];
    setNotifications(updatedNotifications);
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
  };

  const markNotificationAsRead = (index) => {
    const updatedNotifications = [...notifications];
    updatedNotifications.splice(index, 1);
    setNotifications(updatedNotifications);
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
  };

  const [notificationModal, setNotificationModal] = useState(false);

  const handleNotificationModal = () => {
    setNotificationModal(!notificationModal);
  };

  const renderIcon = (type) => {
    switch (type) {
      case "at-risk":
        return <FontAwesomeIcon icon={faExclamationTriangle} color="orange" />;
      case "message":
        return <FontAwesomeIcon icon={faEnvelope} color="blue" />;
      default:
        return null;
    }
  };

  return (
    <div className="notificationPanelBody">
      <div className="notificationTitle">Notifications</div>
      <div className="notificationBody">
        {notifications.map((notification, index) => (
          <div
            className="notificationPanelDataTemplateHolder"
            onClick={() => {
              handleNotificationModal();
              markNotificationAsRead(index);
            }}
          >
            {renderIcon(notification.type)}
            <div className="notifyMessageTitle">{notification.message}</div>
            <div className="font-italic notification-period mt-1">
              {new Date(notification.date).toDateString()}
            </div>
          </div>
        ))}
      </div>
      <div className="notificationFooter">
        See all
        <br />
      </div>
    </div>
  );
};

export default NotificationPanel;
