import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faExclamationTriangle,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import ModalWindow from "../utils/ModalWindow";

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      const userId = "USER_ID"; // Use the actual user ID
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/user-notifications/${userId}`
      );

      if (response.status === 200) {
        const fetchedNotifications = response.data.notifications;
        setNotifications(fetchedNotifications);
        setUnreadCount(
          fetchedNotifications.filter((notification) => !notification.isRead)
            .length
        );
      }
    };

    fetchNotifications();
  }, []);

  const handleNotificationClick = (index) => {
    const updatedNotifications = [...notifications];
    const notificationId = updatedNotifications[index]._id;

    // Mark notification as read
    axios
      .patch(
        `${process.env.REACT_APP_API_BASE_URL}/mark-read/${notificationId}`
      )
      .then((res) => {
        if (res.status === 200) {
          updatedNotifications[index].isRead = true;
          setUnreadCount(unreadCount - 1);
        }
      })
      .catch((err) =>
        console.error("Error marking notification as read:", err)
      );

    setSelectedNotification(updatedNotifications[index]);
    setShowNotificationModal(true);
  };

  const renderIcon = (type) => {
    switch (type) {
      case "at-risk":
        return <FontAwesomeIcon icon={faExclamationTriangle} color="orange" />;
      case "message":
        return <FontAwesomeIcon icon={faEnvelope} color="blue" />;
      default:
        return <FontAwesomeIcon icon={faBell} color="gray" />;
    }
  };

  const handleClearAll = () => {
    const newNotifications = notifications.filter(
      (notification) => !notification.isRead
    );
    setNotifications(newNotifications);
    setUnreadCount(newNotifications.length);
  };

  return (
    <div className="notificationPanelBody">
      <div className="notificationHeader">
        <span>Notifications</span>
        <span className="notificationCount">{unreadCount}</span>
      </div>

      <div className="notificationBody">
        {notifications.map((notification, index) => (
          <div
            key={index}
            className={`notificationPanelDataTemplateHolder ${
              notification.isRead ? "" : "unread"
            }`}
            onClick={() => handleNotificationClick(index)}
          >
            {renderIcon(notification.type)}
            <div className="notifyMessageTitle">{notification.message}</div>
            <div className="font-italic notification-period">
              {new Date(notification.date).toDateString()}
            </div>
          </div>
        ))}
      </div>

      <div className="notificationFooter">
        <button onClick={() => setShowNotificationModal(true)}>View All</button>
      </div>

      <ModalWindow
        modal={showNotificationModal}
        toggleModal={() => setShowNotificationModal(false)}
        modalHeader={
          selectedNotification ? "Notification Details" : "All Notifications"
        }
        size="lg"
        modalBody={
          selectedNotification ? (
            <div>
              <h4>{selectedNotification.message}</h4>
              <p>
                {selectedNotification.description || "No additional details."}
              </p>
              <button
                onClick={() => {
                  setShowNotificationModal(false);
                  axios.delete(
                    `${process.env.REACT_APP_API_BASE_URL}/delete-notification/${selectedNotification._id}`
                  );
                }}
              >
                Delete
              </button>
            </div>
          ) : (
            <div>
              {notifications.map((notification, index) => (
                <div key={index} className="notificationItem">
                  {renderIcon(notification.type)} {notification.message}
                </div>
              ))}
              <button onClick={handleClearAll}>Clear All</button>
            </div>
          )
        }
      />
    </div>
  );
};

export default NotificationPanel;
