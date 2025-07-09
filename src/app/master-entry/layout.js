import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function MasterEntryModuleLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="masterentry">
            {children}
        </ModuleAccessLayout>
    );
}
