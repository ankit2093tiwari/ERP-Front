import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function LibraryModuleLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="student">
            {children}
        </ModuleAccessLayout>
    );
}
