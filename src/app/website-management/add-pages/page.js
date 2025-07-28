"use client";
import { useEffect, useState } from "react";
import { Form, Button, Container } from "react-bootstrap";
import { addNewPage, getAllPages, getAllTemplates } from "@/Services";
import Table from "@/app/component/DataTable";
import { FaEye, FaTrashAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";

const AddPage = () => {
  const router = useRouter()
  const [pagesData, setPagesdata] = useState([])
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [title, setTitle] = useState("");

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
  };

  const handleFieldChange = (value, fieldType, fieldName, isFile = false) => {
    if (isFile) {
      setFormValues({ ...formValues, [fieldName]: value.target.files[0] });
    } else {
      setFormValues({ ...formValues, [fieldName]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("templateId", selectedTemplate._id);

    selectedTemplate.fields.forEach((field) => {
      const value = formValues[field.name];
      if (field.type === "image") {
        formData.append(field.name, value); // file
      } else {
        formData.append(field.name, value); // string/html
      }
    });

    await addNewPage(formData);
    alert("Page created!");
  };

  const renderField = (field) => {
    const { name, type } = field;

    if (type === "image") {
      return (
        <Form.Group key={name} className="mt-2">
          <Form.Label>{name}</Form.Label>
          <Form.Control
            type="file"
            name={name}
            accept="image/*"
            onChange={(e) => handleFieldChange(e, type, name, true)}
          />
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
            placeholder="Paste your HTML code here"
          />
        </Form.Group>
      );
    }

    // Default: text input
    return (
      <Form.Group key={name} className="mt-2">
        <Form.Label>{name}</Form.Label>
        <Form.Control
          type="text"
          name={name}
          value={formValues[name] || ""}
          onChange={(e) => handleFieldChange(e.target.value, type, name)}
        />
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
      name: "PageName",
      selector: (row) => row?.title || "N/A",
      width: "150px",
      sortable: true,
    }, {
      name: "PageContent",
      selector: (row) => row.content.content || "N/A",
      width: "150px"
    }, {
      name: "Actions",
      selector: (row) => (
        <div className="d-flex gap-1">
          <Button variant="success" size="sm" onClick={() => ViewPage(row._id)}><FaEye /></Button>
          <Button variant="danger" size="sm"><FaTrashAlt /></Button>
        </div>
      )
    }
  ]
  const ViewPage = async (id) => {
    router.push(`/website-management/view/${id}`)
  }
  return (
    <section>
      <Container>
        <div className="cover-sheet">
          <Form onSubmit={handleSubmit} className="formSheet">
            <Form.Group>
              <Form.Label>Page Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Select Template</Form.Label>
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

            <Button type="submit" className="mt-3">
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
