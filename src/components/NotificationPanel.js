import React, { useState } from "react";
import { Link } from "react-router-dom";
import ClampLines from "react-clamp-lines";
import ModalWindow from "../utils/ModalWindow";

const NotificationPanel = () => {
  const [notificationModal, setNotificationModal] = useState(false);

  const handleNotificationModal = () => {
    setNotificationModal(!notificationModal);
  };

  return (
    <div
      className="notificationPanelBody"
      // onClick={(e) => e.stopPropagation()}
    >
      <div className="notificationTitle">Notifications</div>
      <div className="notificationBody">
        <div
          className="notificationPanelDataTemplateHolder"
          onClick={handleNotificationModal}
          //   style={!data.read ? { backgroundColor: "#cee7fa" } : null}
        >
          <div className="notifyMessageTitle">
            Lorem Ipsum test for notification
          </div>
          <div className="notifyMessageText">
            <ClampLines
              text="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
              id="really-unique-id"
              lines={2}
              ellipsis="..."
              buttons={false}
            />
          </div>
          <div className="font-italic notification-period mt-1">
            20th Feb, 2024
          </div>
          <hr className="mt-1" />
          <ModalWindow
            modal={notificationModal}
            toggleModal={handleNotificationModal}
            modalHeader={"Lorem Ipsum test for notification"}
            size={`lg`}
            modalBody={
              "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
            }
          ></ModalWindow>
        </div>
      </div>
      <div className="notificationFooter">
        <Link to="/notifications" target="_blank">
          See all
        </Link>
        <br />
      </div>
    </div>
  );
};

export default NotificationPanel;
