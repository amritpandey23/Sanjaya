import React, { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col, Alert } from "react-bootstrap";

const SettingsPage = () => {
  const [limit, setLimit] = useState("");
  const [searchMethod, setSearchMethod] = useState("K-Nearest Neighbor"); // Default method
  const [message, setMessage] = useState(null);

  // Load saved limit and search method from localStorage when the component mounts
  useEffect(() => {
    const savedLimit = localStorage.getItem("LIMIT");
    const savedMethod = localStorage.getItem("SEARCH_METHOD");

    if (savedLimit) {
      setLimit(savedLimit);
    }
    if (savedMethod) {
      setSearchMethod(savedMethod);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("LIMIT", limit);
    localStorage.setItem("SEARCH_METHOD", searchMethod);
    setMessage({ type: "success", text: "Settings saved successfully!" });
  };

  return (
    <Container className="mt-5">
      <h3>Settings</h3>
      <Row className="justify-content-center mt-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Limit</Form.Label>
            <Form.Control
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="Enter limit value"
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>Search Method</Form.Label>
            <Form.Select
              value={searchMethod}
              onChange={(e) => setSearchMethod(e.target.value)}
            >
              <option value="knn">K-Nearest Neighbor</option>
              <option value="cosine">Cosine Similarity</option>
              <option value="dr">Dense Retrieval</option>
            </Form.Select>
          </Form.Group>
          <Button variant="primary" className="mt-3" onClick={handleSave}>
            Save
          </Button>
          {message && (
            <Alert variant={message.type} className="mt-3">
              {message.text}
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default SettingsPage;
