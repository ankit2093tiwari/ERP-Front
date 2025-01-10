"use client";
import React, { useState } from 'react';
import Table from '@/app/component/DataTable';
import styles from "@/app/students/add-new-student/page.module.css"
import { Container, Row, Col, Breadcrumb, Form, FormLabel, FormGroup, FormControl,FormSelect, Button } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { CgAddR } from 'react-icons/cg';
import { CgAdd } from "react-icons/cg";
import { FiMinus } from "react-icons/fi";

const RouteMaster = () => {

  const columns = [ 
    {
      name: '#',
      selector: row => row.id,
      sortable: true,
      width: '80px',
    },
    {
      name: 'Vehicle No',
      selector: row => row.vehicleNo,
      sortable: true,
    },
    {
        name: 'Route',
        selector: row => row.route,
        sortable: true,
      },
      {
        name: 'Pickup-Point & Fare',
        selector: row => row.pickupPointAndFare,
        sortable: true,
      },
    {
      name: 'Action',
      cell: row => (
        <div style={{
          display: 'flex',
          // marginLeft: '-30px'
        }}>
          <button className='editButton'
            onClick={() => handleEdit(row.id)}
          >
            Edit
          </button>
          <button className="editButton"
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </button>
        </div>
      ),
    }
  ];

  const data =[
    {
      id: 1,
      vehicleNo: 'Test_123',
      route: 'test_route',
      pickupPointAndFare: '(Test_pick_point)Amount: 500',
    },
    {
       id: 2,
       vehicleNo: 'UP35BT7060',
       route: 'kakadev',
       pickupPointAndFare: '(gurudev) Amount: 400',
    },
    {
      id: 3,
      vehicleNo: 'UP35BT9261',
      route: 'kakadev',
      pickupPointAndFare: '(rawatpur) Amount: 700',
    },
    {
       id: 4,
       vehicleNo: 'UP35BT4546',
       route: 'route',
       pickupPointAndFare: '(new) Amount: 300',
    },
  ];

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const togglePopover = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

  const [vehicleNo, setVehicleNo] = useState("");
  const [routeName, setRouteName] = useState("");
  const [pickupPoint, setPickupPoint] = useState([{ point: "", amount: "" }]);

  const handlePickupChange = (index, field, value) => {
    const updatedPoints = [...pickupPoint];
    updatedPoints[index][field] = value;
    setPickupPoint(updatedPoints);
  };

  const handleAdd = () =>{
    setPickupPoint([...pickupPoint, { point: "", amount: "" }]);
  }

  const removePickupPoint = (index) => {
    const updatedPoints = pickupPoint.filter((_, i) => i !== index);
    setPickupPoint(updatedPoints);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = { vehicleNo, routeName, pickupPoint };
    console.log("Form Data Submitted:", formData);
  };

  return (
     <Container className={styles.vehicle}>
        <Row className='mt-1 mb-1'>
          <Col>
              <Breadcrumb style={{ marginLeft: '20px' }}>
                  <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                  <Breadcrumb.Item href="/Transport">
                      Transport
                  </Breadcrumb.Item>
                  <Breadcrumb.Item active>Vehicle Route</Breadcrumb.Item>
              </Breadcrumb>
          </Col>
        </Row>
        <Row>
            <Col>
               <button onClick={togglePopover} id="submit" type='button' style={{ marginLeft: '20px' }}>
                <CgAddR style={{ fontSize: '27px', marginTop: '-2px', marginRight: '5px' }} /> New Route</button>
               {isPopoverOpen && (
                <div className='absolute right-0 mt-3 w-60 p-4' style={{ backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', width: '800px' }}>
                    <h3>Existing Route Records</h3>
                <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                <FormGroup as={Col} md="6" controlId="validationCustom01">
                  <FormLabel>Vehicle No</FormLabel>
                  <FormSelect value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)}>
                      <option>Select</option>
                      <option value="1">UP35AT7060</option>
                      <option value="2">UP35AT9261</option>
                      <option value="3">UP35AT4546</option>
                      <option value="4">UP35AT6869</option>
                  </FormSelect>
                </FormGroup>
                <FormGroup as={Col} md="6" controlId="validationCustom02">
                  <FormLabel>Route Name</FormLabel>
                  <FormControl
                    required
                    type="text"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                  />
                </FormGroup>
                </Row>
                <Row className='mb-3'>
                <FormGroup as={Col} controlId="validationCustom03">
                  <FormLabel>Pickup Point And Amount</FormLabel>
                  {pickupPoint.map((pickup, index) => (
                    <div key={index}>
                       <FormControl
                          required
                          type="text"
                          placeholder='Pickup Point'
                          value={pickup.point}
                          onChange={(e) => handlePickupChange(index, "point", e.target.value )}
                        />
                        <FormControl
                          required
                          type="text"
                          placeholder='Amount'
                          value={pickup.amount}
                          onChange={(e) => handlePickupChange(index, "amount", e.target.value)}
                        />
                       <FiMinus type='button' onClick={() => removePickupPoint(index)} 
                        style={{ backgroundColor: '#8a59ca', color: '#fff', borderRadius: '50%', float: 'right', marginTop: '20px' }} /> 
                    </div>
                  ))}
                  <CgAdd type='button' onClick={handleAdd}
                   style={{ backgroundColor: '#8a59ca', marginLeft: '10px', color: '#fff', borderRadius: '50%', float: 'left', marginTop: '20px' }} />
                </FormGroup>
                </Row>
                <Button type="submit" id="submit" onSubmit={handleSubmit}>Submit</Button>
                </Form>
              </div>
               )}
            </Col>
        </Row>
        <Row>
        <Col>
        <h2 style={{ marginLeft: '23px' , fontSize: '25px'}}>Existing Route Records</h2>
        <Table columns={columns} data={data} />
        <div className={styles.buttons} style={{ float: 'right', marginRight: '10px' }}>
            <button type="button" className="editButton">Previous</button>
            <button type="button" className="editButton">Next</button>
        </div>
        </Col>
      </Row>
     </Container>
  );
};

export default dynamic (() => Promise.resolve(RouteMaster), {ssr: false});