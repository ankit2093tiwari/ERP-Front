"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable"; // Ensure this path is correct
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
  Breadcrumb,
} from "react-bootstrap";
import axios from "axios";

const RouteMaster = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [route, setRoute] = useState({
    vehicleNo: "",
    routeName: "",
    pickupPoints: [{ point: "", amount: "" }],
  });

  const baseUrl = "https://erp-backend-fy3n.onrender.com/api/vehicles";

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Vehicle No",
      selector: (row) => row.vehicleNo || "N/A",
      sortable: true,
    },
    {
      name: "Route",
      selector: (row) => row.routeName || "N/A",
      sortable: true,
    },
    {
      name: "Pickup Points",
      selector: (row) =>
        row.pickupPoints
          .map((p) => `(${p.point}) Amount: ${p.amount}`)
          .join(", ") || "N/A",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="editButton" onClick={() => handleEdit(row._id)}>
            <FaEdit />
          </button>
          <button
            className="editButton btn-danger"
            onClick={() => handleDelete(row._id)}
          >
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(baseUrl);
      setData(response.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const response = await axios.post(baseUrl, route);
      setData([...data, response.data]);
      setRoute({ vehicleNo: "", routeName: "", pickupPoints: [{ point: "", amount: "" }] });
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding route:", err);
      setError("Failed to add route. Please try again later.");
    }
  };

  const handleEdit = async (id) => {
    const item = data.find((row) => row._id === id);
    const updatedRouteName = prompt("Enter new route name:", item?.routeName || "");

    if (updatedRouteName) {
      try {
        await axios.put(`${baseUrl}/${id}`, { routeName: updatedRouteName });
        setData((prevData) =>
          prevData.map((row) =>
            row._id === id ? { ...row, routeName: updatedRouteName } : row
          )
        );
      } catch (err) {
        console.error("Error updating route:", err);
        setError("Failed to update route. Please try again later.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this route?")) {
      try {
        await axios.delete(`${baseUrl}/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (err) {
        console.error("Error deleting route:", err);
        setError("Failed to delete route. Please try again later.");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePickupChange = (index, field, value) => {
    const updatedPoints = [...route.pickupPoints];
    updatedPoints[index][field] = value;
    setRoute({ ...route, pickupPoints: updatedPoints });
  };

  const addPickupPoint = () => {
    setRoute({ ...route, pickupPoints: [...route.pickupPoints, { point: "", amount: "" }] });
  };

  const removePickupPoint = (index) => {
    const updatedPoints = route.pickupPoints.filter((_, i) => i !== index);
    setRoute({ ...route, pickupPoints: updatedPoints });
  };

  return (
    <Container>
      <Breadcrumb>
        <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
        <Breadcrumb.Item href="/Transport/all-module">Transport</Breadcrumb.Item>
        <Breadcrumb.Item active>Route Master</Breadcrumb.Item>
      </Breadcrumb>

      <Button onClick={() => setShowAddForm(!showAddForm)} className="mt-4 mb-4">
        Add Route
      </Button>

      {showAddForm && (
        <Form>
          <Row className="mb-3">
            <Col md={6}>
              <FormLabel>Vehicle No</FormLabel>
              <FormControl
                type="text"
                placeholder="Enter Vehicle No"
                value={route.vehicleNo}
                onChange={(e) => setRoute({ ...route, vehicleNo: e.target.value })}
              />
            </Col>
            <Col md={6}>
              <FormLabel>Route Name</FormLabel>
              <FormControl
                type="text"
                placeholder="Enter Route Name"
                value={route.routeName}
                onChange={(e) => setRoute({ ...route, routeName: e.target.value })}
              />
            </Col>
          </Row>
          <FormLabel>Pickup Points</FormLabel>
          {route.pickupPoints.map((pickup, index) => (
            <Row key={index} className="mb-3">
              <Col md={6}>
                <FormControl
                  type="text"
                  placeholder="Pickup Point"
                  value={pickup.point}
                  onChange={(e) => handlePickupChange(index, "point", e.target.value)}
                />
              </Col>
              <Col md={4}>
                <FormControl
                  type="text"
                  placeholder="Amount"
                  value={pickup.amount}
                  onChange={(e) => handlePickupChange(index, "amount", e.target.value)}
                />
              </Col>
              <Col md={2}>
                <Button
                  variant="danger"
                  onClick={() => removePickupPoint(index)}
                >
                  Remove
                </Button>
              </Col>
            </Row>
          ))}
          <Button onClick={addPickupPoint}>Add Pickup Point</Button>
          <Button onClick={handleAdd} className="mt-3">Save Route</Button>
        </Form>
      )}

      <h2>Existing Route Records</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : data.length > 0 ? (
        <Table columns={columns} data={data} />
      ) : (
        <p>No data available.</p>
      )}
    </Container>
  );
};

export default dynamic(() => Promise.resolve(RouteMaster), { ssr: false });
