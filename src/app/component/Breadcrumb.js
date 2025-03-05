import Link from "next/link";
import { Breadcrumb as BootstrapBreadcrumb } from "react-bootstrap";

const Breadcrumb = ({ items }) => {
  return (
    <BootstrapBreadcrumb>
      {items.map((item, index) => (
        <BootstrapBreadcrumb.Item
          key={index}
          active={!item.href}
        >
          {item.href ? (
            <Link href={item.href} passHref>
              {item.label}
            </Link>
          ) : (
            item.label
          )}
        </BootstrapBreadcrumb.Item>
      ))}
    </BootstrapBreadcrumb>
  );
};

export default Breadcrumb;