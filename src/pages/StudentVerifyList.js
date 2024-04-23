import React from "react";
import { Table, Button, Form, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

const StudentVerifyList = ({ students, onDelete, onToggleApproved }) => {
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
          {students.map((student) => (
            <tr key={student.studentId}>
              <td>{student.fullName}</td>
              <td>{student.studentId}</td>
              <td>{student.username}</td>
              <td>
                <Form.Check
                  type="switch"
                  checked={student.isApproved}
                  onChange={() => onToggleApproved(student.studentId)}
                />
              </td>
              <td>
                <Button
                  variant="link"
                  onClick={() => onDelete(student.studentId)}
                >
                  <FontAwesomeIcon icon={faTrashAlt} style={{ color: "red" }} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default StudentVerifyList;
