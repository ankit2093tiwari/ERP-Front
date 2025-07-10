import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function AdvertisingModuleLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="advertising">
            {children}
        </ModuleAccessLayout>
    );
}
