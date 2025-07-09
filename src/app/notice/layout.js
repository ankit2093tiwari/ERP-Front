import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function NoticeModuleLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="notice">
            {children}
        </ModuleAccessLayout>
    );
}
