"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AboutUsTemplate from "@/app/component/templates/AboutusTemplate";
import ContactUsTemplate from "@/app/component/templates/ContactusTemplate";
import { getPageById } from "@/Services";
import ServicePageTemplate from "@/app/component/templates/ServicesTemplate";
import HomeTemplate from "@/app/component/templates/homeTemplate";

const componentMap = {
  AboutUsTemplate,
  ContactUsTemplate,
  ServicePageTemplate,
  HomeTemplate
};

const ViewPage = () => {
  const { pageId } = useParams();
  const [pageData, setPageData] = useState(null);
  const [templateComponent, setTemplateComponent] = useState(null);

  useEffect(() => {
    const fetchPage = async () => {
      const json = await getPageById(pageId);
      if (json.success) {
        setPageData(json.data);

        const componentName = json.data.template.componentName;
        const ComponentToRender = componentMap[componentName];
        setTemplateComponent(() => ComponentToRender);
      }
    };

    if (pageId) fetchPage();
  }, [pageId]);

  if (!pageData || !templateComponent) return <p>Loading...</p>;

  const Component = templateComponent;

  return <Component content={pageData.content} title={pageData.title} />;
};

export default ViewPage;
