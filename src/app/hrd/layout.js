import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function HrdModuleLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="student">
            {children}
        </ModuleAccessLayout>
    );
}
