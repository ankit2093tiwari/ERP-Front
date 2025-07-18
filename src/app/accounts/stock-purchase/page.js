"use client";
import React, { useEffect, useState } from 'react';
import Table from '@/app/component/DataTable';
import { Container, Row, Col } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from '@/app/utils';
import { getAllReceivedStocks } from '@/Services';

const StockPurchase = () => {
  const [receivedStocks, setReceivedStocks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReceiveStocks();
  }, []);

  const fetchReceiveStocks = async () => {
    try {
      setLoading(true);
      const response = await getAllReceivedStocks();
      if (response.success) {
        // transform response.data to table rows
        const tableData = response.data.map((item, index) => ({
          id: index + 1,
          from: item.purchaseOrder?.quotation?.vendorName?.organizationName || "",
          vendorContact: item.purchaseOrder?.quotation?.vendorName?.contactPersonName || "",
          vendorPhone: item.purchaseOrder?.quotation?.vendorName?.contactNumber || "",
          forWhom: item.purchaseOrder?.quotation?.itemName?.itemName || "",
          mode: item.payMode || "Cash",
          receiver: item.receivedBy || "",
          totalAmount: item.totalAmount || 0,
          receivedQty: item.receivedQty || 0,
          receivedDate: item.receivedDate ? new Date(item.receivedDate).toLocaleDateString() : "",
          remarks: item.remarks || ""
        }));

        setReceivedStocks(tableData);
      }
    } catch (err) {
      console.error("Error fetching received stocks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const headers = [
      "#", "Vendor", "Mode", "Received by", "Total Amount",
      "Received Qty", "Received Date", "Remarks"
    ];

    const rows = receivedStocks.map((row, index) => {
      return [
        index + 1,
        row.from || "N/A",
        row.mode || "N/A",
        row.receiver || "N/A",
        row.totalAmount || "N/A",
        row.receivedQty || "N/A",
        row.receivedDate || "N/A",
        row.remarks || "N/A"
      ].join("\t");
    });

    copyContent(headers, rows);
  };

  const handlePrint = () => {
    const headers = [[
      "#", "Vendor", "Mode", "Received by", "Total Amount",
      "Received Qty", "Received Date", "Remarks"
    ]];

    const rows = receivedStocks.map((row, index) => ([
      index + 1,
      row.from || "N/A",
      row.mode || "N/A",
      row.receiver || "N/A",
      row.totalAmount || "N/A",
      row.receivedQty || "N/A",
      row.receivedDate || "N/A",
      row.remarks || "N/A"
    ]));

    printContent(headers, rows);
  };

  const columns = [
    {
      name: '#',
      selector: row => row.id,
      sortable: true,
      width: '70px',
    },
    {
      name: 'Vendor',
      selector: row => row.from || '',
      cell: row => (
        <div>
          <strong>{row.from || 'N/A'}</strong>
          {row.vendorContact && <div className="text-muted small">{row.vendorContact}</div>}
          {row.vendorPhone && <div className="text-muted small">{row.vendorPhone}</div>}
        </div>
      ),
      sortable: true,
    },
    {
      name: 'Mode',
      selector: row => row.mode,
      sortable: true,
    },
    {
      name: 'Received by',
      selector: row => row.receiver,
      sortable: true,
    },
    {
      name: 'Total Amount',
      selector: row => row.totalAmount,
      sortable: true,
    },
    {
      name: 'Received Qty',
      selector: row => row.receivedQty,
      sortable: true,
    },
    {
      name: 'Received Date',
      selector: row => row.receivedDate,
      sortable: true,
    },
    {
      name: 'Remarks',
      selector: row => row.remarks,
      sortable: false,
    }
  ];


  const breadcrumbItems = [{ label: "Accounts", link: "/accounts/all-module" }, { label: "Stock Purchase", link: "null" }]

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
      <Container>
        <section>
          <Row>
            <Col>
              <div className="tableSheet">
                <h2>Stock Purchase Records</h2>
                {loading ? <p>Loading..</p> : (
                  <Table
                    columns={columns}
                    data={receivedStocks}
                    handleCopy={handleCopy}
                    handlePrint={handlePrint}
                  />
                )}
              </div>
            </Col>
          </Row>
        </section>
      </Container>
    </>
  );
};

export default dynamic(() => Promise.resolve(StockPurchase), { ssr: false });