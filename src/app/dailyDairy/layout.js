import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function DailyDairyModuleLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="student">
            {children}
        </ModuleAccessLayout>
    );
}
