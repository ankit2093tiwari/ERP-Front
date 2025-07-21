import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function youtubeVideoModule({ children }) {
    return (
        <ModuleAccessLayout requiredModule="youtubevideo">
            {children}
        </ModuleAccessLayout>
    );
}
