import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function AppointmentModuleLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="student">
            {children}
        </ModuleAccessLayout>
    );
}
