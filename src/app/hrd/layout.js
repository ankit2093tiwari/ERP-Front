import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function HrdModuleLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="hrd">
            {children}
        </ModuleAccessLayout>
    );
}
