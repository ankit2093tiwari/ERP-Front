"use client";
import { useState, useEffect, useRef } from "react";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
} from "react-bootstrap";
import { toast } from "react-toastify";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { addNewGalleryImage, getAllGalleryGroups } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const AddImage = () => {
  const {hasSubmitAccess}=usePagePermission()
  const fileInputRef = useRef(null)
  const today = new Date().toISOString().split("T")[0];

  const [imageData, setImageData] = useState({
    date: today,
    image: null,
    groupName: "",
    shortText: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [galleryGroups, setGalleryGroups] = useState([]);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const fetchGalleryGroups = async () => {
      try {
        const response = await getAllGalleryGroups();
        setGalleryGroups(response.data || []);
      } catch (err) {
        toast.error("Failed to fetch gallery groups.");
      }
    };

    fetchGalleryGroups();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!imageData.image) newErrors.image = "Please select an image.";
    if (!imageData.groupName) newErrors.groupName = "Please select a gallery group.";
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setImageData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageData((prev) => ({ ...prev, image: file }));
      setErrors((prev) => ({ ...prev, image: "" }));

      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("date", imageData.date || today);
      formData.append("shortText", imageData.shortText);
      formData.append("groupName", imageData.groupName);
      formData.append("image", imageData.image);
      await addNewGalleryImage(formData)
      toast.success("Image added successfully!");
      fileInputRef.current.value = null;
      setImageData({ date: today, image: null, groupName: "", shortText: "" });
      setPreview("");
      setErrors({});
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
                    Upload Image
                  </FormLabel>
                  <FormControl
                    type="file"
                    name="image"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  {errors.image && (
                    <div className="text-danger mt-1">{errors.image}</div>
                  )}
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
                  {errors.groupName && (
                    <div className="text-danger mt-1">{errors.groupName}</div>
                  )}
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

             {hasSubmitAccess &&(
               <Button type="submit" disabled={loading} className="btn btn-primary mt-4">
                {loading ? "Uploading..." : "Add Image"}
              </Button>
             )}
            </Form>
          </div>
        </Container>
      </section>
    </>
  );
};

export default AddImage;