import React, { useState, useEffect } from "react";
import { Table, Button, Form, Spinner, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const PendingStudentApprovalList = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/pendingApproval`
      );
      const users = response.data.message;

      if (Array.isArray(users)) {
        setPendingUsers(users);
      } else {
        console.error("Expected an array of users but got:", users);
      }
    } catch (error) {
      setError("Error fetching pending approvals.");
      console.error("Error fetching pending approvals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (userId) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/users/users-approve/${userId}`
      );
      setPendingUsers(pendingUsers.filter((user) => user._id !== userId));
    } catch (error) {
      setError("Error approving user.");
      console.error("Error approving user:", error);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/users/users-delete/${userId}`
      );
      setPendingUsers(pendingUsers.filter((user) => user._id !== userId));
    } catch (error) {
      setError("Error deleting user.");
      console.error("Error deleting user:", error);
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
          {pendingUsers.length === 0 ? (
            <tr>
              <td colSpan="5">No users pending approval.</td>
            </tr>
          ) : (
            pendingUsers.map((user) => (
              <tr key={user._id}>
                <td>{user.fullName}</td>
                <td>{user.studentId}</td>
                <td>{user.username}</td>
                <td>
                  <Form.Check
                    type="switch"
                    checked={false} // Initially, users are pending approval
                    onChange={() => handleToggleApproval(user._id)}
                  />
                </td>
                <td>
                  <Button variant="link" onClick={() => handleDelete(user._id)}>
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      style={{ color: "red" }}
                    />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default PendingStudentApprovalList;
