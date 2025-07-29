"use client";

import Image from "next/image";
import { Container, Row, Col } from "react-bootstrap";

const AboutUsTemplate = ({ title, content }) => {
    const isValidHtml = (html) => {
        return html && html.trim() !== "";
    };

    return (
        <section className="py-5 bg-light">
            <Container>
                <h1 className="mb-4 text-center text-primary text-capitalize">{title}</h1>

                {content?.mainImage && (
                    <Image
                        src={content.mainImage}
                        alt="About us"
                        width={1000}
                        height={400}
                        className="mb-4 rounded"
                        style={{ objectFit: "cover", width: "100%" }}
                        onError={(e) => {
                            e.target.style.display = "none"; // Hide broken image
                        }}
                    />
                )}

                {isValidHtml(content?.aboutText) && (
                    <div
                        className="mb-4"
                        dangerouslySetInnerHTML={{ __html: content.aboutText }}
                    />
                )}

                <Row className="mt-5">
                    <Col md={6}>
                        <h4>Our Mission</h4>
                        <p>{content?.mission?.trim() || "No mission provided."}</p>
                    </Col>
                    <Col md={6}>
                        <h4>Our Vision</h4>
                        <p>{content?.vision?.trim() || "No vision provided."}</p>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default AboutUsTemplate;
