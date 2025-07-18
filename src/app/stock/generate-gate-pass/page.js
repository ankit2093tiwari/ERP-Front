"use client";
import React, { useEffect, useState } from 'react';
import Table from '@/app/component/DataTable';
import { Container, Row, Col, Button } from 'react-bootstrap';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { getAllGatePasses } from '@/Services';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import usePagePermission from '@/hooks/usePagePermission';
import { copyContent, printContent } from '@/app/utils';

const GenerateGatePass = () => {
  const { hasEditAccess } = usePagePermission()
  const [gatePassRecords, setGatePassRecords] = useState([]);

  const fetchGatePassData = async () => {
    const res = await getAllGatePasses();
    if (res?.success && Array.isArray(res.data)) {
      // Add index for display (# column)
      const formattedData = res.data.map((item, index) => ({
        ...item,
        index: index + 1,
        date: item.date?.split('T')[0], // format date (optional)
      }));
      setGatePassRecords(formattedData);
    }
  };

  useEffect(() => {
    fetchGatePassData();
  }, []);

  const handleDelete = async (id) => {
    alert(id)
  }

  const columns = [
    {
      name: '#',
      selector: row => row.index,
      sortable: true,
      width: '60px',
    },
    {
      name: 'Company Details',
      selector: row => row.companyDetails || "N/A",
      sortable: true,
    },
    {
      name: 'Email',
      selector: row => row.emailId || "N/A",
      sortable: true,
    },
    {
      name: 'Mobile No.',
      selector: row => row.mobileNo || "N/A",
      sortable: true,
    },
    {
      name: 'Purpose',
      selector: row => row.purpose || "N/A",
      sortable: true,
    },
    {
      name: 'Address',
      selector: row => row.address || "N/A",
      sortable: true,
    },
    {
      name: 'Remark',
      selector: row => row.remark || "N/A",
      sortable: true,
    },
    {
      name: 'Item Details',
      selector: row => row.itemDetails || "N/A",
      sortable: true,
    },
    {
      name: 'Person Name',
      selector: row => row.personName || "N/A",
      sortable: true,
    },
    {
      name: 'Date',
      selector: row => row.date || "N/A",
      sortable: true,
    },
    hasEditAccess && {
      name: 'Action',
      cell: (row) => (
        <>
          <Button variant='success' size='sm' className='me-1'><FaEdit /></Button>
          <Button variant='danger' size='sm' onClick={() => handleDelete(row._id)}><FaTrashAlt /></Button>
        </>
      )
    }
  ];

  const breadcrumbItems = [
    { label: "Stock", link: "/stock/all-module" },
    { label: "Generate Pass", link: null }
  ];

  const handleCopy = () => {
    const headers = [
      "#", "CompanyDetails", "Purpose", "Email", "Mobile", "Address", "Date", "PersonName"
    ]
    const rows = gatePassRecords?.map((row) => (
      [
        row.index,
        row.companyDetails || "N/A",
        row.purpose || "N/A",
        row.emailId || "N/A",
        row.mobileNo || "N/A",
        row.address || "N/A",
        row.date || "N/A",
        row.personName || "N/A"
      ].join('\t')
    ))
    copyContent(headers, rows)
  }
  const handlePrint = () => {
    const headers = [
      ["#", "CompanyDetails", "Purpose", "Mobile", "Address", "Date", "PersonName"]
    ]
    const rows = gatePassRecords?.map((row) => (
      [
        row.index,
        row.companyDetails || "N/A",
        row.purpose || "N/A",
        // row.emailId || "N/A",
        row.mobileNo || "N/A",
        row.address || "N/A",
        row.date || "N/A",
        row.personName || "N/A"
      ]
    ))
    printContent(headers, rows)
  }

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
                <h2>Person Entry Records</h2>
                <Table columns={columns} data={gatePassRecords} handleCopy={handleCopy} handlePrint={handlePrint} />
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default GenerateGatePass;
