import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function ThoughtModuleLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="student">
            {children}
        </ModuleAccessLayout>
    );
}
