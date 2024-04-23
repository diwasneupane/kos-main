import React, { useState, useEffect } from "react";
import { Table, Spinner, Form, Button, Dropdown } from "react-bootstrap";
import axios from "axios";

const InstructorTable = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/users/users`
        );
        const data = response.data.message;

        if (Array.isArray(data)) {
          const filteredInstructors = roleFilter
            ? data.filter((instructor) => instructor.role === roleFilter)
            : data;

          setInstructors(filteredInstructors);
        } else {
          console.error("Expected an array but got:", data);
        }
      } catch (error) {
        console.error("Error fetching instructors:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, [roleFilter]); // Reload when role filter changes

  const filteredInstructors = instructors.filter((instructor) =>
    instructor.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="m-4 p-4"
      style={{ backgroundColor: "white", width: "97%", borderRadius: "5px" }}
    >
      <Form className="mb-3">
        <Form.Group controlId="search">
          <Form.Label>Search by Name:</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter name to search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Form.Group>
      </Form>

      <Dropdown className="mb-3">
        <Dropdown.Toggle variant="secondary" id="role-filter-dropdown">
          {roleFilter ? `Role: ${roleFilter}` : "Filter by Role"}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item onClick={() => setRoleFilter("")}>
            All Roles
          </Dropdown.Item>
          <Dropdown.Item onClick={() => setRoleFilter("instructor")}>
            Instructor
          </Dropdown.Item>
          <Dropdown.Item onClick={() => setRoleFilter("admin")}>
            Admin
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

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
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {filteredInstructors.map((instructor) => (
              <tr key={instructor._id}>
                <td>{instructor.fullName}</td>
                <td>{instructor.username}</td>
                <td>{instructor.email}</td>
                <td>{instructor.phone}</td>
                <td>{instructor.role}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default InstructorTable;
