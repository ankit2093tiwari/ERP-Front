import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function VisitorDetailLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="visitordetails">
            {children}
        </ModuleAccessLayout>
    );
}
