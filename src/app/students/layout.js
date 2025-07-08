import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function StudentModuleLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="student">
            {children}
        </ModuleAccessLayout>
    );
}
