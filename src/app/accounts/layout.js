import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function AccountsModuleLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="accounts">
            {children}
        </ModuleAccessLayout>
    );
}
