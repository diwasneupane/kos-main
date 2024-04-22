import React from "react";
import AppButton from "../AppButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { faPenToSquare, faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import { faRocketchat } from "@fortawesome/free-brands-svg-icons";
import ModalWindow from "../../utils/ModalWindow";
import GroupAddModal from "./GroupAddModal";

const GroupList = (props) => {
  return (
    <div className="dataContainerBox">
      <AppButton
        name="Add Group"
        customStyle="addBtnColor"
        icon={faPlus}
        onClick={props.toggleAddGroupModal}
      />
      <table className="table customTable mt-3">
        <thead>
          <tr>
            <th>Group Name</th>
            <th>Instructor</th>
            <th>Leader</th>
            <th>Contact</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {props.groupList.length > 0 ? (
            props.groupList.map((item, idx) => {
              return (
                <tr key={idx}>
                  <td className="tableData" width={"40%"}>
                    {item.groupName}
                  </td>
                  <td>
                    <span>
                      <img
                        src={item.instructor.image}
                        className="tableUserImg"
                        alt="instructor"
                      />
                    </span>
                    {item.instructor.name}
                  </td>
                  <td>
                    <span>
                      <img
                        src={item.leader.image}
                        className="tableUserImg"
                        alt="leader"
                      />
                    </span>
                    {item.leader.name}
                  </td>
                  <td>
                    <strong>Phone: </strong>
                    {item.leader.phone}
                    <br></br>
                    <strong>Email: </strong>
                    {item.leader.email}
                  </td>
                  <td>
                    <span className="d-flex justify-content-between">
                      <FontAwesomeIcon
                        icon={faPenToSquare}
                        className="actionIcons editIcon"
                        onClick={() => props.editGroup(item)}
                      />
                      |
                      <FontAwesomeIcon
                        icon={faTrashAlt}
                        className="actionIcons deleteIcon"
                        onClick={props.deleteGroup}
                      />
                      |
                      <FontAwesomeIcon
                        icon={faRocketchat}
                        className="actionIcons chatIcon"
                      />
                    </span>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={5}>No groups found</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="d-flex justify-content-end">
        <AppButton name="View All" customStyle="btnColorSecondary" />
      </div>
      <ModalWindow
        modal={props.addGroupModal}
        toggleModal={props.toggleAddGroupModal}
        modalHeader={props.edit ? "Update Group" : "Add New Group"}
        size={`lg`}
        modalBody={
          <GroupAddModal editData={props.editData} edit={props.edit} />
        }
      />
    </div>
  );
};

export default GroupList;
