import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function ComplaintModuleLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="student">
            {children}
        </ModuleAccessLayout>
    );
}
