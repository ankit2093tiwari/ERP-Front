"use client";
import { useEffect, useState } from "react";
import { Form, Button, Container } from "react-bootstrap";
import { addNewPage, deletePageById, getAllPages, getAllTemplates } from "@/Services";
import Table from "@/app/component/DataTable";
import { FaEye, FaTrashAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const AddPage = () => {
  const router = useRouter()
  const [pagesData, setPagesdata] = useState([])
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [title, setTitle] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTemplates();
    fetchPagesData()
  }, []);

  const fetchTemplates = async () => {
    const res = await getAllTemplates();
    setTemplates(res?.data || []);
  };

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    const template = templates.find((t) => t._id === templateId);
    setSelectedTemplate(template);
    setFormValues({});
    // console.log(template);
  };

  const handleFieldChange = (value, fieldType, fieldName, isFile = false) => {
    // Clear the error for the current field
    setFieldErrors((prevErrors) => ({ ...prevErrors, [fieldName]: null }));

    // Update the value
    if (isFile) {
      setFormValues((prevValues) => ({
        ...prevValues,
        [fieldName]: value.target.files[0],
      }));
    } else {
      setFormValues((prevValues) => ({
        ...prevValues,
        [fieldName]: value,
      }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTemplate) {
      toast.error("Please select a template.");
      return;
    }

    const errors = {};
    selectedTemplate.fields.forEach((field) => {
      const value = formValues[field.name];

      if (field.type === "image") {
        if (!value) {
          errors[field.name] = `${field.name} is required`;
        }
      } else {
        if (!value || (typeof value === "string" && value.trim() === "")) {
          errors[field.name] = `${field.name} is required`;
        }
      }
    });

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("templateId", selectedTemplate._id);

      selectedTemplate.fields.forEach((field) => {
        const value = formValues[field.name];
        formData.append(field.name, value);
      });

      await addNewPage(formData);
      toast.success("Page created!");
      fetchPagesData();

      // Reset form
      setTitle("");
      setFormValues({});
      setSelectedTemplate(null);
      setFieldErrors({});
    } catch (error) {
      console.error("failed to add page!", error);
      toast.error("Failed to add page!");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    const { name, type } = field;
    const error = fieldErrors[name];

    if (type === "image") {
      return (
        <Form.Group key={name} className="mt-2">
          <Form.Label>{name}</Form.Label>
          <Form.Control
            type="file"
            name={name}
            accept="image/*"
            onChange={(e) => handleFieldChange(e, type, name, true)}
            isInvalid={!!error}
          />
          {error && <Form.Text className="text-danger">{error}</Form.Text>}
        </Form.Group>
      );
    }

    if (type === "html") {
      return (
        <Form.Group key={name} className="mt-2">
          <Form.Label>{name}</Form.Label>
          <Form.Control
            as="textarea"
            rows={6}
            value={formValues[name] || ""}
            onChange={(e) => handleFieldChange(e.target.value, type, name)}
            placeholder="Paste your HTML code / Plain Text here"
            isInvalid={!!error}
          />
          {error && <Form.Text className="text-danger">{error}</Form.Text>}
        </Form.Group>
      );
    }

    return (
      <Form.Group key={name} className="mt-2">
        <Form.Label>{name}</Form.Label>
        <Form.Control
          type="text"
          name={name}
          value={formValues[name] || ""}
          onChange={(e) => handleFieldChange(e.target.value, type, name)}
          isInvalid={!!error}
        />
        {error && <Form.Text className="text-danger">{error}</Form.Text>}
      </Form.Group>
    );
  };


  const fetchPagesData = async () => {
    const res = await getAllPages();
    //  console.log(res);
    setPagesdata(res?.data)
  }

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "60px"
    }, {
      name: "Page Totle",
      selector: (row) => row?.title || "N/A",
      width: "200px",
      sortable: true,
    }, {
      name: "Page Template",
      selector: (row) => row.templateId?.name || "N/A",
    }, {
      name: "Actions",
      selector: (row) => (
        <div className="d-flex gap-1">
          <Button variant="success" size="sm" onClick={() => ViewPage(row._id)}><FaEye /></Button>
          <Button variant="danger" size="sm" onClick={() => deletePage(row._id)}><FaTrashAlt /></Button>
        </div>
      )
    }
  ]
  const ViewPage = async (id) => {
    router.push(`/website-management/view/${id}`)
  }
  const deletePage = async (id) => {
    if (!confirm("Are you sure to want to delete this page?")) return
    const res = await deletePageById(id);
    toast.success("Page deleted !")
    fetchPagesData()
  }
  return (
    <section>
      <Container>
        <div className="cover-sheet">
          <Form onSubmit={handleSubmit} className="formSheet">
            <Form.Group>
              <Form.Label>Page Title<span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Page Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Select Template<span className="text-danger">*</span></Form.Label>
              <Form.Select onChange={handleTemplateChange}>
                <option>Select</option>
                {templates.map((temp) => (
                  <option key={temp._id} value={temp._id}>
                    {temp.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {selectedTemplate?.fields?.map(renderField)}

            <Button type="submit" className="mt-3" disabled={loading}>
              Save Page
            </Button>
          </Form>
        </div>
        <div className="tableSheet">
          <Table data={pagesData} columns={columns} />
        </div>
      </Container>
    </section>
  );
};

export default AddPage;
