"use client";

import React from "react";
import { useSelector } from "react-redux";
import { Container, Card, Row, Col, Alert, Badge } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import Image from "next/image";

export default function UserProfile() {
  const user = useSelector((state) => state.auth.user);
  console.log(user.authorities);

  const breadcrumbItems = [{ label: "Profile", link: null }];

  if (!user) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Alert variant="warning" className="text-center">
          <h4>No user data available.</h4>
        </Alert>
      </Container>
    );
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
        <Container className="mt-5">
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <Image
                  src={user.profile_pic || "/default-avatar.png"}
                  alt="Profile"
                  width={120}
                  height={120}
                  className="rounded-circle border"
                />
                <h3 className="mt-3 mb-1">{user.fullName || "N/A"}</h3>
                <Badge bg="primary" className="text-uppercase">
                  {user.usertype || "N/A"}
                </Badge>
              </div>
<hr/>
              <Row className="my-4">
                <Col md={6} className="mb-3">
                  <strong>Username:</strong>
                  <div>{user.username || "N/A"}</div>
                </Col>
                <Col md={6} className="mb-3">
                  <strong>Email:</strong>
                  <div>{user.email || "N/A"}</div>
                </Col>
                <Col md={6} className="mb-3">
                  <strong>Mobile:</strong>
                  <div>{user.mobile || "N/A"}</div>
                </Col>
                <Col md={6} className="mb-3">
                  <strong>Role:</strong>
                  <div>{user.usertype || "N/A"}</div>
                </Col>
              </Row>
              <hr />
              <Row>
                <h5>Authorities</h5>
                {Array.isArray(user.authorities) && user.authorities.length > 0 ? (
                  <>
                    {/* Modules */}
                    <strong>Modules:</strong>
                    <div className="mb-3">
                      {user.authorities.map((auth, idx) => (
                        <Badge key={idx} bg="secondary" className="me-2 text-capitalize">
                          {auth.module}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions (only from the first authority entry) */}
                    <strong>Actions:</strong>
                    <div>
                      {(user.authorities[0]?.actions || []).map((action, idx) => (
                        <Badge key={idx} bg="secondary" className="me-2 text-uppercase">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-muted">No authorities assigned.</p>
                )}
              </Row>


            </Card.Body>
          </Card>
        </Container>
      </section>
    </>
  );
}
