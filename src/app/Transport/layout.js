import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function TransportModuleLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="transport">
            {children}
        </ModuleAccessLayout>
    );
}
