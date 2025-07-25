import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function GalleryModuleLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="gallery">
            {children}
        </ModuleAccessLayout>
    );
}
