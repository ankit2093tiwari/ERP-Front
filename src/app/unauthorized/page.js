"use client";
import React from "react";
import { Container, Button } from "react-bootstrap";
import { FaExclamationTriangle } from "react-icons/fa";
import { useRouter } from "next/navigation";

const Page = () => {
    const router = useRouter();

    return (
        <section className="d-flex align-items-center justify-content-center bg-light">
            <Container className="text-center p-5 rounded shadow bg-white" >
                <FaExclamationTriangle size={64} className="text-danger mb-4" />
                <h2 className="text-danger fw-bold">Access Denied</h2>
                <p className="text-muted">You are not authorized to view this page.</p>
                <Button variant="primary" onClick={() => router.push("/")}>
                    Go to Dashboard
                </Button>
            </Container>
        </section>
    );
};

export default Page;
