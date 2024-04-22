import React from "react";
import AppButton from "../AppButton";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import ModalWindow from "../../utils/ModalWindow";
import ProjectAddModal from "./ProjectAddModal"; // Project add modal

const ProjectList = (props) => {
  return (
    <div className="dataContainerBox">
      <AppButton
        name="Add Project"
        customStyle="addBtnColor"
        icon={faPlus}
        onClick={props.toggleProjectModal}
      />
      <table className="table customTable mt-3">
        <thead>
          <tr>
            <th>Project Title</th>
            <th>Description</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {props.projectList.length > 0 ? (
            props.projectList.map((item, idx) => (
              <tr key={idx}>
                <td>{item.title}</td>
                <td>{item.description}</td>
                <td>{new Date(item.startDate).toLocaleDateString()}</td>
                <td>{new Date(item.endDate).toLocaleDateString()}</td>
                <td>{item.status}</td>
                <td>
                  <span className="d-flex justify-content-between">
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      className="actionIcons editIcon"
                      onClick={() => props.editProject(item)}
                    />
                    |
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      className="actionIcons deleteIcon"
                      onClick={() => props.deleteProject(idx)}
                    />
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>No Projects found</td>
            </tr>
          )}
        </tbody>
      </table>

      <ModalWindow
        modal={props.projectModal}
        toggleModal={props.toggleProjectModal}
        modalHeader={props.edit ? "Update Project" : "Add New Project"}
        size={`lg`}
        modalBody={
          <ProjectAddModal
            editData={props.editData}
            edit={props.edit}
            handleAdd={props.handleAdd}
            handleUpdate={props.handleUpdate}
          />
        }
      />
    </div>
  );
};

export default ProjectList;
