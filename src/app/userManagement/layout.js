import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function userManagementModuleLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="usermanagement">
            {children}
        </ModuleAccessLayout>
    );
}
