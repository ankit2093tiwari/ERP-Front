import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function ImportantSMSModuleLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="importantsms">
            {children}
        </ModuleAccessLayout>
    );
}
