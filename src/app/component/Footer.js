import { Col, Container, Row } from "react-bootstrap";

export default function Footer() {
    return (
        <>
            <section className="bg-light">
                <Container>
                    <Row>
                        <Col className="text-center">
                            <p>
                                Copyright &copy; {new Date().getFullYear()} ERP Dashboard. All rights reserved.
                            </p>
                        </Col>
                    </Row>
                </Container>
            </section>
        </>
    );
}
