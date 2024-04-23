import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dropdown, Form, Row, Col, Alert } from "react-bootstrap";
import Swal from "sweetalert2";
import AppButton from "../AppButton";

const GroupAddModal = (props) => {
  const [name, setName] = useState("");
  const [instructor, setInstructor] = useState("");
  const [groupStudent, setGroupStudent] = useState([]);
  const [projects, setProjects] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [students, setStudents] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [errors, setErrors] = useState({});

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
    setName(editData.name || "");
    setInstructor(editData.instructor?._id || "");
    setGroupStudent(editData.students?.map((s) => s._id) || []);
    setProjects(editData.projects?.map((p) => p._id) || []);
  };

  const toggleGroupMember = (userId) => {
    setGroupStudent((prevStudents) => {
      if (prevStudents.includes(userId)) {
        return prevStudents.filter((id) => id !== userId);
      } else {
        return [...prevStudents, userId];
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
      newErrors.groupStudent = "Please select at least one student.";
    }
    if (projects.length === 0) {
      newErrors.projects = "Please select at least one project.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    const groupData = {
      name,
      instructor,
      students: groupStudent,
      projects,
    };

    const token = localStorage.getItem("authToken");

    try {
      if (props.edit) {
        console.log("Updating group:", groupData);
        // Make the PATCH or PUT request to update
      } else {
        console.log("Creating group:", groupData);
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/group/groups`,
          groupData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 201) {
          // Check for success status
          Swal.fire("Success", "Group added successfully!", "success");
          props.toggleModal(); // Close modal after success
          props.onGroupAdded(); // Callback to refresh parent component
        } else {
          Swal.fire("Error", "Failed to add group. Please try again.", "error");
        }
      }
    } catch (error) {
      console.error("Error creating group:", error);
      Swal.fire(
        "Error",
        `Error occurred: ${error.response?.data?.message || "Unknown error."}`,
        "error"
      );
    }
  };

  const getSelectedProjectsTitle = () => {
    const selectedProjects = availableProjects.filter((project) =>
      projects.includes(project._id)
    );
    return selectedProjects.map((project) => project.title).join(", ");
  };

  const getSelectedStudentName = () => {
    const selectedStudents = students.filter((student) =>
      groupStudent.includes(student._id)
    );
    return selectedStudents.map((student) => student.username).join(", ");
  };

  return (
    <div className="container-fluid">
      <h2>{props.edit ? "Update Group" : "Create Group"}</h2>

      <Row className="mb-3">
        <Col md={3}>
          <strong>Group Name</strong>
        </Col>
        <Col md={9}>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
