import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPenToSquare,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-bootstrap/Modal"; // Using react-bootstrap for modal
import { Button, Table, Form } from "react-bootstrap"; // Using react-bootstrap for simplicity
import { getAuthToken } from "../utils/Auth"; // Utility function to get the token

const ProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchProjects(); // Fetch projects when component mounts
  }, []);

  const fetchProjects = async () => {
    try {
      const token = getAuthToken(); // Retrieve the token
      const response = await axios.get("/api/v1/project/Projects", {
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token in the header
        },
      });
      setProjects(response.data); // Store the data in the state
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleAddOrUpdateProject = async () => {
    const token = getAuthToken(); // Get the token before making a request
    const projectData = {
      title: document.getElementById("projectTitle").value,
      description: document.getElementById("projectDescription").value,
      startDate: document.getElementById("projectStartDate").value,
      endDate: document.getElementById("projectEndDate").value,
      status: document.getElementById("projectStatus").value,
    };

    try {
      if (editMode && editData) {
        await axios.patch(
          `/api/v1/project/updateProjects/${editData._id}`,
          projectData,
          {
            headers: { Authorization: `Bearer ${token}` }, // Pass the token in the header
          }
        );
      } else {
        await axios.post("/api/v1/project/addProjects", projectData, {
          headers: { Authorization: `Bearer ${token}` }, // Pass the token in the header
        });
      }

      fetchProjects(); // Refresh the project list after add/update
      setModalOpen(false); // Close the modal after success
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    const token = getAuthToken(); // Get the token before making a request
    try {
      await axios.delete(`/api/v1/project/deleteProjects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token in the header
        },
      });
      fetchProjects(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const openAddModal = () => {
    setEditMode(false);
    setEditData(null);
    setModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditMode(true);
    setEditData(project);
    setModalOpen(true);
  };

  return (
    <div className="container">
      <div className="row mb-3">
        <div className="col">
          <Button variant="primary" onClick={openAddModal}>
            <FontAwesomeIcon icon={faPlus} /> Add Project
          </Button>
        </div>
      </div>

      <Table striped bordered hover>
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
          {projects.length > 0 ? (
            projects.map((project) => (
              <tr key={project._id}>
                <td>{project.title}</td>
                <td>{project.description}</td>
                <td>{new Date(project.startDate).toLocaleDateString()}</td>
                <td>{new Date(project.endDate).toLocaleDateString()}</td>
                <td>{project.status}</td>
                <td>
                  <FontAwesomeIcon
                    icon={faPenToSquare}
                    className="text-primary"
                    onClick={() => openEditModal(project)}
                  />
                  {" | "}
                  <FontAwesomeIcon
                    icon={faTrashAlt}
                    className="text-danger"
                    onClick={() => handleDeleteProject(project._id)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>No projects found</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal for adding or editing projects */}
      <Modal show={modalOpen} onHide={() => setModalOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit Project" : "Add Project"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Project Title</Form.Label>
              <Form.Control
                type="text"
                id="projectTitle"
                defaultValue={editMode && editData ? editData.title : ""}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                id="projectDescription"
                defaultValue={editMode && editData ? editData.description : ""}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                id="projectStartDate"
                defaultValue={
                  editMode && editData ? editData.startDate.split("T")[0] : ""
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                id="projectEndDate"
                defaultValue={
                  editMode && editData ? editData.endDate.split("T")[0] : ""
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Control as="select" id="projectStatus">
                <option value="Pending">Pending</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddOrUpdateProject}>
            {editMode ? "Update" : "Add"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProjectPage;
