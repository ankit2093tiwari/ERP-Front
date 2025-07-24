import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function SendSmsLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="sendsms">
            {children}
        </ModuleAccessLayout>
    );
}
