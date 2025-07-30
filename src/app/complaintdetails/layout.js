import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function ComplaintModuleLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="complaintdetails">
            {children}
        </ModuleAccessLayout>
    );
}
