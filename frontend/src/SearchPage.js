import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const SearchPage = () => {
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate(`/results?text=${encodeURIComponent(searchText)}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents the default form submission
    handleSearch(); // Triggers search when Enter is pressed or button is clicked
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          <h3 style={{ marginTop: "10em", textAlign: "center" }}>Search</h3>
          <Form className="d-flex" onSubmit={handleSubmit}>
            <Form.Control
              type="text"
              placeholder="Enter your Text"
              className="me-2"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button variant="primary" onClick={handleSearch}>
              Search
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default SearchPage;
