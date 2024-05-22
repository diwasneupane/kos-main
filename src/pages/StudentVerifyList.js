import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Form, Alert, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faCheckCircle,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { getAuthToken } from "../utils/Auth";
import AppButton from "../components/AppButton";
import Swal from "sweetalert2";

const ApprovalVerifyList = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("unapproved"); // "approved" or "unapproved"
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: "",
    studentId: "",
  })

  const fetchAllStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/users`,
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        }
      );

      const allStudents = response.data.message.filter(
        (user) => user.role === "student"
      );

      setAllUsers(allStudents);
    } catch (err) {
      console.error("Error fetching all students:", err);
      setError("Error fetching all students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStudents();
  }, []);

  const handleToggleApproval = async (userId, currentStatus) => {
    const newApprovalStatus = !currentStatus;

    setAllUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === userId ? { ...user, isApproved: newApprovalStatus } : user
      )
    );

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

      fetchAllStudents(); // Re-fetch to ensure consistency
    } catch (err) {
      console.error("Error toggling approval status:", err);
      setError("Error toggling approval status.");

      setAllUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId
            ? { ...user, isApproved: currentStatus } // Revert if failed
            : user
        )
      );
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

      fetchAllStudents(); // Re-fetch after deletion
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Error deleting user.");
    }
  };

  const sendInvitation = () => {
    axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/invite-student`,
      inviteData,
      {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }
    ).then(() => {
      Swal.fire({
        title: "Success!",
        text: "Invitation sent successfully!",
        icon: "success",
      })
      
      setOpenInviteModal(false)
      setInviteData({
        email: "",
        studentId: "",
      })
    })
    .catch(err => {
      alert(err.response.data.message)
    })
  }

  const filteredUsers =
    filter === "approved"
      ? allUsers.filter((user) => user.isApproved) // Approved users
      : allUsers.filter((user) => !user.isApproved); // Unapproved users

  return (
    <div
      className="p-4 bg-white m-4"
      style={{ backgroundColor: "white", width: "97%", borderRadius: "5px" }}
    >
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "3",
          justifyContent: "start", // Center the buttons
        }}
      >
        <AppButton
          name="Unapproved"
          customStyle="addBtnColor"
          icon={faBan}
          onClick={() => setFilter("unapproved")}
        />

        <AppButton
          name="Approved"
          customStyle="addBtnColor"
          icon={faCheckCircle}
          onClick={() => setFilter("approved")}
        />

        <AppButton
          name="Invite Student"
          customStyle="addBtnColor ml-auto"
          onClick={() => setOpenInviteModal(true)}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Table className="table customTable mt-3">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Full Name</th>
              <th>Username</th>
              <th>Approved</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody className="tableData">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td className="tableData">{user.studentId}</td>
                  <td>{user.fullName}</td>
                  <td>{user.username}</td>
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
                <td
                  colSpan="5"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  {filter === "approved"
                    ? "No approved students found"
                    : "No unapproved students found"}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      <Modal show={openInviteModal} onHide={() => {
          setInviteData({
            email: "",
            studentId: "",
          });        
          setOpenInviteModal(false)
        }}>
        <Modal.Header closeButton>
          <Modal.Title>Invite student</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
            sendInvitation();
          }}>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData((val) => ({
                  ...val,
                  email: e.target.value
                }))}
                required
              />
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Student ID</Form.Label>
              <Form.Control
                type="text"
                value={inviteData.studentId}
                onChange={(e) => setInviteData((val) => ({
                  ...val,
                  studentId: e.target.value
                }))}
                required
              />
            </Form.Group>

            <div className="text-center mt-4">
              <Button
                type="submit"
                style={{
                  borderRadius: "5px",
                  border: "0",
                  backgroundColor: "#2DBFCD",
                  marginRight: "5px",
                }}
                variant="primary"
              >
                Invite
              </Button>

              <Button
                style={{
                  borderRadius: "5px",
                  border: "0",
                  backgroundColor: "#FFA500",
                }}
                variant="secondary"
                onClick={() => {
                  setOpenInviteModal(false);
                  setInviteData({
                    email: "",
                    studentId: "",
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ApprovalVerifyList;
