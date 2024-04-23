import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Form, Spinner, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

// Student verification component
const StudentVerifyList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch pending approval students
  const fetchPendingStudents = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/pendingApproval`
      );
      console.log(response);
      const pendingStudents = response.data.message.filter(
        (user) => user.role === "student" && !user.isApproved
      );
      setStudents(pendingStudents);
    } catch (err) {
      setError("Error fetching pending students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingStudents();
  }, []);

  // Approve a student
  const handleToggleApproval = async (studentId) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/users/users-approve/${studentId}`
      );
      setStudents((prev) =>
        prev.map((student) =>
          student.studentId === studentId
            ? { ...student, isApproved: !student.isApproved }
            : student
        )
      );
    } catch (err) {
      setError("Error approving student.");
    }
  };

  // Delete a student
  const handleDelete = async (studentId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/users-delete/${studentId}`
      );
      setStudents((prev) =>
        prev.filter((student) => student.studentId !== studentId)
      );
    } catch (err) {
      setError("Error deleting student.");
    }
  };

  if (loading) {
    return (
      <Spinner animation="border" role="status">
        Loading...
      </Spinner>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div
      className="p-4"
      style={{ backgroundColor: "white", borderRadius: "5px" }}
    >
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Student ID</th>
            <th>Username</th>
            <th>Approved</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((student) => (
              <tr key={student.studentId}>
                <td>{student.fullName}</td>
                <td>{student.studentId}</td>
                <td>{student.username}</td>
                <td>
                  <Form.Check
                    type="switch"
                    checked={student.isApproved}
                    onChange={() => handleToggleApproval(student.studentId)}
                  />
                </td>
                <td>
                  <Button
                    variant="link"
                    onClick={() => handleDelete(student.studentId)}
                  >
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      style={{ color: "red" }}
                    />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No pending approvals</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default StudentVerifyList;
