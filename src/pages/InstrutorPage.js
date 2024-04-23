import React, { useState, useEffect } from "react";
import { Form, Button, Modal, Table } from "react-bootstrap";
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
const InstructorForm = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFormSubmit = async () => {
    const usernameRegex = /^.{5,}$/; // At least 5 characters
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$%\^&\*]).{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate Full Name
    if (formData.fullName.trim() === "") {
      Swal.fire({
        title: "Error",
        text: "Full Name is required.",
        icon: "error",
      });
      return;
    }

    // Validate Username
    if (!usernameRegex.test(formData.username)) {
      Swal.fire({
        title: "Error",
        text: "Username must be at least 5 characters long.",
        icon: "error",
      });
      return;
    }

    // Validate Email
    if (!emailRegex.test(formData.email)) {
      Swal.fire({
        title: "Error",
        text: "Please enter a valid email address.",
        icon: "error",
      });
      return;
    }

    // Validate Password
    if (!passwordRegex.test(formData.password)) {
      Swal.fire({
        title: "Error",
        text: "Password must have at least 8 characters with one uppercase, one lowercase, one number, and one special character.",
        icon: "error",
      });
      return;
    }

    // Username Availability Check
    const isUsernameAvailable = await axios
      .get(
        `${process.env.REACT_APP_API_BASE_URL}/users/validate-username/${formData.username}`
      )
      .then((res) => res.data.available);

    if (!isUsernameAvailable) {
      Swal.fire({
        title: "Error",
        text: "Username already exists.",
        icon: "error",
      });
      return;
    }

    if (onSubmit) {
      await onSubmit(formData);
      Swal.fire({
        title: "Success",
        text: "Instructor added successfully.",
        icon: "success",
      });
      onClose();
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Form>
      <Form.Group>
        <Form.Label>Full Name</Form.Label>
        <Form.Control
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={(e) => handleFormChange("fullName", e.target.value)}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Username</Form.Label>
        <Form.Control
          type="text"
          name="username"
          value={formData.username}
          onChange={(e) => handleFormChange("username", e.target.value)}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          name="email"
          value={formData.email}
          onChange={(e) => handleFormChange("email", e.target.value)}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Phone</Form.Label>
        <Form.Control
          type="text"
          name="phone"
          value={formData.phone}
          onChange={(e) => handleFormChange("phone", e.target.value)}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Password</Form.Label>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Form.Control
            type={showPassword ? "text" : "password"}
            name="password"
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
          border: "0",
          backgroundColor: "#2DBFCD",
          marginRight: "5px",
        }}
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

  const fetchInstructors = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/users`
      );
      const users = response.data.message;

      if (Array.isArray(users)) {
        const instructorList = users.filter(
          (user) => user.role === "instructor"
        );
        setInstructors(instructorList);
      } else {
        console.error("Expected an array of users but got:", users);
      }
    } catch (error) {
      console.error("Error fetching instructors:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleModal = () => setShowModal(!showModal);

  const handleAddInstructor = async (formData) => {
    const data = { ...formData, role: "instructor", isApproved: true };

    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/users/register`,
        data
      );
      fetchInstructors();
      console.log(data.email);
      toggleModal();
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Error adding instructor. Please try again.",
        icon: "error",
      });
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
      setInstructors(instructors.filter((i) => i._id !== instructorId));
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Error deleting instructor. Please try again.",
        icon: "error",
      });
    }
  };

  return (
    <div
      className="p-4"
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
        <FontAwesomeIcon icon={faPlus} style={{ color: "white" }} /> Add
        Instructor
      </Button>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <Table className="table customTable mt-3">
          <thead>
            <tr>
              <th style={{ width: "30%" }}>Full Name</th>
              <th style={{ width: "20%" }}>Username</th>
              <th style={{ width: "20%" }}>Email</th>
              <th style={{ width: "10%" }}>Phone</th>
              <th style={{ width: "10%" }}>Actions</th>
            </tr>
          </thead>
          <tbody className="tableData">
            {instructors.map((instructor) => (
              <tr key={instructor._id}>
                <td>{instructor.fullName}</td>
                <td>{instructor.username}</td>
                <td>{instructor.email}</td> {/* Check this line */}
                <td>{instructor.phone}</td> {/* Check this line */}
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
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default InstructorPage;
