import Link from "next/link";
import { Breadcrumb as BootstrapBreadcrumb } from "react-bootstrap";

const Breadcrumb = ({ items }) => {
  return (
    <BootstrapBreadcrumb>
      {items.map((item, index) => (
        <BootstrapBreadcrumb.Item key={index} href={item.href} active={!item.href}>
          {item.label}
        </BootstrapBreadcrumb.Item>
      ))}
    </BootstrapBreadcrumb>
  );
};

export default Breadcrumb;
