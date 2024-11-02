// MainPage.js
import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { Container, Navbar, Nav } from "react-bootstrap";
import DataOperationPage from "./DataOperationPage";
import SearchPage from "./SearchPage";
import ResultsPage from "./ResultsPage";
import SettingsPage from "./SettingsPage";
import AskPage from "./AskPage";

const MainPage = () => {
  return (
    <Router>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container fluid>
          <Navbar.Brand as={Link} to="/">
            Sanjaya
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav
              className="me-auto my-2 my-lg-0"
              style={{ maxHeight: "100px" }}
              navbarScroll
            ></Nav>
            <Nav>
              <Nav.Link as={Link} to="/settings">
                Settings
              </Nav.Link>
              <Nav.Link as={Link} to="/data-operations">
                Data Operations
              </Nav.Link>
              <Nav.Link as={Link} to="/ask">
                Ask
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Routes>
        <Route path="/data-operations" element={<DataOperationPage />} />
        <Route path="/" element={<SearchPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/settings" element={<SettingsPage />}></Route>
        <Route path="/ask" element={<AskPage />}></Route>
      </Routes>
    </Router>
  );
};

export default MainPage;
