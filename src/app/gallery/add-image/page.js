"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../add-image/page.module.css";
import { Form, Row, Col, Container, FormLabel, FormControl, Button } from "react-bootstrap";

const AddImage = () => {
  const [imageData, setImageData] = useState({
    date: "",
    image: null,
    groupName: "",
    shortText: "",
  });
  const [loading, setLoading] = useState(false); // Loading state for submit action
  const [error, setError] = useState(""); // Error state
  const [success, setSuccess] = useState(""); // Success message state
  const [galleryGroups, setGalleryGroups] = useState([]); // State to store fetched gallery groups

  // Fetch gallery groups for the dropdown
  useEffect(() => {
    const fetchGalleryGroups = async () => {
      try {
        const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/galleryGroups");
        console.log("API Response:", response.data); // Log the full response for inspection

        // Check if the response is an array or contains a nested data field
        if (Array.isArray(response.data)) {
          setGalleryGroups(response.data); // Set the fetched gallery groups into state if it's an array
        } else if (response.data && Array.isArray(response.data.data)) {
          // If the response has a 'data' field which is an array
          setGalleryGroups(response.data.data);
        } else {
          throw new Error("Response is not an array or expected structure.");
        }
      } catch (err) {
        console.error("Error fetching gallery groups:", err);
        setError("Failed to fetch gallery groups.");
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
    if (!imageData.image) {
      alert("Please select an image.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("date", imageData.date);
    formData.append("image", imageData.image);
    formData.append("group_name", imageData.groupName);
    formData.append("short_text", imageData.shortText);

    try {
      const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/images", formData, {
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
      setError("Failed to add image. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className={styles.inputs} style={{ maxWidth: "1200px" }}>
      <h2>Add Image</h2>

      <Form onSubmit={handleSubmit} className={styles.form}>
        <Row className="mb-3">
          <Col lg={6}>
            <FormLabel>Date</FormLabel>
            <FormControl
              type="date"
              name="date"
              value={imageData.date}
              onChange={handleInputChange}
              required
            />
          </Col>
          <Col lg={6}>
            <FormLabel>Image (Format Support: jpeg, jpg, png, gif)</FormLabel>
            <FormControl
              type="file"
              name="image"
              onChange={handleFileChange}
              required
            />
          </Col>
        </Row>
        <Row className="mb-3">
          <Col lg={6}>
            <FormLabel>Group Name</FormLabel>
            <Form.Select
              name="groupName"
              value={imageData.groupName}
              onChange={handleInputChange}
              aria-label="Select Group"
            >
              <option>Select</option>
              {Array.isArray(galleryGroups) && galleryGroups.length > 0 ? (
                galleryGroups.map((group) => (
                  <option key={group._id} value={group.groupName}>
                    {group.groupName}
                  </option>
                ))
              ) : (
                <option>No groups available</option>
              )}
            </Form.Select>
          </Col>
          <Col lg={6}>
            <FormLabel>Short Text</FormLabel>
            <FormControl
              as="textarea"
              name="shortText"
              rows={1}
              value={imageData.shortText}
              onChange={handleInputChange}
            />
          </Col>
        </Row>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
        <div className={styles.buttons}>
          <Button type="submit" disabled={loading} className={styles.btnn}>
            {loading ? "Adding..." : "Add Image"}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default AddImage;
