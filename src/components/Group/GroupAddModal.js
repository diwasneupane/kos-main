import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dropdown, Form, Row, Col, Alert } from "react-bootstrap";
import AppButton from "../AppButton";

const GroupAddModal = (props) => {
  const [name, setname] = useState("");
  const [instructor, setInstructor] = useState("");
  const [groupStudent, setGroupStudent] = useState([]);
  const [projects, setProjects] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [students, setStudents] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [errors, setErrors] = useState({}); // Error tracking
  const [successMessage, setSuccessMessage] = useState(null); // Success alert

  useEffect(() => {
    fetchUsers();
    fetchProjects();
    if (props.edit) {
      configureEditData();
    }
  }, [props.edit]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/users`
      );
      const users = response.data.message;
      if (Array.isArray(users)) {
        setInstructors(users.filter((user) => user.role === "instructor"));
        setStudents(users.filter((user) => user.role === "student"));
      } else {
        console.warn("Unexpected response format for users:", users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/project/Projects`
      );
      const projectsData = response.data;
      if (Array.isArray(projectsData)) {
        setAvailableProjects(projectsData);
      } else {
        console.warn("Expected an array of projects but got:", projectsData);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const configureEditData = () => {
    const editData = props.editData || {};
    setname(editData.name || "");
    setInstructor(editData.instructor || "");
    setGroupStudent(editData.Student || []);
    setProjects(editData.projects || []);
  };

  const toggleGroupMember = (userId) => {
    setGroupStudent((prevStudent) => {
      if (prevStudent.includes(userId)) {
        return prevStudent.filter((id) => id !== userId);
      } else {
        return [...prevStudent, userId];
      }
    });
  };

  const toggleProject = (projectId) => {
    setProjects((prevProjects) => {
      if (prevProjects.includes(projectId)) {
        return prevProjects.filter((id) => id !== projectId);
      } else {
        return [...prevProjects, projectId];
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = "Group Name is required.";
    }
    if (!instructor) {
      newErrors.instructor = "Please select an instructor.";
    }
    if (groupStudent.length === 0) {
      newErrors.groupStudent = "Please select at least one group member.";
    }
    if (projects.length === 0) {
      newErrors.projects = "Please select at least one project.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return; // If validation fails, do not proceed
    }

    const groupData = {
      name,
      instructor,
      student: groupStudent,
      projects,
    };

    if (props.edit) {
      console.log("Updating group:", groupData);
      // Call API to update the group
    } else {
      console.log("Creating group:", groupData);
      setSuccessMessage("Group added successfully!"); // Show success message
    }
  };

  const getSelectedProjectsTitle = () => {
    const selectedProjects = availableProjects.filter((project) =>
      projects.includes(project._id)
    );
    return selectedProjects.map((project) => project.title).join(", ");
  };

  const getSelectedStudentName = () => {
    const selectedStudent = students.filter((student) =>
      groupStudent.includes(student._id)
    );
    return selectedStudent.map((student) => student.username).join(", ");
  };

  return (
    <div className="container-fluid">
      <h2>{props.edit ? "Update Group" : "Create Group"}</h2>

      {Object.keys(errors).length > 0 && (
        <Alert variant="danger">{Object.values(errors)[0]}</Alert>
      )}
      {successMessage && (
        <Alert
          variant="success"
          onClose={() => setSuccessMessage(null)}
          dismissible
        >
          {successMessage}
        </Alert>
      )}

      <Row className="mb-3">
        <Col md={3}>
          <strong>Group Name</strong>
        </Col>
        <Col md={9}>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setname(e.target.value)}
            className="form-control"
            placeholder="Enter group name"
          />
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={3}>
          <strong>Instructor</strong>
        </Col>
        <Col md={9}>
          <select
            name="instructor"
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
            className="form-select"
          >
            <option value="" disabled>
              Choose Instructor
            </option>
            {instructors.map((instructor) => (
              <option key={instructor._id} value={instructor._id}>
                {instructor.username}
              </option>
            ))}
          </select>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={3}>
          <strong>Students</strong>
        </Col>
        <Col md={9}>
          <Dropdown>
            <Dropdown.Toggle
              className="w-100 text-bg-light"
              variant="info"
              id="dropdown-basic"
            >
              {groupStudent.length > 0
                ? `Selected: ${groupStudent.length}`
                : "Select Group Student"}
            </Dropdown.Toggle>
            <Dropdown.Menu
              className="w-100"
              style={{ backgroundColor: "white", padding: "20px" }}
            >
              {students.map((student) => (
                <Form.Check
                  type="switch"
                  label={student.username}
                  key={student._id}
                  checked={groupStudent.includes(student._id)}
                  onChange={() => toggleGroupMember(student._id)}
                />
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={3}>
          <strong>Projects</strong>
        </Col>
        <Col md={9}>
          <Dropdown>
            <Dropdown.Toggle
              className="w-100 text-bg-light"
              variant="info"
              id="dropdown-basic"
            >
              {projects.length > 0
                ? `Selected: ${getSelectedProjectsTitle()}`
                : "Select Projects"}
            </Dropdown.Toggle>
            <Dropdown.Menu
              className="w-100"
              style={{ backgroundColor: "white", padding: "20px" }}
            >
              {availableProjects.map((project) => (
                <Form.Check
                  type="switch"
                  label={project.title}
                  key={project._id}
                  checked={projects.includes(project._id)}
                  onChange={() => toggleProject(project._id)}
                />
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>

      <div className="d-flex justify-content-end">
        <AppButton
          style={{ backgroundColor: "#FFA500", color: "white" }}
          name={props.edit ? "Update" : "Create"}
          onClick={handleSubmit}
        />
      </div>
    </div>
  );
};

export default GroupAddModal;
