import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function ExamsModuleLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="student">
            {children}
        </ModuleAccessLayout>
    );
}
