import Link from "next/link";
import { Breadcrumb, Container, Row, Col } from "react-bootstrap";

const BreadcrumbComp = ({ items }) => {

  console.log('item', items.length, items);
  const itemsLength = items.length;
  const itemsInd = itemsLength - 1;
  return (
    <>
      <Container>
        <Row>
          <Col>
            <Breadcrumb>
              <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
              {items?.length ? items?.map((item, ind) => { 
                 return (ind != itemsInd && item.link != 'null' && item.link != null && item.link != "") ? <Breadcrumb.Item key={ind} href={item.link} >{item.label}</Breadcrumb.Item> : <Breadcrumb.Item key={ind} active >{item.label}</Breadcrumb.Item> }
              ) : ""}
            </Breadcrumb>
          </Col>
        </Row>
      </Container>
    </>
  );
};
export default BreadcrumbComp;