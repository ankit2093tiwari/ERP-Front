"use client";

import Image from "next/image";
import { Container } from "react-bootstrap";

const isValidHtml = (html) => typeof html === "string" && html.trim() !== "";

const HomeTemplate = ({ title, content }) => {
    return (
        <section className="py-5 bg-white">
            <Container>
                <h1 className="mb-4 text-dark text-capitalize">
                    {title || "Welcome to Our Website"}
                </h1>

                {/* Banner Image */}
                {content?.bannerImage && (
                    <div className="mb-4">
                        <Image
                            src={content.bannerImage}
                            width={1200}
                            height={400}
                            alt="Home Banner"
                            style={{
                                width: "100%",
                                height: "auto",
                                objectFit: "cover",
                                borderRadius: "8px",
                            }}
                            onError={(e) => {
                                e.target.style.display = "none";
                            }}
                        />
                    </div>
                )}

                {/* Intro Title */}
                {content?.introTitle && (
                    <h3 className="text-primary">{content.introTitle}</h3>
                )}

                {/* Intro Content */}
                {isValidHtml(content?.introContent) && (
                    <div
                        className="mb-4"
                        dangerouslySetInnerHTML={{ __html: content.introContent }}
                    />
                )}

                {/* Features Section */}
                {isValidHtml(content?.features) && (
                    <>
                        <h4 className="mt-4">Features</h4>
                        <div
                            className="mb-4"
                            dangerouslySetInnerHTML={{ __html: content.features }}
                        />
                    </>
                )}

                {/* Footer Note */}
                {content?.footerNote && (
                    <div className="text-muted mt-5">
                        <small>{content.footerNote}</small>
                    </div>
                )}
            </Container>
        </section>
    );
};

export default HomeTemplate;
