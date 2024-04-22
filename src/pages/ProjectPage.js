import React, { useState, useEffect } from "react";
import { Container, Table, Modal, Button, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrashAlt,
  faBorderNone,
} from "@fortawesome/free-solid-svg-icons";
import { getAuthToken } from "../utils/Auth";
import axios from "axios";

const ProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get("/api/v1/project/Projects", {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId) => {
    try {
      await axios.delete(`/api/v1/project/deleteProjects/${projectId}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      setProjects(projects.filter((p) => p._id !== projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const toggleModal = () => {
    setEditData(null); // Reset editData when toggling the modal
    setShowModal(!showModal);
  };

  const handleEdit = (project) => {
    setEditData(project); // Set editData when editing a project
    setShowModal(true);
  };

  const handleSubmit = async (project) => {
    const endpoint = editData
      ? `/api/v1/project/updateProjects/${editData._id}`
      : "/api/v1/project/addProjects";

    const method = editData ? "PATCH" : "POST";

    try {
      await axios({
        method,
        url: endpoint,
        data: project,
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });

      fetchProjects(); // Refresh the project list after saving
      toggleModal(); // Close the modal
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  return (
    <Container
      className=" p-4"
      style={{ backgroundColor: "white", width: "97%", borderRadius: "5px" }}
    >
      <Button
        style={{
          borderRadius: "25px",
          border: "0",
          backgroundColor: "#2DBFCD",
        }}
        variant="primary"
        onClick={toggleModal}
      >
        <FontAwesomeIcon icon={faPlus} style={{ color: "white" }} /> Add Project
      </Button>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <Table className="table customTable mt-3">
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
          <tbody className="tableData" width={"40%"}>
            {projects.map((project) => (
              <tr key={project._id}>
                <td className="tableData">{project.title}</td>
                <td>{project.description}</td>
                <td>{new Date(project.startDate).toLocaleDateString()}</td>
                <td>{new Date(project.endDate).toLocaleDateString()}</td>
                <td>{project.status}</td>
                <td>
                  <Button variant="link" onClick={() => handleEdit(project)}>
                    <FontAwesomeIcon
                      icon={faEdit}
                      style={{ color: "orange" }}
                    />
                  </Button>
                  <Button
                    variant="link"
                    onClick={() => handleDelete(project._id)}
                  >
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      style={{ color: "red" }}
                    />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={toggleModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editData ? "Edit Project" : "Add Project"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProjectForm
            initialData={editData}
            onSubmit={handleSubmit}
            onClose={toggleModal}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

const ProjectForm = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    status: initialData?.status || "Pending",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = () => {
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <Form className="container-fluid">
      <Form.Group>
        <Form.Label>Project Title</Form.Label>
        <Form.Control
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
        />
      </Form.Group>
      <Form.Group>
        <Form.Label className="col-md-9">Description</Form.Label>
        <Form.Control
          as="textarea"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </Form.Group>
      <Form.Group>
        <Form.Label className="col-md-3 mt-1">Start Date</Form.Label>
        <Form.Control
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
        />
      </Form.Group>
      <Form.Group>
        <Form.Label className="col-md-3 mt-1">End Date</Form.Label>
        <Form.Control
          type="date"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
        />
      </Form.Group>
      <Form.Group>
        <Form.Label className="col-md-3 mt-1">Status</Form.Label>
        <Form.Control
          as="select"
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="Pending">Pending</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
        </Form.Control>
      </Form.Group>
      <br />
      <Button
        style={{
          borderRadius: "5px",
          border: "0",
          backgroundColor: "#2DBFCD",
          marginRight: "5px",
        }}
        variant="primary"
        onClick={handleFormSubmit}
      >
        Submit
      </Button>

      <Button
        style={{
          borderRadius: "5px",
          border: "0",
          backgroundColor: "#FFA500",
        }}
        variant="secondary"
        onClick={onClose}
      >
        Close
      </Button>
    </Form>
  );
};

export default ProjectPage;
