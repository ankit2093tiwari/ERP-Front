"use client";

import Image from "next/image";
import { Container } from "react-bootstrap";

const isValidHtml = (html) => html && html.trim() !== "";

const ServicePageTemplate = ({ title, content }) => {
    return (
        <section className="py-5 bg-white">
            <Container>
                <h1 className="mb-4 text-dark text-capitalize">{title || "Services"}</h1>

                {content?.bannerImage && (
                    <div className="mb-4">
                        <Image
                            height={300}
                            width={1050}
                            src={content.bannerImage}
                            alt="Banner"
                            style={{ objectFit: "cover", borderRadius: "8px" }}
                            onError={(e) => {
                                e.target.style.display = "none"; // Hide broken images
                            }}
                        />
                    </div>
                )}

                {content?.introTitle && (
                    <h3 className="text-primary">{content.introTitle}</h3>
                )}

                {isValidHtml(content?.introContent) && (
                    <div
                        className="mb-4"
                        dangerouslySetInnerHTML={{ __html: content.introContent }}
                    />
                )}

                {isValidHtml(content?.services) && (
                    <>
                        <h4 className="mt-4">Our Services</h4>
                        <div
                            className="mb-4"
                            dangerouslySetInnerHTML={{ __html: content.services }}
                        />
                    </>
                )}

                {isValidHtml(content?.conclusion) && (
                    <div
                        className="mt-4"
                        dangerouslySetInnerHTML={{ __html: content.conclusion }}
                    />
                )}
            </Container>
        </section>
    );
};

export default ServicePageTemplate;
