import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function MedicalModuleLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="medical">
            {children}
        </ModuleAccessLayout>
    );
}
