import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";

const AskPage = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    try {
      const response = await fetch("http://localhost:5000/text/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnswer(data.answer); // Assuming the response contains { "answer": "..." }
      setError(null); // Clear any previous error message
    } catch (err) {
      console.error("Failed to retrieve results", err);
      setError("Failed to retrieve results. Please try again.");
      setAnswer(null); // Clear any previous answer
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents the default form submission
    handleSearch(); // Triggers search when Enter is pressed or button is clicked
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          <h3 style={{ marginTop: "10em", textAlign: "center" }}>Ask</h3>
          <Form className="d-flex mb-3" onSubmit={handleSubmit}>
            <Form.Control
              type="text"
              placeholder="Enter your question ..."
              className="me-2"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <Button variant="primary" onClick={handleSearch}>
              Ask
            </Button>
          </Form>

          {error && <Alert variant="danger">{error}</Alert>}
          {answer && (
            <Alert variant="success">
              <strong>Answer:</strong> {answer}
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AskPage;
