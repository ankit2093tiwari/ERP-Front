import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function WebsiteManagementModuleLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="websitemanagement">
            {children}
        </ModuleAccessLayout>
    );
}
