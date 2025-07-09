import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function StockModuleLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="stock">
            {children}
        </ModuleAccessLayout>
    );
}
