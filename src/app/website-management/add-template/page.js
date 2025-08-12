"use client";
import { addNewTemplate } from "@/Services";
import { useState } from "react";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

// Predefined allowed fields per template
const allowedFields = {
    HomeTemplate: [
        "bannerImage",
        "introTitle",
        "introContent",
        "features",
        "footerNote"
    ],
    AboutUsTemplate: [
        "mainImage",
        "aboutText",
        "mission",
        "vision"
    ],
    ContactUsTemplate: [
        "bannerImage",
        "address",
        "phone",
        "email",
        "mapEmbedUrl",
        "additionalInfo"
    ],
    ServicePageTemplate: [
        "bannerImage",
        "introTitle",
        "introContent",
        "services",
        "conclusion"
    ]
};

const AddTemplate = () => {
    const [templateName, setTemplateName] = useState("");
    const [componentName, setComponentName] = useState("");
    const [fields, setFields] = useState([{ name: "", type: "text" }]);

    const handleFieldChange = (index, key, value) => {
        const updatedFields = [...fields];
        updatedFields[index][key] = value;
        setFields(updatedFields);
    };

    const addField = () => {
        setFields(prev => [...prev, { name: "", type: "text" }]);
    };

    const removeField = (index) => {
        setFields(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!templateName.trim() || !componentName.trim()) {
            toast.error("Template Name and Component Name are required");
            return;
        }

        if (fields.some((f) => !f.name.trim() || !f.type.trim())) {
            toast.error("Please complete all field names and types");
            return;
        }

        try {
            const payload = {
                name: templateName.trim(),
                componentName: componentName.trim(),
                fields,
            };

            await addNewTemplate(payload);
            toast.success("Template added successfully!");

            // Reset form
            setTemplateName("");
            setComponentName("");
            setFields([{ name: "", type: "text" }]);
        } catch (err) {
            console.error(err);
            toast.error("Failed to add template");
        }
    };

    return (
        <section>
            <Container>
                <div className="cover-sheet">
                    <div className="studentHeading">
                        <h2>Add Page Template</h2>
                    </div>
                    <Form onSubmit={handleSubmit} className="formSheet">
                        <Form.Group className="mb-3" controlId="templateName">
                            <Form.Label>Template Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="e.g. Home Template"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="componentName">
                            <Form.Label>Component Name</Form.Label>
                            <Form.Select
                                value={componentName}
                                onChange={(e) => {
                                    setComponentName(e.target.value);
                                    setFields([{ name: "", type: "text" }]); // reset fields
                                }}
                                required
                            >
                                <option value="">-- Select Template --</option>
                                <option value="HomeTemplate">Home Template</option>
                                <option value="AboutUsTemplate">About Us Template</option>
                                <option value="ContactUsTemplate">Contact Us Template</option>
                                <option value="ServicePageTemplate">Service Page Template</option>
                            </Form.Select>
                        </Form.Group>

                        <h5>Fields</h5>
                        {fields.map((field, index) => (
                            <Row key={index} className="align-items-end mb-2">
                                <Col md={5}>
                                    <Form.Select
                                        value={field.name}
                                        onChange={(e) => handleFieldChange(index, "name", e.target.value)}
                                        required
                                        disabled={!componentName}
                                    >
                                        <option value="">-- Select Field --</option>
                                        {componentName &&
                                            allowedFields[componentName]?.map((fieldOption) => (
                                                <option key={fieldOption} value={fieldOption}>
                                                    {fieldOption}
                                                </option>
                                            ))}
                                    </Form.Select>
                                </Col>
                                <Col md={5}>
                                    <Form.Select
                                        value={field.type}
                                        onChange={(e) => handleFieldChange(index, "type", e.target.value)}
                                    >
                                        <option value="text">Text</option>
                                        <option value="html">HTML</option>
                                        <option value="image">Image</option>
                                    </Form.Select>
                                </Col>
                                <Col md={2} className="text-end">
                                    {fields.length > 1 && (
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => removeField(index)}
                                        >
                                            <FaTrash />
                                        </Button>
                                    )}
                                </Col>
                            </Row>
                        ))}

                        <Row className="mt-3">
                            <Col>
                                <Button variant="secondary" onClick={addField} disabled={!componentName}>
                                    + Add Field
                                </Button>
                                <Button type="submit" variant="success" className="ms-2">
                                    Save Template
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </Container>
        </section>
    );
};

export default AddTemplate;
