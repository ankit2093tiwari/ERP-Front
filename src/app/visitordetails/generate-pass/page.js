'use client';
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FaPrint } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import { getAllVisitorEntries, getSchools } from '@/Services';
import DataTable from '@/app/component/DataTable';
import BreadcrumbComp from '@/app/component/Breadcrumb';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { copyContent, printContent } from '@/app/utils';

const GeneratePassPage = () => {
    const [visitorList, setVisitorList] = useState([]);

    useEffect(() => {
        fetchVisitors();
    }, []);

    const fetchVisitors = async () => {
        try {
            const res = await getAllVisitorEntries();
            setVisitorList(res?.data || []);
        } catch {
            toast.error('Failed to fetch visitor entries');
        }
    };

    const handlePrintPass = async (visitor, index) => {
        const doc = new jsPDF();
        const schoolInfo = await getSchools().then(res => res?.data?.[0]);

        const logoUrl = schoolInfo?.logo_image?.data;
        const image = await fetch(logoUrl).then(res => res.blob());
        const reader = new FileReader();

        reader.onload = () => {
            const imgData = reader.result;

            // Logo
            doc.addImage(imgData, 'PNG', 10, 10, 25, 25);

            // Header
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(schoolInfo.school_name || '', 105, 15, { align: 'center' });

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Phone: ${schoolInfo.phone_no || ''}`, 105, 22, { align: 'center' });
            doc.text(`Email: ${schoolInfo.email_name || ''}`, 105, 27, { align: 'center' });

            doc.setLineWidth(0.5);
            doc.line(10, 34, 200, 34);

            // Title
            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            doc.text('Gate Pass', 105, 42, { align: 'center' });
            doc.line(10, 45, 200, 45);

            // Pass Info (NO WIDTH OVERFLOW NOW)
            autoTable(doc, {
                startY: 50,
                theme: 'grid',
                styles: { fontSize: 10 },
                head: [],
                body: [
                    [
                        { content: `Pass Number: ${visitor?.formNo || index+1}`, styles: { halign: 'left' } },
                        { content: `Date: ${visitor.date?.substring(0, 10)}`, styles: { halign: 'right' } },
                    ],
                ],
                tableWidth: 180, // safe fixed width
                columnStyles: {
                    0: { cellWidth: 90 },
                    1: { cellWidth: 90 },
                },
            });

            // Visitor Details (fixed widths)
            autoTable(doc, {
                startY: doc.autoTable.previous.finalY + 5,
                theme: 'grid',
                styles: { fontSize: 10 },
                head: [],
                body: [
                    ['Visitor Name', visitor.name || ''],
                    ['Whom to meet', visitor.personToMeet || ''],
                    ['Mobile No.', visitor.mobileNo || ''],
                    ['Purpose', visitor.purpose || ''],
                    ['Address', visitor.address || ''],
                    ['In Time', visitor.inTime || ''],
                    ['Out Time', visitor.outTime || '—'],
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

            doc.output('dataurlnewwindow'); //to see in another tab
            // doc.save(`GatePass-${visitor.name?.replace(/\s+/g, '_') || 'Visitor'}.pdf`);  // to autodownload
        };

        reader.readAsDataURL(image);
    };


    const columns = [
        { name: '#', selector: (_, i) => i + 1, width: '50px' },
        { name: 'Name', selector: (row) => row.name, sortable: true },
        { name: 'Mobile No.', selector: (row) => row.mobileNo, sortable: true },
        { name: 'Purpose', selector: (row) => row.purpose },
        { name: 'Person to Meet', selector: (row) => row.personToMeet, sortable: true },
        { name: 'Date', selector: (row) => row.date?.substring(0, 10) || '—' },
        { name: 'In Time', selector: (row) => row.inTime, sortable: true },
        { name: 'Out Time', selector: (row) => row.outTime || '—' },
        {
            name: 'Actions',
            cell: (row) => (
                <Button size="sm" variant="info" onClick={() => handlePrintPass(row)}>
                    <FaPrint />
                </Button>
            ),
        },
    ];

    const breadcrumbItems = [
        { label: 'Visitor Details', link: '/visitordetails/all-module' },
        { label: 'Generate Pass', link: null },
    ];

    const handleCopy = () => {
        const rows = visitorList.map((v, i) => `${i + 1}\t${v.name}\t${v.mobileNo}\t${v.purpose}`);
        copyContent(['#', 'Name', 'Mobile No.', 'Purpose'], rows);
    };

    const handlePrint = () => {
        const rows = visitorList.map((v, i) => [i + 1, v.name, v.mobileNo, v.purpose]);
        printContent([['#', 'Name', 'Mobile No.', 'Purpose']], rows);
    };
    return (
        <>
            <div className="breadcrumbSheet">
                <Container>
                    <Row className="mt-1 mb-1">
                        <Col><BreadcrumbComp items={breadcrumbItems} /></Col>
                    </Row>
                </Container>
            </div>

            <section>
                <Container>
                    <div className="cover-sheet">
                        <div className="tableSheet">
                            <h2>Visitor Entry Records</h2>
                            <DataTable columns={columns} data={visitorList} handleCopy={handleCopy} handlePrint={handlePrint}/>
                        </div>
                    </div>
                </Container>
            </section>
        </>
    );
};

export default dynamic(() => Promise.resolve(GeneratePassPage), { ssr: false });
