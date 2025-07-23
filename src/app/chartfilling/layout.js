import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function ChartFillingLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="chartfilling">
            {children}
        </ModuleAccessLayout>
    );
}
