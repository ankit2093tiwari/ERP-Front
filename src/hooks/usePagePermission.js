import { useSelector } from "react-redux";
import { usePathname } from "next/navigation";

const routeToModuleMap = {
    students: "students",
    "student-attendance": "studentattendance",
    "master-entry": "masterentry",
    "front-office": "frontoffice",
    exams: "exams",
    fees: "fees",
    hostel: "hostel",
};

const usePagePermission = () => {
    const pathname = usePathname();
    const authorities = useSelector((state) => state.auth.authorities || {});

    const baseSegment = pathname?.split("/")?.[1] || "";

    // console.log(routeToModuleMap[baseSegment] || baseSegment);
    const moduleName = routeToModuleMap[baseSegment] || baseSegment; // fallback to segment itself

    const hasAction = (action) => {
        return authorities?.[moduleName]?.includes(action);
    };

    return {
        hasEditAccess: hasAction("edit"),
        hasViewAccess: hasAction("view"),
        hasSubmitAccess: hasAction("submit"),
        moduleName,
    };
};

export default usePagePermission;
