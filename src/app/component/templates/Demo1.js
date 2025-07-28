"use client";

import Image from "next/image";
import React from "react";

const Demo1 = ({ data }) => {
    if (!data) return null;

    const { mainImage, title, description } = data;

    return (
        <section className="p-4">
            {/* Image */}
            {mainImage && (
                <div className="text-center mb-4">
                    <div style={{ position: "relative", width: "100%", maxWidth: "600px", margin: "0 auto", height: "300px" }}>
                        <Image
                            src={mainImage}
                            alt="Main"
                            fill
                            style={{ objectFit: "cover", borderRadius: "8px" }}
                            sizes="(max-width: 768px) 100vw, 600px"
                            priority
                        />
                    </div>
                </div>
            )}

            {/* Title */}
            {title && (
                <h2 className="text-center mb-3 font-semibold text-2xl md:text-3xl">
                    {title}
                </h2>
            )}

            {/* Description */}
            {description && (
                <div className="text-lg leading-relaxed text-center max-w-3xl mx-auto">
                    {description}
                </div>
            )}
        </section>
    );
};

export default Demo1;
