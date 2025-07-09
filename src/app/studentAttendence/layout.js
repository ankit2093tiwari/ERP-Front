import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function studentAttendenceModuleLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="studentattendance">
            {children}
        </ModuleAccessLayout>
    );
}
