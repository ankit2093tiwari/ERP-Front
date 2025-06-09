"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const AddImage = () => {
  const today = new Date().toISOString().split("T")[0];

  const [imageData, setImageData] = useState({
    date: today,
    image: null,
    groupName: "",
    shortText: "",
  });
  const [loading, setLoading] = useState(false);
  const [galleryGroups, setGalleryGroups] = useState([]);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const fetchGalleryGroups = async () => {
      try {
        const response = await axios.get(
          "https://erp-backend-fy3n.onrender.com/api/galleryGroups"
        );
        setGalleryGroups(response.data.data || []);
      } catch (err) {
        toast.error("Failed to fetch gallery groups.");
      }
    };

    fetchGalleryGroups();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setImageData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageData((prevData) => ({
        ...prevData,
        image: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!imageData.image) {
      toast.warning("Please select an image.");
      setLoading(false);
      return;
    }
    if (!imageData.groupName) {
      toast.warning("Please select a gallery group.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("date", imageData.date || today);
      formData.append("shortText", imageData.shortText);
      formData.append("groupName", imageData.groupName);
      formData.append("image", imageData.image);

      const response = await axios.post(
        "https://erp-backend-fy3n.onrender.com/api/images",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success("Image added successfully!");
      setImageData({
        date: today,
        image: null,
        groupName: "",
        shortText: "",
      });
      setPreview("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload image.");
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
                  />
                </Col>
              </Row>

              <Button type="submit" disabled={loading} className="btn btn-primary mt-4">
                {loading ? "Uploading..." : "Add Image"}
              </Button>
            </Form>
          </div>
        </Container>
      </section>

      <ToastContainer />
    </>
  );
};

export default AddImage;
