import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function BalBankLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="balbank">
            {children}
        </ModuleAccessLayout>
    );
}
