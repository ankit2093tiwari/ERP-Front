import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function FeesModuleLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="fees">
            {children}
        </ModuleAccessLayout>
    );
}
