import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function StudentsModuleLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="students">
            {children}
        </ModuleAccessLayout>
    );
}
