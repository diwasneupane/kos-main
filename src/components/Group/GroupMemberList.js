import React from "react";
import AppButton from "../AppButton";

const GroupMemberList = (props) => {
  return (
    <div className="dataContainerBox">
      <p className="contentTitle">Group Members</p>
      <div>
        {props.groupMembers.length > 0
          ? props.groupMembers.map((item, idx) => {
              return (
                <div
                  key={idx}
                  className="groupMemberBox"
                  style={{ marginBottom: "1rem" }}
                >
                  <p className="groupTitle">{item.groupName}</p>
                  <table className="groupTable">
                    <tbody>
                      {item.members.length > 0
                        ? item.members.map((member, mIdx) => {
                            if (mIdx <= 3) {
                              return (
                                <tr key={mIdx}>
                                  <td width={"80%"}>
                                    <div className="groupContent">
                                      <img
                                        src={member.image}
                                        className="tableUserImg"
                                        alt="member"
                                      />
                                      {member.name}
                                    </div>
                                  </td>
                                  <td>
                                    <span
                                      className={
                                        member.isActive
                                          ? "activeSpan"
                                          : "inactiveSpan"
                                      }
                                    >
                                      {member.isActive ? "Active" : "In active"}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="flagSpan">
                                      {member.flagStatus}
                                    </span>
                                  </td>
                                </tr>
                              );
                            }
                          })
                        : "No members yet"}
                    </tbody>
                  </table>
                </div>
              );
            })
          : null}
      </div>
      <div className="d-flex justify-content-end">
        <AppButton name="View All" customStyle="btnColorSecondary" />
      </div>
    </div>
  );
};

export default GroupMemberList;
