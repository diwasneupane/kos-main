import React, { useEffect, useState } from "react";
import AppButton from "../AppButton";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import ModalWindow from "../../utils/ModalWindow";
import ProjectAddModal from "./ProjectAddModal";
import { getAuthToken } from "../../utils/Auth";

const ProjectList = ({
  toggleProjectModal,
  projectModal,
  editData,
  edit,
  handleAdd,
  handleUpdate,
}) => {
  const [projectList, setProjectList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/v1/project/Projects", {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }

        const data = await response.json();
        setProjectList(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleDeleteProject = async (id) => {
    try {
      const response = await fetch(`/api/v1/project/deleteProjects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      setProjectList((prevList) =>
        prevList.filter((project) => project._id !== id)
      );
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dataContainerBox">
      <AppButton
        name="Add Project"
        customStyle="addBtnColor"
        icon={faPlus}
        onClick={toggleProjectModal}
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
          {projectList.length > 0 ? (
            projectList.map((project) => (
              <tr key={project._id}>
                <td>{project.title}</td>
                <td>{project.description}</td>
                <td>{new Date(project.startDate).toLocaleDateString()}</td>
                <td>{new Date(project.endDate).toLocaleDateString()}</td>
                <td>{project.status}</td>
                <td>
                  <span className="d-flex justify-content-between">
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      className="actionIcons editIcon"
                      onClick={() => editData(project)}
                    />
                    |
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      className="actionIcons deleteIcon"
                      onClick={() => handleDeleteProject(project._id)}
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
        modal={projectModal}
        toggleModal={toggleProjectModal}
        modalHeader={edit ? "Update Project" : "Add New Project"}
        size={`lg`}
        modalBody={
          <ProjectAddModal
            edit={edit}
            editData={editData}
            handleAdd={handleAdd}
            handleUpdate={handleUpdate}
          />
        }
      />
    </div>
  );
};

export default ProjectList;
