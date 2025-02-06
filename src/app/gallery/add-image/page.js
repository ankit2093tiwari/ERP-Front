"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../add-image/page.module.css";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb } from "react-bootstrap";

const AddImage = () => {
  const [imageData, setImageData] = useState({
    date: "",
    image: null,
    groupName: "",
    shortText: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [galleryGroups, setGalleryGroups] = useState([]);

  // Fetch gallery groups for the dropdown
  useEffect(() => {
    const fetchGalleryGroups = async () => {
      try {
        const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/galleryGroups");
        if (response.data && Array.isArray(response.data.data)) {
          setGalleryGroups(response.data.data);
        } else {
          throw new Error("Unexpected response structure.");
        }
      } catch (err) {
        console.error("Error fetching gallery groups:", err);
        setError("Failed to fetch gallery groups. Please try again later.");
      }
    };

    fetchGalleryGroups();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setImageData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setImageData((prevData) => ({
      ...prevData,
      image: e.target.files[0],
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!imageData.image) {
      setError("Please select an image file.");
      return;
    }
    if (!imageData.groupName) {
      setError("Please select a gallery group.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("date", imageData.date);
    formData.append("image", imageData.image);
    formData.append("groupName", imageData.groupName);
    formData.append("shortText", imageData.shortText);

    try {
      const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/images/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Image added successfully!");
      setImageData({
        date: "",
        image: null,
        groupName: "",
        shortText: "",
      });
    } catch (err) {
      console.error("Error adding image:", err);
      setError(
        err.response?.data?.message || "Failed to add image. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className='mt-1 mb-1'>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/gallery/all-module">
              Gallery
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Add Image</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      <div className="cover-sheet">
        <div className="studentHeading"><h2>Add Image</h2> </div>
        <Form onSubmit={handleSubmit} className="formSheet">
          <Row className="mb-3">
            <Col lg={6}>
              <FormLabel className="labelForm">Date</FormLabel>
              <FormControl
                type="date"
                name="date"
                value={imageData.date}
                onChange={handleInputChange}
                required
              />
            </Col>
            <Col lg={6}>
              <FormLabel className="labelForm">Image (jpeg, jpg, png, gif)</FormLabel>
              <FormControl
                type="file"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
                required
              />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col lg={6}>
              <FormLabel className="labelForm">Group Name</FormLabel>
              <Form.Select
                name="groupName"
                value={imageData.groupName}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a group</option>
                {galleryGroups.length > 0 ? (
                  galleryGroups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.groupName}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No groups available
                  </option>
                )}
              </Form.Select>
            </Col>
            <Col lg={6}>
              <FormLabel className="labelForm">Short Text</FormLabel>
              <FormControl
                as="textarea"
                name="shortText"
                rows={1}
                value={imageData.shortText}
                onChange={handleInputChange}
                required
              />
            </Col>
          </Row>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {success && <p style={{ color: "green" }}>{success}</p>}
          <div className={styles.buttons}>
            <Button type="submit" disabled={loading} className="btn btn-primary mt-4">
              {loading ? "Adding..." : "Add Image"}
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default AddImage;
