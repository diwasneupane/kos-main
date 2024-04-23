import React from "react";
import AppButton from "../AppButton";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import { faRocketchat } from "@fortawesome/free-brands-svg-icons";
import ModalWindow from "../../utils/ModalWindow";
import InstructorAddModal from "./InstructorAddModal";

const InstructorList = (props) => {
  return (
    <div className="dataContainerBox">
      <AppButton
        name="Add Instructor"
        customStyle="addBtnColor"
        icon={faPlus}
        onClick={props.toggleInstructorModal}
      />
      <table className="table customTable mt-3">
        <thead>
          <tr>
            <th>Instructor</th>

            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {props.instructorList.length > 0 ? (
            props.instructorList.map((item, idx) => {
              return (
                <tr key={idx}>
                  <td className="tableData" width={"50%"}>
                    <span>
                      <img
                        src={item.image}
                        className="tableUserImg"
                        alt="instructor"
                      />
                    </span>
                    {item.name}
                  </td>

                  <td>{item.email}</td>
                  <td>{item.phone}</td>
                  <td>
                    <span className="d-flex justify-content-between">
                      <FontAwesomeIcon
                        icon={faPenToSquare}
                        className="actionIcons editIcon"
                        onClick={() => props.editInstructor(item)}
                      />
                      |
                      <FontAwesomeIcon
                        icon={faTrashAlt}
                        className="actionIcons deleteIcon"
                        onClick={() => props.deleteInstructor(idx)}
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
              <td colSpan={5}>No Instructors found</td>
            </tr>
          )}
        </tbody>
      </table>
      <ModalWindow
        modal={props.instructorModal}
        toggleModal={props.toggleInstructorModal}
        modalHeader={props.edit ? "Update Instructor" : "Add New Instructor"}
        size={`lg`}
        modalBody={
          <InstructorAddModal editData={props.editData} edit={props.edit} />
        }
      />
    </div>
  );
};

export default InstructorList;
