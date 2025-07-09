import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function FrontOfficeModuleLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="frontoffice">
            {children}
        </ModuleAccessLayout>
    );
}
