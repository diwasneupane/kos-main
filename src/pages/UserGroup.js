import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, ListGroup, Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";

// Utility function to decode JWT and extract user ID
const getUserIdFromToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // Extract JWT payload
    return payload.userId;
  } catch (error) {
    return null;
  }
};

const UserGroups = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userId = getUserIdFromToken(token);

    if (userId) {
      fetchUserGroups(userId, token);
    } else {
      Swal.fire("Error", "User ID not found in token.", "error");
    }
  }, []);

  const fetchUserGroups = async (userId, token) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/groups?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setGroups(response.data.groups); // Assuming the endpoint returns a 'groups' array
      } else {
        Swal.fire("Error", "Unable to fetch user groups.", "error");
      }
    } catch (error) {
      console.error("Error fetching user groups:", error);
      Swal.fire("Error", `Error occurred: ${error.message}`, "error");
    }
  };

  const sendMessage = async () => {
    if (!selectedGroup || message.trim() === "") {
      return;
    }

    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/group/${selectedGroup._id}/message`,
        { text: message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        Swal.fire("Success", "Message sent!", "success");
        setMessage(""); // Clear the input field after sending
      } else {
        Swal.fire("Error", "Failed to send message.", "error");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      Swal.fire("Error", `Error occurred: ${error.message}`, "error");
    }
  };

  return (
    <div>
      <h1>Your Groups</h1>
      {groups.length === 0 ? (
        <p>No groups found</p>
      ) : (
        <div>
          <h2>Groups List</h2>
          <ListGroup>
            {groups.map((group) => (
              <ListGroup.Item
                key={group._id}
                onClick={() => setSelectedGroup(group)}
                style={{ cursor: "pointer" }}
              >
                {group.name}
              </ListGroup.Item>
            ))}
          </ListGroup>

          {selectedGroup && (
            <Card className="mt-3">
              <Card.Body>
                <Card.Title>{selectedGroup.name}</Card.Title>
                <Card.Text>Members:</Card.Text>
                <ListGroup>
                  {selectedGroup.members.map((member) => (
                    <ListGroup.Item key={member._id}>
                      {member.name}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <Form.Group className="mt-3">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                  />
                </Form.Group>
                <Button onClick={sendMessage} className="mt-2">
                  Send Message
                </Button>
              </Card.Body>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default UserGroups;
