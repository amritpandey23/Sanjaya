import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Alert,
} from "react-bootstrap";

const DataOperationPage = () => {
  const [inputText, setInputText] = useState("");
  const [storedData, setStoredData] = useState([]);
  const [message, setMessage] = useState(null);

  // Fetch stored data on component mount
  useEffect(() => {
    const fetchStoredData = async () => {
      try {
        const response = await fetch("http://localhost:5000/text/all");

        if (!response.ok) {
          throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }

        const result = await response.json();
        setStoredData(result.data); // Set the fetched data to populate the table
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage({ type: "danger", text: "Failed to fetch stored data." });
      }
    };

    fetchStoredData();
  }, []);

  const handleStore = async () => {
    if (inputText.trim() !== "") {
      try {
        const response = await fetch("http://localhost:5000/embeddings/store", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: inputText }),
        });

        const result = await response.json();

        if (response.ok) {
          setMessage({ type: "success", text: result.message });
          const newRow = {
            id: storedData.length + 1,
            text: inputText,
          };
          setStoredData([...storedData, newRow]); // Add new row to the stored data table
          setInputText(""); // Clear the input field
        } else {
          setMessage({ type: "danger", text: result.error });
        }
      } catch (error) {
        console.error("Error storing data:", error);
        setMessage({
          type: "danger",
          text: "An error occurred while storing data.",
        });
      }
    }
  };

  return (
    <Container className="mt-5">
      <h3>Data Operation</h3>
      <Row className="mt-4">
        <Col md={6}>
          <Form.Group>
            <Form.Control
              as="textarea"
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter your text to store..."
            />
          </Form.Group>
          <Button variant="primary" className="mt-2" onClick={handleStore}>
            Convert & Store
          </Button>
          {message && (
            <Alert variant={message.type} className="mt-3">
              {message.text}
            </Alert>
          )}
        </Col>
        <Col md={12} className="mt-5">
          <h5>Sample Data (Row Id, Text)</h5>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            <Table bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Text</th>
                </tr>
              </thead>
              <tbody>
                {storedData.map((data) => (
                  <tr key={data.id}>
                    <td>{data.id}</td>
                    <td>{data.text}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default DataOperationPage;
