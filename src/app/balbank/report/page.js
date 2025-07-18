"use client"
import BreadcrumbComp from "@/app/component/Breadcrumb";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable";
import { useEffect, useState } from "react";
import { Container, Row, Col, } from "react-bootstrap";
import useSessionId from "@/hooks/useSessionId";
import { copyContent, printContent } from "@/app/utils";

import {
    getAllDailyTransactions,
} from "@/Services";

const DailyTransactionEntryReport = () => {

    const sessionId = useSessionId();
    const [transactionList, setTransactionList] = useState([]);

    useEffect(() => {
        fetchTransactions();
    }, [sessionId]);

    const fetchTransactions = async () => {
        try {
            const res = await getAllDailyTransactions();
            const formatted = res.data.map((t, i) => ({
                transactionId: t._id,
                entryDate: new Date(t.entryDate).toLocaleDateString(),
                studentName: `${t.studentId.first_name} ${t.studentId.last_name || ""}`,
                itemName: t.itemName,
                amountPerItem: t.amountPerItem,
                itemQuantity: t.itemQuantity,
                totalAmount: t.amount,
                description: t.description,
                paymentMode: t.paymentMode
            }));
            setTransactionList(formatted);
        } catch (err) {
            console.error("Error loading transactions", err);
        }
    };
    ;

    const columns = [
        { name: "#", selector: (row, i) => i + 1 },
        { name: "EntryDate", selector: row => row.entryDate },
        { name: "StudentName", selector: row => row.studentName },
        { name: "ItemName", selector: row => row.itemName },
        { name: "Amount/Item", selector: row => row.amountPerItem },
        { name: "Quantity", selector: row => row.itemQuantity },
        { name: "TotalAmount", selector: row => row.totalAmount },
        { name: "Description", selector: row => row.description },
        { name: "ModeofPayment", selector: row => row.paymentMode },
    ].filter(Boolean);

    const handleCopy = () => {
        const headers = ["#", "EntryDate", "StudentName", "ItemName", "Amount/Item", "Quantity", "TotalAmount", "Description", "ModeofPayment"];
        const rows = transactionList.map((row, i) => [
            i + 1,
            row.entryDate,
            row.studentName,
            row.itemName,
            row.amountPerItem,
            row.itemQuantity,
            row.totalAmount,
            row.description,
            row.paymentMode
        ].join("\t"));
        copyContent(headers, rows);
    };

    const handlePrint = () => {
        const headers = [["#", "EntryDate", "StudentName", "ItemName", "Amount/Item", "Quantity", "TotalAmount",]];
        const rows = transactionList.map((row, i) => [
            i + 1,
            row.entryDate,
            row.studentName,
            row.itemName,
            row.amountPerItem,
            row.itemQuantity,
            row.totalAmount,
            // row.description,
            // row.paymentMode
        ]);
        printContent(headers, rows);
    };

    const breadcrumbItems = [
        { label: "BalBank", link: "/balbank/all-module" },
        { label: "Daily Transaction Entry", link: null },
    ];

    return (
        <>
            <div className="breadcrumbSheet">
                <Container><Row><Col><BreadcrumbComp items={breadcrumbItems} /></Col></Row></Container>
            </div>
            <section>
                <Container>
                    <div className="cover-sheet">
                        <div className="tableSheet">
                            <h2>Daily Transaction Entries</h2>
                            <Table columns={columns} data={transactionList} handleCopy={handleCopy} handlePrint={handlePrint} />
                        </div>
                    </div>
                </Container>
            </section>
        </>
    );
};

export default dynamic(() => Promise.resolve(DailyTransactionEntryReport), { ssr: false });
