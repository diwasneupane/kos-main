import { faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import { faCameraAlt, faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import React from "react";

const GroupMessage = (props) => {
  return (
    <div className="dataContainerBox">
      <div className="d-flex justify-content-between">
        <p className="contentTitle">{props.selectedGroup}</p>
        <div>
          <select
            name="selectedGroup"
            value={props.selectedGroup}
            className="form-select"
            onChange={props.handleChange}
          >
            <option value="" disabled>
              Choose group
            </option>
            {props.groupList.length > 0
              ? props.groupList.map((item, idx) => {
                  return (
                    <option value={item.groupName} key={idx}>
                      {item.groupName}
                    </option>
                  );
                })
              : "No groups added"}
          </select>
        </div>
      </div>
      <div className="messageBox">
        <div className="chatDiv">
          {props.groupChat.length > 0
            ? props.groupChat.map((message, mIdx) => {
                if (message.userId === 1) {
                  //later will be changed by user identification
                  return (
                    <div key={mIdx} className="messageRowMine">
                      <div className="text-end">
                        <div className="messageBubble">{message.message}</div>
                        <span className="messageDate me-2">
                          {moment(message.date).fromNow()}
                        </span>
                      </div>
                      <img
                        src={message.userImg}
                        className="userMessageIcon"
                        alt="User message"
                      />
                    </div>
                  );
                } else {
                  return (
                    <div key={mIdx} className="messageRow">
                      <img
                        src={message.userImg}
                        className="userMessageIcon"
                        alt="User message"
                      />
                      <div className="text-end">
                        <div className="messageBubble1">
                          <span>{message.user}</span>
                          <br></br>
                          {message.message}
                        </div>
                        <span className="messageDate">
                          {moment(message.date).fromNow()}
                        </span>
                      </div>
                    </div>
                  );
                }
              })
            : null}
        </div>
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faPaperclip} className="chatIcons" />
          <div style={{ flex: 1, margin: "0 10px" }}>
            <input
              type="text"
              name="message"
              value={props.message}
              onChange={props.handleChange}
              className="form-control"
              placeholder="Write your message"
            />
          </div>
          <FontAwesomeIcon icon={faCameraAlt} className="chatIcons" />
          <FontAwesomeIcon icon={faPaperPlane} className="chatIcons" />
        </div>
      </div>
    </div>
  );
};

export default GroupMessage;
