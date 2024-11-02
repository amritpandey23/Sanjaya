import React, { useState, useEffect } from "react";
import { Container, Row, Col, ListGroup, Form, Button } from "react-bootstrap";
import { useLocation } from "react-router-dom";

const ResultsPage = () => {
  const location = useLocation();
  const [searchText, setSearchText] = useState(
    new URLSearchParams(location.search).get("text") || ""
  );
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(); // Default value if not set in localStorage

  useEffect(() => {
    // Retrieve LIMIT from localStorage if available
    const savedLimit = localStorage.getItem("LIMIT");
    if (savedLimit) {
      setLimit(parseInt(savedLimit)); // Parse and set as integer
    }
  }, []);

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:5000/text/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: searchText, k: limit }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Sort results by increasing distance
      const sortedResults = data.results.sort(
        (a, b) => (a.distance || 0) - (b.distance || 0)
      );
      setResults(sortedResults);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch results:", err);
      setError("Failed to fetch results. Please try again later.");
    }
  };

  // Automatically perform the search when the page loads
  useEffect(() => {
    if (searchText) handleSearch();
  }, [searchText, limit]); // Re-run search if limit changes

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Form className="d-flex mb-4" onSubmit={(e) => e.preventDefault()}>
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

          {error && <p className="text-danger">{error}</p>}
          {results.length === 0 && !error ? (
            <p>No results found.</p>
          ) : (
            <ListGroup variant="flush">
              {results.map((result, index) => (
                <ListGroup.Item key={index} className="mb-3">
                  <p>
                    <strong>Text:</strong> {result.text}
                  </p>
                  <p>
                    <strong>Distance:</strong>{" "}
                    {(result.distance ?? 0).toFixed(2)}
                  </p>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ResultsPage;
