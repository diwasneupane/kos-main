import React, { useState, useEffect } from "react";
import { Form, Button, Modal, Table, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrashAlt,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Swal from "sweetalert2";
import { getAuthToken } from "../utils/Auth";

// InstructorForm Component
const InstructorForm = ({ onSubmit, onClose, existingUsernames }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleFormChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const toggleShowPassword = () => {
    setShowPassword((prevShow) => !prevShow);
  };

  const validateForm = () => {
    const usernameRegex = /^.{5,}$/; // At least 5 characters
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$%\^&\*]).{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (formData.fullName.trim() === "") {
      Swal.fire("Error", "Full Name is required.", "error");
      return false;
    }

    if (!usernameRegex.test(formData.username)) {
      Swal.fire("Error", "Username must be at least 5 characters.", "error");
      return false;
    }

    if (existingUsernames.includes(formData.username)) {
      Swal.fire("Error", "Username already exists.", "error");
      return false;
    }

    if (!emailRegex.test(formData.email)) {
      Swal.fire("Error", "Please enter a valid email address.", "error");
      return false;
    }

    if (!passwordRegex.test(formData.password)) {
      Swal.fire(
        "Error",
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character.",
        "error"
      );
      return false;
    }

    return true;
  };

  const handleFormSubmit = async () => {
    if (validateForm()) {
      await onSubmit(formData);
      Swal.fire("Success", "Instructor added successfully.", "success");
      onClose();
    }
  };

  return (
    <Form>
      <Form.Group>
        <Form.Label>Full Name</Form.Label>
        <Form.Control
          type="text"
          value={formData.fullName}
          onChange={(e) => handleFormChange("fullName", e.target.value)}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Username</Form.Label>
        <Form.Control
          type="text"
          value={formData.username}
          onChange={(e) => handleFormChange("username", e.target.value)}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          value={formData.email}
          onChange={(e) => handleFormChange("email", e.target.value)}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Phone</Form.Label>
        <Form.Control
          type="text"
          value={formData.phone}
          onChange={(e) => handleFormChange("phone", e.target.value)}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Password</Form.Label>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Form.Control
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => handleFormChange("password", e.target.value)}
          />
          <Button
            variant="link"
            onClick={toggleShowPassword}
            style={{ padding: 0, marginLeft: "10px" }}
          >
            {showPassword ? (
              <FontAwesomeIcon icon={faEyeSlash} />
            ) : (
              <FontAwesomeIcon icon={faEye} />
            )}
          </Button>
        </div>
      </Form.Group>

      <Button
        style={{
          borderRadius: "5px",
          backgroundColor: "#2DBFCD",
          marginRight: "5px",
        }}
        onClick={handleFormSubmit}
      >
        Submit
      </Button>

      <Button
        style={{ borderRadius: "5px", backgroundColor: "#FFA500" }}
        onClick={onClose}
      >
        Close
      </Button>
    </Form>
  );
};

// InstructorPage Component
const InstructorPage = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchInstructors();
  }, []);

  const toggleModal = () => setShowModal((prevShow) => !prevShow);

  const fetchInstructors = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/users`
      );
      const data = response.data.message;

      if (Array.isArray(data)) {
        setInstructors(data);
      } else {
        console.error("Expected an array but got:", data);
      }
    } catch (error) {
      console.error("Error fetching instructors:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInstructor = async (formData) => {
    const newInstructor = { ...formData, role: "instructor", isApproved: true };

    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/users/register`,
        newInstructor
      );
      fetchInstructors(); // Refresh the list after successful addition
      Swal.fire("Success", "Instructor added successfully.", "success");
    } catch (error) {
      Swal.fire("Error", `Error adding instructor: ${error.message}`, "error");
    }
  };

  const handleDelete = async (instructorId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/users-delete/${instructorId}`,
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        }
      );
      setInstructors((prevInstructors) =>
        prevInstructors.filter((i) => i._id !== instructorId)
      );
      Swal.fire("Success", "Instructor deleted successfully.", "success");
    } catch (error) {
      Swal.fire(
        "Error",
        `Error deleting instructor: ${error.message}`,
        "error"
      );
    }
  };

  const existingUsernames = instructors.map((i) => i.username); // For validation

  return (
    <div
      className="m-4 p-4"
      style={{ backgroundColor: "white", width: "97%", borderRadius: "5px" }}
    >
      <Button
        style={{ borderRadius: "25px", backgroundColor: "#2DBFCD" }}
        onClick={toggleModal}
      >
        <FontAwesomeIcon icon={faPlus} style={{ color: "white" }} /> Add
        Instructor
      </Button>

      {loading ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <Table className="table customTable mt-3">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {instructors.map((instructor) => (
              <tr key={instructor._id}>
                <td>{instructor.fullName}</td>
                <td>{instructor.username}</td>
                <td>{instructor.email}</td>
                <td>{instructor.phone}</td>
                <td>
                  <Button
                    variant="link"
                    onClick={() => handleDelete(instructor._id)}
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
          <Modal.Title>Add New Instructor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InstructorForm
            onSubmit={handleAddInstructor}
            onClose={toggleModal}
            existingUsernames={existingUsernames}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default InstructorPage;
