"use client";

import Image from "next/image";
import { Container } from "react-bootstrap";

const Demo2 = ({ title, content }) => {
  // console.log("Demo2 content:", content);

  return (
    <section>
      <Container>
        <div >
          <h1 className="text-white text-capitalize">{title}</h1>

          {/* <pre>{JSON.stringify(content, null, 2)}</pre> */}

          {/* {content?.heading && <p><strong>Heading:</strong> {content.heading}</p>} */}

          {content?.bannerImage && (
            <Image
              height={300}
              width={1050}
              src={content.bannerImage}
              alt="Banner"
              style={{ objectFit: 'cover' }}
            />
          )}

          {content?.content && (
            <div dangerouslySetInnerHTML={{ __html: content.content }} style={{ margin: "10px 0" }} />
          )}
        </div>
      </Container>
    </section>
  );
};

export default Demo2;
