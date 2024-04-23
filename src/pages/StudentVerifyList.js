import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Form, Spinner, Alert, Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { getAuthToken } from "../utils/Auth"; // Adjust the import path as needed

const ApprovalVerifyList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState(""); // Role-based filter state

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/pendingApproval`,
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        }
      );

      const allPendingUsers = response.data.message.filter(
        (user) => !user.isApproved
      );

      // Apply role-based filter
      const filteredUsers = roleFilter
        ? allPendingUsers.filter((user) => user.role === roleFilter)
        : allPendingUsers;

      setUsers(filteredUsers);
    } catch (err) {
      console.error("Error fetching pending users:", err);
      setError("Error fetching pending users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, [roleFilter]); // Reloads when role filter changes

  const handleToggleApproval = async (userId, currentStatus) => {
    const newApprovalStatus = !currentStatus; // Toggle the status
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/users/users-approve/${userId}`,
        {
          isApproved: newApprovalStatus,
        },
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        }
      );

      fetchPendingUsers(); // Re-fetch the data after toggling approval
    } catch (err) {
      console.error("Error toggling approval status:", err);
      setError("Error toggling approval status.");
    }
  };

  const handleDelete = async (userId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/users/users-delete/${userId}`,
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        }
      );

      fetchPendingUsers(); // Re-fetch the data after deleting a user
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Error deleting user.");
    }
  };

  return (
    <div>
      {loading ? (
        <div style={{ textAlign: "center" }}>
          <Spinner animation="border" role="status" />
          <span>Loading...</span>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <div>
          <Dropdown className="mb-3">
            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
              {roleFilter ? `Filter by Role: ${roleFilter}` : "Filter by Role"}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setRoleFilter("")}>
                All
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setRoleFilter("student")}>
                Student
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setRoleFilter("instructor")}>
                Instructor
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Approved</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.fullName}</td>
                    <td>{user.username}</td>
                    <td>{user.role}</td>
                    <td>
                      <Form.Check
                        type="switch"
                        checked={user.isApproved}
                        onChange={() =>
                          handleToggleApproval(user._id, user.isApproved)
                        }
                      />
                    </td>
                    <td>
                      <Button
                        variant="link"
                        onClick={() => handleDelete(user._id)}
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
      )}
    </div>
  );
};

export default ApprovalVerifyList;
