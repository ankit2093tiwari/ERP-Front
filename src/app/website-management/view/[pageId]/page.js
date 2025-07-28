"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Demo1 from "@/app/component/templates/Demo1";
import Demo2 from "@/app/component/templates/Demo2";
import { getPageById } from "@/Services";

const componentMap = {
  Demo1,
  Demo2
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
