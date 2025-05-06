"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Alert } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { CgAddR } from "react-icons/cg";

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
  const [preview, setPreview] = useState("");

  // Fetch gallery groups for the dropdown
  useEffect(() => {
    const fetchGalleryGroups = async () => {
      try {
        const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/galleryGroups");
        setGalleryGroups(response.data.data || []);
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

  // Handle file change with preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageData((prevData) => ({
        ...prevData,
        image: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate required fields
    if (!imageData.image) {
      setError("Please select an image file.");
      setLoading(false);
      return;
    }
    if (!imageData.groupName) {
      setError("Please select a gallery group.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("date", imageData.date || new Date().toISOString().split('T')[0]);
      formData.append("image", imageData.image);
      formData.append("groupName", imageData.groupName);
      formData.append("shortText", imageData.shortText);

      const response = await axios.post(
        "https://erp-backend-fy3n.onrender.com/api/images/add",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccess("Image added successfully!");
      setImageData({
        date: "",
        image: null,
        groupName: "",
        shortText: "",
      });
      setPreview("");
    } catch (err) {
      console.error("Error adding image:", err);
      setError(
        err.response?.data?.message || "Failed to add image. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: "Gallery", link: "/gallery/all-module" },
    { label: "Add Image", link: "null" },
  ];

  return (
    <>
      <div className="breadcrumbSheet position-relative">
        <Container>
          <Row className="mt-1 mb-1">
            <Col>
              <BreadcrumbComp items={breadcrumbItems} />
            </Col>
          </Row>
        </Container>
      </div>
      <section>
        <Container>
          <div className="cover-sheet">
            <div className="studentHeading">
              <h2>Add Image</h2>
            </div>
            <Form onSubmit={handleSubmit} className="formSheet">
              <Row className="mb-3">
                <Col lg={6}>
                  <FormLabel className="labelForm">Date</FormLabel>
                  <FormControl
                    type="date"
                    name="date"
                    value={imageData.date}
                    onChange={handleInputChange}
                  />
                </Col>
                <Col lg={6}>
                  <FormLabel className="labelForm">
                    Image (jpeg, jpg, png, gif)
                  </FormLabel>
                  <FormControl
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                  />
                  {preview && (
                    <div className="mt-2">
                      <img
                        src={preview}
                        alt="Preview"
                        style={{ maxWidth: "200px", maxHeight: "200px" }}
                      />
                    </div>
                  )}
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
                    {galleryGroups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.groupName}
                      </option>
                    ))}
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
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              <Button
                type="submit"
                disabled={loading}
                className="btn btn-primary mt-4"
              >
                {loading ? "Uploading..." : "Add Image"}
              </Button>
            </Form>
          </div>
        </Container>
      </section>
    </>
  );
};

export default AddImage;