"use client";

import Image from "next/image";
import { Container, Row, Col } from "react-bootstrap";
const ContactUsTemplate = ({ title, content }) => {
    return (
        <section className="py-5 bg-light">
            <Container>
                <h1 className="mb-4 text-primary text-capitalize">{title}</h1>

                {content?.bannerImage && (
                    <div className="mb-4">
                        <Image
                            height={300}
                            width={1050}
                            src={content.bannerImage}
                            alt="Contact Banner"
                            style={{ objectFit: "cover", borderRadius: "8px" }}
                            onError={(e) => {
                                e.target.style.display = "none"; // Hide broken image
                            }}
                        />

                    </div>
                )}

                <Row className="mb-4">
                    {content?.address && (
                        <Col md={4}>
                            <h5>Address</h5>
                            <p>{content.address}</p>
                        </Col>
                    )}

                    {content?.phone && (
                        <Col md={4}>
                            <h5>Phone</h5>
                            <p>{content.phone}</p>
                        </Col>
                    )}

                    {content?.email && (
                        <Col md={4}>
                            <h5>Email</h5>
                            <p>{content.email}</p>
                        </Col>
                    )}
                </Row>

                {content?.mapEmbedUrl?.startsWith("http") && (
                    <div className="mb-4">
                        <h5>Find Us on the Map</h5>
                        <iframe
                            src={content.mapEmbedUrl}
                            width="100%"
                            height="300"
                            style={{ border: 0, borderRadius: "8px" }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                )}


                {content?.additionalInfo && (
                    <div
                        className="mt-4"
                        dangerouslySetInnerHTML={{ __html: content.additionalInfo }}
                    />
                )}
            </Container>
        </section>
    );
};

export default ContactUsTemplate;
