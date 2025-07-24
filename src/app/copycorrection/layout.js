import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function CopyCorrectionLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="copycorrection">
            {children}
        </ModuleAccessLayout>
    );
}
