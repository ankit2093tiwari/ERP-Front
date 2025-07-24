import ModuleAccessLayout from "@/app/component/ModuleAccessLayout";

export default function TimeTableLayout({ children }) {
    return (
        <ModuleAccessLayout requiredModule="timetable">
            {children}
        </ModuleAccessLayout>
    );
}
