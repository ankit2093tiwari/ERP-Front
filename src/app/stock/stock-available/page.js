"use client";
import React, { useEffect, useState } from 'react';
import Table from '@/app/component/DataTable';
import { Container, Row, Col, Breadcrumb } from 'react-bootstrap';
import styles from "@/app/students/add-new-student/page.module.css";
// import dynamic from 'next/dynamic';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { getAllItems } from '@/Services';


const StockAvailable = () => {
  const [data, setData] = useState([]);
  const columns = [
    {
      name: '#',
      selector: row => row.id,
      sortable: true,
      width: '80px',
    },
    {
      name: 'Item Category',
      selector: row => row.itemCategory,
      sortable: true,
    },
    {
      name: 'Item Name',
      selector: row => row.itemName,
      sortable: true,
    },
    {
      name: 'Type',
      selector: row => row.type,
      sortable: true,
    },
    {
      name: 'Available Stock',
      selector: row => row.availableStock,
      sortable: true,
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      const response = await getAllItems();
      if (response?.success) {
        const transformedData = response.data.map((item, index) => ({
          id: index + 1,
          itemCategory: item.itemCategory?.categoryName || 'N/A',
          itemName: item.itemName || 'N/A',
          type: item.itemType || 'N/A',
          availableStock: item.availableStock > 0 ? item.availableStock : 'Out of Stock',
        }));
        setData(transformedData);
      } else {
        setData([]);
        console.error("Error fetching data:", response.message);
      }
    };

    fetchData();
  }, []);


  // const data = [
  //   {
  //     id: 1,
  //     itemCategory: 'Furntiture',
  //     itemName: 'Chairs',
  //     type: 'Non-Recurring',
  //     availableStock: '105'
  //   },
  //   {
  //     id: 2,
  //     itemCategory: 'Stationary',
  //     itemName: 'Pen',
  //     type: 'Recurring',
  //     availableStock: '-1'
  //   },
  // ];
  const breadcrumbItems = [{ label: "Stock", link: "/stock/all-module" }, { label: "Stock Available", link: "null" }]
  return (
    <>
      <div className="breadcrumbSheet position-relative">
        <Container>
          <Row>
            <Col>
              <BreadcrumbComp items={breadcrumbItems} />
            </Col>
          </Row>
        </Container>
      </div>
      <section>
        <Container>

          <Row>
            <Col>
              <div className="tableSheet">
                <h2>Stock Information Records</h2>
                <Table columns={columns} data={data} />

              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default StockAvailable;