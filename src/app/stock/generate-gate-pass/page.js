"use client";
import React, { useEffect, useState } from 'react';
import Table from '@/app/component/DataTable';
import { Container, Row, Col, Button } from 'react-bootstrap';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { deleteGatePassById, getAllGatePasses } from '@/Services';
import { FaEdit, FaTrashAlt, FaPrint } from 'react-icons/fa';
import usePagePermission from '@/hooks/usePagePermission';
import { copyContent, printContent } from '@/app/utils';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getSchools } from '@/Services';

const GenerateGatePass = () => {
  const { hasEditAccess } = usePagePermission()
  const [gatePassRecords, setGatePassRecords] = useState([]);

  const fetchGatePassData = async () => {
    const res = await getAllGatePasses();
    if (res?.success && Array.isArray(res.data)) {
      const formattedData = res.data.map((item, index) => ({
        ...item,
        index: index + 1,
        date: item.date?.split('T')[0],
      }));
      setGatePassRecords(formattedData);
    }
  };

  useEffect(() => {
    fetchGatePassData();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure, want to delete this record?")) return;

    try {
      await deleteGatePassById(id);
      toast.success("Record deleted successfully!")
      fetchGatePassData()
    } catch (error) {
      console.error('failed to delete record!', error)
      toast.error('failed to delete record!')
    }
  }

  const handlePrintPass = async (record) => {
    try {
      const doc = new jsPDF();
      const schoolInfo = await getSchools().then(res => res?.data?.[0]);

      // Add school logo if available
      if (schoolInfo?.logo_image?.data) {
        const logoUrl = schoolInfo.logo_image.data;
        const image = await fetch(logoUrl).then(res => res.blob());
        const reader = new FileReader();

        reader.onload = () => {
          const imgData = reader.result;
          doc.addImage(imgData, 'PNG', 10, 10, 25, 25);
        };
        reader.readAsDataURL(image);
      }

      // Header
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(schoolInfo?.school_name || 'GATE PASS', 105, 15, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Phone: ${schoolInfo?.phone_no || ''}`, 105, 22, { align: 'center' });
      doc.text(`Email: ${schoolInfo?.email_name || ''}`, 105, 27, { align: 'center' });

      doc.setLineWidth(0.5);
      doc.line(10, 34, 200, 34);

      // Title
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('GATE PASS', 105, 42, { align: 'center' });
      doc.line(10, 45, 200, 45);

      // Pass Info
      autoTable(doc, {
        startY: 50,
        theme: 'grid',
        styles: { fontSize: 10 },
        head: [],
        body: [
          [
            { content: `Pass Number: ${record.index || ''}`, styles: { halign: 'left' } },
            { content: `Date: ${record.date || ''}`, styles: { halign: 'right' } },
          ],
        ],
        tableWidth: 180,
        columnStyles: {
          0: { cellWidth: 90 },
          1: { cellWidth: 90 },
        },
      });

      // Visitor Details
      autoTable(doc, {
        startY: doc.autoTable.previous.finalY + 5,
        theme: 'grid',
        styles: { fontSize: 10 },
        head: [],
        body: [
          ['Company Details', record.companyDetails || 'N/A'],
          ['Person Name', record.personName || 'N/A'],
          ['Email', record.emailId || 'N/A'],
          ['Mobile No.', record.mobileNo || 'N/A'],
          ['Purpose', record.purpose || 'N/A'],
          ['Address', record.address || 'N/A'],
          ['Remark', record.remark || 'N/A'],
          ['Item Details', record.itemDetails || 'N/A'],
        ],
        tableWidth: 180,
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 130 },
        },
      });

      // Signature
      doc.setFont('helvetica', 'normal');
      doc.text('Authorized Signature', 140, doc.autoTable.previous.finalY + 20);

      doc.output('dataurlnewwindow');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate gate pass');
    }
  };

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
    {
      name: 'Actions',
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button variant='info' size='sm' onClick={() => handlePrintPass(row)}>
            <FaPrint />
          </Button>
          {hasEditAccess && (
            <Button variant='danger' size='sm' onClick={() => handleDelete(row._id)}>
              <FaTrashAlt />
            </Button>
          )}
        </div>
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