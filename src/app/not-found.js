"use client";

import Link from "next/link";
import { Container, Button } from "react-bootstrap";

export default function NotFound() {
  return (
    <section className="d-flex justify-content-center align-items-center vh-100 bg-light text-center">
      <Container>
        <h1 className="display-1 text-danger">404</h1>
        <h2 className="mb-3">Page Not Found</h2>
        <p className="mb-4">Sorry, the page you are looking for {"doesn't"} exist or has been moved.</p>
        <Link href="/" passHref>
          <Button variant="primary">Go to Dashboard</Button>
        </Link>
      </Container>
    </section>
  );
}
