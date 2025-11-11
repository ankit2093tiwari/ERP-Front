"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Accordion } from "react-bootstrap";
import {
    FaHome, FaBug, FaBell, FaBriefcaseMedical, FaAngleDoubleRight, FaGlobe, FaTable, FaSms,
    FaEnvelope, FaUsersCog, FaBook, FaCalendarPlus, FaPhotoVideo, FaNewspaper, FaChartArea,
    FaUserGraduate, FaFileAlt, FaBus, FaRupeeSign, FaBusinessTime, FaBoxOpen, FaYoutube
} from "react-icons/fa";
import { FaGauge, FaArrowRightArrowLeft } from "react-icons/fa6";
import { MdAccountBalance, MdLibraryBooks, MdOutlineLibraryBooks, MdOutlineHomeWork } from "react-icons/md";
import { TiContacts } from "react-icons/ti";
import { RiUserFollowLine, RiBankCard2Line } from "react-icons/ri";
import { Image } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import { useSelector } from "react-redux";
import { usePathname } from "next/navigation";
export default function Sidebar({ isOpen }) {
    const pathname = usePathname()
    const [activeKey, setActiveKey] = useState(null);
    const [sidebarHover, setSidebarHover] = useState(false);
    const [userName, setUserName] = useState("User Name");
    const [userType, setUserType] = useState("Principal");
    const [profilePic, setProfilePic] = useState("");
    const [authorities, setAuthorities] = useState([]);
    const token = useSelector((state) => state.auth.token)
    useEffect(() => {
        if (token) {
            const decoded = jwtDecode(token);
            const type = decoded.data?.usertype
            setUserType(type);
            const userName = decoded.data?.fullName || decoded.data?.username || "User Name";
            setUserName(userName);
            setProfilePic(decoded.data?.profile_pic);

            // Set authorities
            setAuthorities(decoded.data?.authorities || []);
        }
    }, [token]);

    const hasAccess = (moduleName) => {
        return authorities.some((auth) => auth.module === moduleName);
    };

    // Helper function to check if a link is active
    const isActiveLink = (href) => {
        return pathname === href ||
            (href !== "/" && pathname.startsWith(href + "/"));
    };
    // Function to handle accordion toggle
    const handleAccordionToggle = (key) => {
        setActiveKey(activeKey === key ? null : key);
    };

    const masterEntryItems = [
        { title: "All Modules", href: "/master-entry/all-module", icon: <FaAngleDoubleRight /> },
        { title: "School Info", href: "/master-entry/school-info", icon: <FaAngleDoubleRight /> },
        { title: "Year Master", href: "/master-entry/year-master", icon: <FaAngleDoubleRight /> },
        { title: "Class Master", href: "/master-entry/class-master", icon: <FaAngleDoubleRight /> },
        { title: "City Master", href: "/master-entry/city-master", icon: <FaAngleDoubleRight /> },
        { title: "Document Upload", href: "/master-entry/document-upload", icon: <FaAngleDoubleRight /> },
        { title: "Category Master", href: "/master-entry/category-master", icon: <FaAngleDoubleRight /> },
        { title: "Religion Master", href: "/master-entry/religion-master", icon: <FaAngleDoubleRight /> },
        { title: "Subject Master", href: "/master-entry/subject-master", icon: <FaAngleDoubleRight /> },
        { title: "Caste Master", href: "/master-entry/caste-master", icon: <FaAngleDoubleRight /> },
    ];

    const studentItems = [
        { title: "All Modules", href: "/students/all-module", icon: <FaAngleDoubleRight /> },
        { title: "Student List", href: "/students/studentList", icon: <FaAngleDoubleRight /> },
        { title: "Add New Student", href: "/students/add-new-student", icon: <FaAngleDoubleRight /> },
        { title: "Update Student Data", href: "/students/update-student", icon: <FaAngleDoubleRight /> },
        { title: "Assign RollNo", href: "/students/assign-roll-no", icon: <FaAngleDoubleRight /> },
        { title: "Promote Student", href: "/students/promote-student", icon: <FaAngleDoubleRight /> },
        { title: "Student Bulk Update", href: "/students/student-bulk-update", icon: <FaAngleDoubleRight /> },
        { title: "Transfer Certificate", href: "/students/transfer-certificate", icon: <FaAngleDoubleRight /> },
        { title: "Id Card", href: "/students/id-card", icon: <FaAngleDoubleRight /> },
        {
            title: "Reports",
            href: "/students/reports/all-reports",
            icon: <FaFileAlt />,
            isOpen: true,
            children: [
                {
                    title: "All Reports",
                    href: "/students/reports/all-reports",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "Student List Wizard",
                    href: "/students/reports/student-list-wizard",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "School Overview",
                    href: "/students/reports/school-overview",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "Certificate Wizard",
                    href: "/students/reports/certificate-wizard",
                    icon: <FaAngleDoubleRight />,
                },
            ],
        },
    ];

    const transportItems = [
        { title: "All Modules", href: "/Transport/all-module", icon: <FaAngleDoubleRight /> },
        { title: "Vehicle Type Master", href: "/Transport/vehicle-type-master", icon: <FaAngleDoubleRight /> },
        { title: "Vehicle Master", href: "/Transport/vehicle-master", icon: <FaAngleDoubleRight /> },
        { title: "Route Master", href: "/Transport/route-master", icon: <FaAngleDoubleRight /> },
        { title: "Fuel Filling", href: "/Transport/fuel-filling", icon: <FaAngleDoubleRight /> },
        { title: "Student Vehicle Relation", href: "/Transport/student-vehicle-relation", icon: <FaAngleDoubleRight /> },
        {
            title: "Reports",
            href: "/Transport/reports/all-reports",
            icon: <FaFileAlt />,
            isOpen: true,
            children: [
                {
                    title: "All Reports",
                    href: "/Transport/reports/all-reports",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "All Transport Info",
                    href: "/Transport/reports/all-transportInfo",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "Vehicle Fee Info",
                    href: "/Transport/reports/vehicleFeeInfo",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "Transport Users",
                    href: "/Transport/reports/transportUsers",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "All Fuel Filling",
                    href: "/Transport/reports/all-fuelFilling",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "PickUp Point Report",
                    href: "/Transport/reports/pickUpPointReport",
                    icon: <FaAngleDoubleRight />,
                },
            ],
        },
    ];
    const feeItems = [
        { title: "All Modules", href: "/fees/all-module", icon: <FaAngleDoubleRight /> },
        { title: "Dashboard", href: "/fees/dashboard", icon: <FaAngleDoubleRight /> },
        { title: "School Accounts", href: "/fees/school-account", icon: <FaAngleDoubleRight /> },
        { title: "Installment Master", href: "/fees/installmentMaster", icon: <FaAngleDoubleRight /> },
        { title: "Head Master", href: "/fees/headMaster", icon: <FaAngleDoubleRight /> },
        { title: "Fee Group", href: "/fees/feeGroup", icon: <FaAngleDoubleRight /> },
        { title: "Payment Master", href: "/fees/payment-master", icon: <FaAngleDoubleRight /> },
        { title: "Fee Setting", href: "/fees/feeSetting", icon: <FaAngleDoubleRight /> },
        { title: "Bank Master", href: "/fees/bank-master", icon: <FaAngleDoubleRight /> },
        { title: "Petty Head", href: "/fees/pettyHeadMaster", icon: <FaAngleDoubleRight /> },
        { title: "Fee Structure", href: "/fees/fee-structure", icon: <FaAngleDoubleRight /> },
        // { title: "Fee Statement", href: "/fees/fee-Statement", icon: <FaAngleDoubleRight /> },
        { title: "Fixed Amount", href: "/fees/fixed-amount", icon: <FaAngleDoubleRight /> },
        { title: "Fee Entry", href: "/fees/fee-entry", icon: <FaAngleDoubleRight /> },
        // { title: "Fee Entryy", href: "/fees/feeEntryy", icon: <FaAngleDoubleRight /> },
        { title: "Concession Entry", href: "/fees/concession-entry", icon: <FaAngleDoubleRight /> },
        { title: "Cheque Bounce Entry", href: "/fees/cheque-bounce", icon: <FaAngleDoubleRight /> },
        {
            title: "Reports",
            href: "/fees/reports/fee-reports",
            icon: <FaFileAlt />,
            isOpen: true,
            children: [
                {
                    title: "All Reports",
                    href: "/fees/reports/fee-reports",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "All Collection",
                    href: "/fees/reports/all-collection",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "Dailywise Collection",
                    href: "/fees/reports/daywise-collection",
                    icon: <FaAngleDoubleRight />,
                },
            ],
        },
    ];


    const frontItems = [
        { title: "All Modules", href: "/front-office/all-module", icon: <FaAngleDoubleRight /> },
        { title: "Mail In", href: "/front-office/mail-in", icon: <FaAngleDoubleRight /> },
        { title: "Mail Out", href: "/front-office/mail-out", icon: <FaAngleDoubleRight /> },
        { title: "Address Book", href: "/front-office/address-book", icon: <FaAngleDoubleRight /> },
        { title: "Gate Pass", href: "/front-office/gate-pass", icon: <FaAngleDoubleRight /> },
    ];

    const stockItems = [
        { title: "All Modules", href: "/stock/all-module", icon: <FaAngleDoubleRight /> },
        { title: "Store Master", href: "/stock/store-master", icon: <FaAngleDoubleRight /> },
        { title: "Item Category", href: "/stock/item-category", icon: <FaAngleDoubleRight /> },
        { title: "Item Master", href: "/stock/item-master", icon: <FaAngleDoubleRight /> },
        { title: "Vendor Master", href: "/stock/vendor-master", icon: <FaAngleDoubleRight /> },
        { title: "Quotation Master", href: "/stock/quotation-master", icon: <FaAngleDoubleRight /> },
        { title: "Purchase Order", href: "/stock/purchase-order", icon: <FaAngleDoubleRight /> },
        { title: "Stock Available", href: "/stock/stock-available", icon: <FaAngleDoubleRight /> },
        { title: "Issue Item", href: "/stock/issue-item", icon: <FaAngleDoubleRight /> },
        { title: "Return Item", href: "/stock/return-item", icon: <FaAngleDoubleRight /> },
        { title: "Write Off Entry", href: "/stock/write-off-entry", icon: <FaAngleDoubleRight /> },
        { title: "GatePass Entry", href: "/stock/gate-pass", icon: <FaAngleDoubleRight /> },
        { title: "Generate Gate Pass", href: "/stock/generate-gate-pass", icon: <FaAngleDoubleRight /> },
        {
            title: "Reports",
            href: "/stock/reports/all-reports",
            icon: <FaFileAlt />,
            isOpen: true,
            children: [
                {
                    title: "All Reports",
                    href: "/stock/reports/all-reports",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "All Item Details",
                    href: "/stock/reports/all-itemDetails",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "Vendor Details",
                    href: "/stock/reports/vendorDatabase",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "Quotation Details",
                    href: "/stock/reports/quotationDetails",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "Purchase Order Details",
                    href: "/stock/reports/purchaseOrderDetails",
                    icon: <FaAngleDoubleRight />,
                },
            ],
        },
    ];
    const accountItems = [
        { title: "All Modules", href: "/accounts/all-module", icon: <FaAngleDoubleRight /> },
        { title: "Stock Purchase", href: "/accounts/stock-purchase", icon: <FaAngleDoubleRight /> },
        { title: "HRD Salary", href: "/accounts/hrd-salary", icon: <FaAngleDoubleRight /> },
        { title: "Expense Entry", href: "/accounts/expense-entry", icon: <FaAngleDoubleRight /> },
        { title: "Bal Bank", href: "/accounts/bal-bank", icon: <FaAngleDoubleRight /> },
        // { title: "All Income", href: "/accounts/all-income", icon: <FaAngleDoubleRight /> },
    ];
    const galleryItems = [
        { title: "All Modules", href: "/gallery/all-module", icon: <FaAngleDoubleRight /> },
        { title: "Add Group", href: "/gallery/add-group", icon: <FaAngleDoubleRight /> },
        { title: "Add Image", href: "/gallery/add-image", icon: <FaAngleDoubleRight /> },
        { title: "Image Record", href: "/gallery/image-record", icon: <FaAngleDoubleRight /> },
    ];
    const medicalItems = [
        { title: "All Modules", href: "/medical/all-module", icon: <FaAngleDoubleRight /> },
        { title: "Add Check Up Type", href: "/medical/add-check-up-type", icon: <FaAngleDoubleRight /> },
        { title: "Add Doctor Profile", href: "/medical/add-doctor-profile", icon: <FaAngleDoubleRight /> },
        { title: "Routine Check-Up", href: "/medical/routine-check-up", icon: <FaAngleDoubleRight /> },
    ];
    const advertisingItems = [
        { title: "All Modules", href: "/advertising-management/all-module", icon: <FaAngleDoubleRight /> },
        { title: "Create Type", href: "/advertising-management/create-type", icon: <FaAngleDoubleRight /> },
        { title: "Enter Data", href: "/advertising-management/enter-data", icon: <FaAngleDoubleRight /> },
    ];
    const examItems = [
        { title: "All Modules", href: "/exam/all-module", icon: <FaAngleDoubleRight /> },
        { title: "Exam Grade Master", href: "/exam/examGradeMaster", icon: <FaAngleDoubleRight /> },
        { title: "Exam Type Master", href: "/exam/examTypeMaster", icon: <FaAngleDoubleRight /> },
        { title: "Exam Master", href: "/exam/examMaster", icon: <FaAngleDoubleRight /> },
        { title: "Marks Entry", href: "/exam/marksEntry", icon: <FaAngleDoubleRight /> },
        { title: "Exam Time Table", href: "/exam/examTimeTable", icon: <FaAngleDoubleRight /> },
        { title: "Allot Class Teacher", href: "/exam/allotClassTeacher", icon: <FaAngleDoubleRight /> },
        { title: "Subject Category", href: "/exam/subjectCategory", icon: <FaAngleDoubleRight /> },
        { title: "Subject Sub Category", href: "/exam/subjectSubCategory", icon: <FaAngleDoubleRight /> },
        { title: "Remarks Master", href: "/exam/remarksEntry", icon: <FaAngleDoubleRight /> },
        {
            title: "Reports",
            href: "/exam/reports/all-reports",
            icon: <FaFileAlt />,
            isOpen: true,
            children: [
                {
                    title: "All Reports",
                    href: "/exam/reports/all-reports",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "Mark Subjectwise",
                    href: "/exam/reports/subjectwise-students-report",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "Stu.wise Marksheet",
                    href: "/exam/reports/student-wise-marksheet",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "Sec.wise Marksheet",
                    href: "/exam/reports/section-wise-marksheet",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "Download Student List",
                    href: "/exam/reports/download_students_list",
                    icon: <FaAngleDoubleRight />,
                },
            ],
        },
    ];
    const noticeItems = [
        { title: "All Modules", href: "/notice/all-module", icon: <FaAngleDoubleRight /> },
        { title: "Add Notice", href: "/notice/addNotice", icon: <FaAngleDoubleRight /> },
        { title: "Notice Records", href: "/notice/noticeRecords", icon: <FaAngleDoubleRight /> },
    ];
    const hrdItems = [
        { title: "All Modules", href: "/hrd/allModule", icon: <FaAngleDoubleRight /> },
        { title: "Designation Master", href: "/hrd/designationMaster", icon: <FaAngleDoubleRight /> },
        { title: "Allowance Master", href: "/hrd/allowanceMaster", icon: <FaAngleDoubleRight /> },
        { title: "Loan Master", href: "/hrd/loanMaster", icon: <FaAngleDoubleRight /> },
        { title: "Nature Of Appointment", href: "/hrd/natureOfAppo", icon: <FaAngleDoubleRight /> },
        { title: "Department Master", href: "/hrd/departmentMaster", icon: <FaAngleDoubleRight /> },
        { title: "Grade Master", href: "/hrd/gradeMaster", icon: <FaAngleDoubleRight /> },
        { title: "Category Master", href: "/hrd/categoryMaster", icon: <FaAngleDoubleRight /> },
        { title: "Leave Master", href: "/hrd/leaveMaster", icon: <FaAngleDoubleRight /> },
        { title: "Holiday Master", href: "/hrd/holidayMaster", icon: <FaAngleDoubleRight /> },
        { title: "New Employee", href: "/hrd/newEmployee", icon: <FaAngleDoubleRight /> },
        {
            title: "Faculty Attendance",
            href: "/hrd/facultyAttendence/all-reports",
            icon: <FaFileAlt />,
            isOpen: true,
            children: [
                {
                    title: "All Modules",
                    href: "/hrd/facultyAttendence/all-module",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "Mark Present",
                    href: "/hrd/facultyAttendence/markPresent",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "Mark Half Day",
                    href: "/hrd/facultyAttendence/mark-halfDay",
                    icon: <FaAngleDoubleRight />,
                },
            ],
        },
        { title: "Issue Loan", href: "/hrd/issue-loan", icon: <FaAngleDoubleRight /> },
    ];
    const libraryItems = [
        { title: "All Modules", href: "/library/all-module", icon: <FaAngleDoubleRight /> },
        { title: "Group Master", href: "/library/groupMaster", icon: <FaAngleDoubleRight /> },
        { title: "Publisher Master", href: "/library/publisher", icon: <FaAngleDoubleRight /> },
        { title: "Rack Master", href: "/library/rackMaster", icon: <FaAngleDoubleRight /> },
        { title: "Vendor Master", href: "/library/vendorMaster", icon: <FaAngleDoubleRight /> },
        { title: "Fine Master", href: "/library/fineMaster", icon: <FaAngleDoubleRight /> },
        { title: "Category Master", href: "/library/categoryMaster", icon: <FaAngleDoubleRight /> },
        { title: "New Book Entry", href: "/library/newBookEntry", icon: <FaAngleDoubleRight /> },
        { title: "New Book Suggestion", href: "/library/newBookSuggestion", icon: <FaAngleDoubleRight /> },
        { title: "Issue Book", href: "/library/issueBook", icon: <FaAngleDoubleRight /> },
        { title: "Return Book", href: "/library/returnBook", icon: <FaAngleDoubleRight /> },
        {
            title: "Reports",
            href: "/library/reports/all-reports",
            icon: <FaFileAlt />,
            isOpen: true,
            children: [
                {
                    title: "All Reports",
                    href: "/library/reports/all-reports",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "Publisher Record Report",
                    href: "/library/reports/publisher-report",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "Book Bank",
                    href: "/library/reports/book-bank",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "Issued/Returned Book reports",
                    href: "/library/reports/issued-returned-book-report",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "Suggested Book Report",
                    href: "/library/reports/suggested-book-report",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "Pay Fine Reports",
                    href: "/library/reports/pay-fine-records",
                    icon: <FaAngleDoubleRight />,
                },

            ],
        },
    ];
    const sendBulkSmsItems = [
        { title: "All Modules", href: "/sendsms/all-module", icon: <FaAngleDoubleRight /> }, ,
        { title: "Send SMS to Students", href: "/sendsms/student", icon: <FaAngleDoubleRight /> },
        { title: "Send SMS to Staff", href: "/sendsms/staff", icon: <FaAngleDoubleRight /> },
    ];
    const dailydairyItems = [
        { title: "DailyDairy Details", href: "/dailyDairy", icon: <FaAngleDoubleRight /> },
    ];
    const thoughtItems = [
        { title: "Thought", href: "/thought", icon: <FaAngleDoubleRight /> },
    ];
    const complaintItems = [
        { title: "Complaint", href: "/complaintdetails", icon: <FaAngleDoubleRight /> },
    ];
    const appointmentItems = [
        { title: "Appointment", href: "/appointment", icon: <FaAngleDoubleRight /> },
    ];
    const importantSMSItems = [
        { title: "importantSMS", href: "/importantSMS", icon: <FaAngleDoubleRight /> },
    ];
    const syllabusDetailItem = [
        { title: "DailyDairy Details", href: "/dailyDairy", icon: <MdOutlineLibraryBooks /> },
    ];
    const studentAttendenceItems = [
        { title: "All Modules", href: "/studentAttendence/allModule", icon: <FaAngleDoubleRight /> },
        { title: "Take Attendence", href: "/studentAttendence/TakeAttendence", icon: <FaAngleDoubleRight /> },
        { title: "Attendence Report", href: "/studentAttendence/AttendenceReport", icon: <FaAngleDoubleRight /> },
        { title: "Monthly Report", href: "/studentAttendence/MonthlyReport", icon: <FaAngleDoubleRight /> },
    ];
    const balbankItems = [
        { title: "All Modules", href: "/balbank/all-module", icon: <FaAngleDoubleRight /> },
        { title: "Deposit Amount", href: "/balbank/deposite-amount", icon: <FaAngleDoubleRight /> },
        { title: "Daily Transaction Entry", href: "/balbank/daily-transaction-entry", icon: <FaAngleDoubleRight /> },
        { title: "Report", href: "/balbank/report", icon: <FaAngleDoubleRight /> },
    ];
    const timetableItems = [
        { title: "All Modules", href: "/timetable/all-module", icon: <FaAngleDoubleRight /> },
        { title: "Regular Time Table", href: "/timetable/regular-timetable", icon: <FaAngleDoubleRight /> },
        { title: "Adjust Time Table", href: "/timetable/adjust-timetable", icon: <FaAngleDoubleRight /> },
    ];
    const chartfillingItems = [
        { title: "All Modules", href: "/chartfilling/all-module", icon: <FaAngleDoubleRight /> },
        { title: "Student Evaluation", href: "/chartfilling/student-evaluation", icon: <FaAngleDoubleRight /> },
        { title: "Evalution Report", href: "/chartfilling/report", icon: <FaAngleDoubleRight /> },
    ];
    const copycorrectionItems = [
        { title: "All Modules", href: "/copycorrection/all-module", icon: <FaAngleDoubleRight /> },
        { title: "Copy Check", href: "/copycorrection/copy-check", icon: <FaAngleDoubleRight /> },
        { title: "Copy Check report", href: "/copycorrection/copy-check-report", icon: <FaAngleDoubleRight /> },
    ];
    const visitorDetailsItems = [
        { title: "All Modules", href: "/visitordetails/all-module", icon: <FaAngleDoubleRight /> },
        { title: "Visitor Entry", href: "/visitordetails/visitor-entry", icon: <FaAngleDoubleRight /> },
        { title: "Generate Pass", href: "/visitordetails/generate-pass", icon: <FaAngleDoubleRight /> },
    ];
    const youtubeVideoItems = [
        { title: "All Modules", href: "/youtubevideo/all-module", icon: <FaAngleDoubleRight /> },
        { title: "Add Group", href: "/youtubevideo/add-group", icon: <FaAngleDoubleRight /> },
        { title: "Add Youtube Video", href: "/youtubevideo/add-video", icon: <FaAngleDoubleRight /> },
        { title: "Video Records", href: "/youtubevideo/video-records", icon: <FaAngleDoubleRight /> },
    ];
    const userItems = [
        { title: "All Modules", href: "/userManagement/all-module", icon: <FaAngleDoubleRight /> },
        { title: "Add User", href: "/userManagement/addUser", icon: <FaAngleDoubleRight /> },
        { title: "Existing Users", href: "/userManagement/exisitingUser", icon: <FaAngleDoubleRight /> },
    ];
    const websitemanagementItems = [
        { title: "All Modules", href: "/website-management/all-module", icon: <FaAngleDoubleRight /> },
        { title: "Home Page Slider", href: "/website-management/home-page-slider", icon: <FaAngleDoubleRight /> },
        { title: "Add 1st Menu", href: "/website-management/add-main-menu", icon: <FaAngleDoubleRight /> },
        { title: "Add 2nd Sub Menu", href: "/website-management/add-sub-menu", icon: <FaAngleDoubleRight /> },
        { title: "Add 3rd Sub Menu", href: "/website-management/add-last-sub-menu", icon: <FaAngleDoubleRight /> },
        { title: "Add Templates", href: "/website-management/add-template", icon: <FaAngleDoubleRight /> },
        { title: "Add Pages", href: "/website-management/add-pages", icon: <FaAngleDoubleRight /> },
        { title: "Add Image Gallery", href: "/gallery/all-module", icon: <FaAngleDoubleRight /> },
        { title: "Add Notice", href: "/notice/all-module", icon: <FaAngleDoubleRight /> },
        { title: "Add Publication Images", href: "/website-management/publication-image", icon: <FaAngleDoubleRight /> },
        {
            title: "Fit India Images",
            href: "#",
            icon: <FaFileAlt />,
            isOpen: true,
            children: [
                {
                    title: "All Module",
                    href: "/website-management/fit-india-images/all-module",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "Add Group",
                    href: "/website-management/fit-india-images/add-group",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "Add Image",
                    href: "/website-management/fit-india-images/add-image",
                    icon: <FaAngleDoubleRight />,
                },
                {
                    title: "Image Records",
                    href: "/website-management/fit-india-images/image-records",
                    icon: <FaAngleDoubleRight />,
                },
            ],
        },
        { title: "Contact Details", href: "/website-management/contact-details", icon: <FaAngleDoubleRight /> },
    ];
    return (
        <div>
            <div
                className={`sidebar ${isOpen || sidebarHover ? "open" : "closed"}`}
                onMouseEnter={() => setSidebarHover(true)}
                onMouseLeave={() => setSidebarHover(false)}
            >
                <div className="sidebar-profile d-flex align-items-center flex-column">
                    <div className="position-relative">
                        <Image src={profilePic ? profilePic : "/user4.png"} className="img-shadow img-5x mb-2 rounded-circle" alt="Gym Admin Templates" />
                        <span className="count-dot"></span>
                    </div>
                    <div className="text-center">
                        <h6 className="profile-name text-nowrap text-truncate">{userName}</h6>
                        <span className="badge bg-primary text-capitalize">{userType}</span>
                    </div>
                </div>
                <ul>
                    <Accordion activeKey={activeKey} onSelect={handleAccordionToggle} className="sidebarAccordion">
                        {/* Single items */}
                        <Accordion.Item eventKey="dashboard" className="nav-item">
                            <Accordion.Header>
                                <Link href="/" className={isActiveLink("/") ? "active-parent" : "nav-link"}>
                                    <span>
                                        <FaGauge /> {(isOpen || sidebarHover) && "Dashboard"}
                                    </span>
                                </Link>
                            </Accordion.Header>
                        </Accordion.Item>
                        <Accordion.Item eventKey="home" className="nav-item">
                            <Accordion.Header>
                                <Link href="/home" className={isActiveLink("/home") ? "active-parent" : "nav-link"}>
                                    <span>
                                        <FaHome /> {(isOpen || sidebarHover) && "Home"}
                                    </span>
                                </Link>
                            </Accordion.Header>
                        </Accordion.Item>
                        {/* Master Entry */}
                        {hasAccess("masterentry") && (
                            <Accordion.Item eventKey="masterEntry">
                                <Accordion.Header>
                                    <span className={masterEntryItems.some(item => isActiveLink(item.href)) ? "active-parent" : ""}>
                                        <FaGauge />
                                        {(isOpen || sidebarHover) && "Master Entry"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: (isOpen || sidebarHover) ? "20px" : "0" }}>
                                        {masterEntryItems.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0", display: "flex", alignItems: "center" }}>
                                                {item.icon}
                                                <span style={{ display: (isOpen || sidebarHover) ? "inline" : "none" }}>
                                                    <Link href={item.href} className={isActiveLink(item.href) ? "active" : ""}>
                                                        {item.title}
                                                    </Link>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}
                        {/* Students */}
                        {hasAccess("students") && (
                            <Accordion.Item eventKey="students">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }} className={studentItems.some(item => isActiveLink(item.href)) ? "active-parent" : ""}>
                                        <FaUserGraduate style={{ marginRight: (isOpen || sidebarHover) ? "10px" : "0" }} />
                                        {(isOpen || sidebarHover) && "Students"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: (isOpen || sidebarHover) ? "20px" : "0" }}>
                                        {studentItems.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0" }}>
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    {item.icon}
                                                    <span style={{ marginLeft: "10px", display: (isOpen || sidebarHover) ? "inline" : "none" }}>
                                                        <Link href={item.href} className={isActiveLink(item.href) ? "active" : ""}>{item.title}</Link>
                                                    </span>
                                                </div>
                                                {item.children && activeKey === "students" && (
                                                    <ul style={{ listStyle: "none", paddingLeft: "20px" }}>
                                                        {item.children.map((child, childIndex) => (
                                                            <li key={childIndex} style={{ padding: "5px 0", display: "flex", alignItems: "center" }}>
                                                                {child.icon}
                                                                <span style={{ marginLeft: "10px" }}>
                                                                    <Link href={child.href} className={isActiveLink(child.href) ? "active" : ""}>{child.title}</Link>
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}
                        {/* transport module  */}
                        {hasAccess("transport") && (
                            <Accordion.Item eventKey="transport">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }} className={transportItems.some(item => isActiveLink(item.href)) ? "active-parent" : ""}>
                                        <FaBus style={{ marginRight: (isOpen || sidebarHover) ? "10px" : "0" }} />
                                        {(isOpen || sidebarHover) && "Transport"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: (isOpen || sidebarHover) ? "20px" : "0" }}>
                                        {transportItems.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0" }}>
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    {item.icon}
                                                    <span style={{ marginLeft: "10px", display: (isOpen || sidebarHover) ? "inline" : "none" }}>
                                                        <Link href={item.href} className={isActiveLink(item.href) ? "active" : ""}>{item.title}</Link>
                                                    </span>
                                                </div>
                                                {item.children && activeKey === "transport" && (
                                                    <ul style={{ listStyle: "none", paddingLeft: "20px" }}>
                                                        {item.children.map((child, childIndex) => (
                                                            <li key={childIndex} style={{ padding: "5px 0", display: "flex", alignItems: "center" }}>
                                                                {child.icon}
                                                                <span style={{ marginLeft: "10px" }}>
                                                                    <Link href={child.href} className={isActiveLink(child.href) ? "active" : ""}>{child.title}</Link>
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}
                        {hasAccess('fees') && (
                            <Accordion.Item eventKey="fee">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }} className={feeItems.some(item => isActiveLink(item.href)) ? "active-parent" : ""}>
                                        <FaRupeeSign style={{ marginRight: isOpen || activeKey ? "10px" : "0" }} />
                                        {(isOpen || activeKey) && "Fees"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: (isOpen || sidebarHover) ? "20px" : "0" }}>
                                        {feeItems.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0" }}>
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    {item.icon}
                                                    <span
                                                        style={{
                                                            marginLeft: "10px",
                                                            display: (isOpen || sidebarHover) ? "inline" : "none",
                                                        }}
                                                    >
                                                        <Link href={item.href} className={isActiveLink(item.href) ? "active" : ""}>{item.title}</Link>
                                                    </span>
                                                </div>
                                                {item.children && activeKey === "fee" && (
                                                    <ul style={{ listStyle: "none", paddingLeft: "20px" }}>
                                                        {item.children.map((child, childIndex) => (
                                                            <li
                                                                key={childIndex}
                                                                style={{
                                                                    padding: "5px 0",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                }}
                                                            >
                                                                {child.icon}
                                                                <span style={{ marginLeft: "10px" }}>
                                                                    <Link href={child.href} className={isActiveLink(child.href) ? "active" : ""}>{child.title}</Link>
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}
                        {hasAccess('studentattendance') && (
                            <Accordion.Item eventKey="sudentAttendence">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }} className={studentAttendenceItems.some(item => isActiveLink(item.href)) ? "active-parent" : ""}>
                                        <RiUserFollowLine style={{ marginRight: isOpen || activeKey ? "10px" : "0" }} />
                                        {(isOpen || activeKey) && "Student Attendence"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: isOpen || activeKey ? "20px" : "0" }}>
                                        {studentAttendenceItems.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0", display: "flex", alignItems: "center" }}>
                                                {item.icon}
                                                <span style={{ display: isOpen || activeKey ? "inline" : "none" }}>
                                                    <Link href={item.href} className={isActiveLink(item.href) ? "active" : ""}>
                                                        {item.title}
                                                    </Link>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}
                        {hasAccess("hrd") && (
                            <Accordion.Item eventKey="HRD">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }} className={hrdItems.some(item => isActiveLink(item.href)) ? "active-parent" : ""}>
                                        <TiContacts style={{ marginRight: (isOpen || sidebarHover) ? "10px" : "0" }} />
                                        {(isOpen || sidebarHover) && "HRD"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: (isOpen || sidebarHover) ? "20px" : "0" }}>
                                        {hrdItems.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0" }}>
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    {item.icon}
                                                    <span style={{ marginLeft: "10px", display: (isOpen || sidebarHover) ? "inline" : "none" }}>
                                                        <Link href={item.href} className={isActiveLink(item.href) ? "active" : ""}>{item.title}</Link>
                                                    </span>
                                                </div>
                                                {item.children && activeKey === "HRD" && (
                                                    <ul style={{ listStyle: "none", paddingLeft: "20px" }}>
                                                        {item.children.map((child, childIndex) => (
                                                            <li key={childIndex} style={{ padding: "5px 0", display: "flex", alignItems: "center" }}>
                                                                {child.icon}
                                                                <span style={{ marginLeft: "10px" }}>
                                                                    <Link href={child.href} className={isActiveLink(child.href) ? "active" : ""}>{child.title}</Link>
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}
                        {hasAccess("exam") && (
                            <Accordion.Item eventKey="exams">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }} className={examItems.some(item => isActiveLink(item.href)) ? "active-parent" : ""}>
                                        <FaFileAlt style={{ marginRight: isOpen || activeKey ? "10px" : "0" }} />
                                        {(isOpen || activeKey) && "Exams"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: isOpen || activeKey ? "20px" : "0" }}>
                                        {examItems.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0" }}>
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    {item.icon}
                                                    <span style={{ marginLeft: "10px", display: (isOpen || activeKey) ? "inline" : "none" }}>
                                                        {item.children ? (
                                                            <span>{item.title}</span>
                                                        ) : (
                                                            <Link href={item.href} className={isActiveLink(item.href) ? "active" : ""}>{item.title}</Link>
                                                        )}
                                                    </span>
                                                </div>
                                                {item.children && activeKey === "exams" && (
                                                    <ul style={{ listStyle: "none", paddingLeft: "20px" }}>
                                                        {item.children.map((child, childIndex) => (
                                                            <li key={childIndex} style={{ padding: "5px 0", display: "flex", alignItems: "center" }}>
                                                                {child.icon}
                                                                <span style={{ marginLeft: "10px" }}>
                                                                    <Link href={child.href} className={isActiveLink(child.href) ? "active" : ""}>{child.title}</Link>
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}
                        {hasAccess("syllabus") && (
                            <Accordion.Item className="nav-item" eventKey="syllabus">
                                <Accordion.Header>
                                    <Link href="/syllabus" className={isActiveLink("/syllabus") ? "active-parent" : "nav-link"}>
                                        <span>
                                            <MdOutlineLibraryBooks /> {(isOpen || activeKey) && "Syllabus detail"}
                                        </span>
                                    </Link>
                                </Accordion.Header>
                            </Accordion.Item>
                        )}
                        {hasAccess("homework") && (
                            <Accordion.Item className="nav-item" eventKey="homework">
                                <Accordion.Header>
                                    <Link href="/homework" className={isActiveLink("/homework") ? "active-parent" : "nav-link"}>
                                        <span>
                                            <MdOutlineHomeWork /> {(isOpen || activeKey) && "Home Work"}
                                        </span>
                                    </Link>
                                </Accordion.Header>
                            </Accordion.Item>
                        )}
                        {hasAccess('timetable') && (
                            <Accordion.Item eventKey="timetable">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }} className={timetableItems.some(item => isActiveLink(item.href)) ? "active-parent" : ""}>
                                        <FaTable style={{ marginRight: isOpen || activeKey ? "10px" : "0" }} />
                                        {(isOpen || activeKey) && "Time Table"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: isOpen || activeKey ? "20px" : "0" }}>
                                        {timetableItems.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0", display: "flex", alignItems: "center" }}>
                                                {item.icon}
                                                <span style={{ display: isOpen || activeKey ? "inline" : "none" }}>
                                                    <Link href={item.href} className={isActiveLink(item.href) ? "active" : ""}>
                                                        {item.title}
                                                    </Link>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}
                        {hasAccess("frontoffice") && (
                            <Accordion.Item eventKey="front-office">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }} className={frontItems.some(item => isActiveLink(item.href)) ? "active-parent" : ""}>
                                        <FaBusinessTime style={{ marginRight: isOpen || activeKey ? "10px" : "0" }} />
                                        {(isOpen || activeKey) && "Front Office"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: isOpen || activeKey ? "20px" : "0" }}>
                                        {frontItems.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0", display: "flex", alignItems: "center" }}>
                                                {item.icon}
                                                <span style={{ display: isOpen || activeKey ? "inline" : "none" }}>
                                                    <Link href={item.href} className={isActiveLink(item.href) ? "active" : ""}>
                                                        {item.title}
                                                    </Link>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}
                        {hasAccess("stock") && (
                            <Accordion.Item eventKey="stock">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }} className={stockItems.some(item => isActiveLink(item.href)) ? "active-parent" : ""}>
                                        <FaBoxOpen style={{ marginRight: (isOpen || sidebarHover) ? "10px" : "0" }} />
                                        {(isOpen || sidebarHover) && "Stock"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: (isOpen || sidebarHover) ? "20px" : "0" }}>
                                        {stockItems.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0" }}>
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    {item.icon}
                                                    <span
                                                        style={{
                                                            marginLeft: "10px",
                                                            display: (isOpen || sidebarHover) ? "inline" : "none",
                                                        }}
                                                    >
                                                        <Link href={item.href} className={isActiveLink(item.href) ? "active" : ""}>{item.title}</Link>
                                                    </span>
                                                </div>
                                                {item.children && activeKey === "stock" && (
                                                    <ul style={{ listStyle: "none", paddingLeft: "20px" }}>
                                                        {item.children.map((child, childIndex) => (
                                                            <li
                                                                key={childIndex}
                                                                style={{
                                                                    padding: "5px 0",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                }}
                                                            >
                                                                {child.icon}
                                                                <span style={{ marginLeft: "10px" }}>
                                                                    <Link href={child.href} className={isActiveLink(child.href) ? "active" : ""}>{child.title}</Link>
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}
                        {hasAccess("accounts") && (
                            <Accordion.Item eventKey="account">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }} className={accountItems.some(item => isActiveLink(item.href)) ? "active-parent" : ""}>
                                        <MdAccountBalance style={{ marginRight: isOpen || activeKey ? "10px" : "0" }} />
                                        {(isOpen || activeKey) && "Accounts"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: isOpen || activeKey ? "20px" : "0" }}>
                                        {accountItems.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0", display: "flex", alignItems: "center" }}>
                                                {item.icon}
                                                <span style={{ display: isOpen || activeKey ? "inline" : "none" }}>
                                                    <Link href={item.href} className={isActiveLink(item.href) ? "active" : ""}>
                                                        {item.title}
                                                    </Link>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}
                        {hasAccess("medical") && (
                            <Accordion.Item eventKey="medical">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }} className={medicalItems.some(item => isActiveLink(item.href)) ? "active-parent" : ""}>
                                        <FaBriefcaseMedical style={{ marginRight: isOpen || activeKey ? "10px" : "0" }} />
                                        {(isOpen || activeKey) && "Medical"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: isOpen || activeKey ? "20px" : "0" }}>
                                        {medicalItems.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0", display: "flex", alignItems: "center" }}>
                                                {item.icon}
                                                <span style={{ display: isOpen || activeKey ? "inline" : "none" }}>
                                                    <Link href={item.href} className={isActiveLink(item.href) ? "active" : ""}>
                                                        {item.title}
                                                    </Link>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                        )}
                        {hasAccess("gallery") && (
                            <Accordion.Item eventKey="gallery">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }} className={galleryItems.some(item => isActiveLink(item.href)) ? "active-parent" : ""}>
                                        <FaPhotoVideo style={{ marginRight: isOpen || activeKey ? "10px" : "0" }} />
                                        {(isOpen || activeKey) && "Gallery"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: isOpen || activeKey ? "20px" : "0" }}>
                                        {galleryItems.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0", display: "flex", alignItems: "center" }}>
                                                {item.icon}
                                                <span style={{ display: isOpen || activeKey ? "inline" : "none" }}>
                                                    <Link href={item.href} className={isActiveLink(item.href) ? "active" : ""}>
                                                        {item.title}
                                                    </Link>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}
                        {hasAccess("advertising") && (
                            <Accordion.Item eventKey="advertising-management">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }} className={advertisingItems.some(item => isActiveLink(item.href)) ? "active-parent" : ""}>
                                        <FaNewspaper style={{ marginRight: isOpen || activeKey ? "10px" : "0" }} />
                                        {(isOpen || activeKey) && "Advertising Management"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: isOpen || activeKey ? "20px" : "0" }}>
                                        {advertisingItems.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0", display: "flex", alignItems: "center" }}>
                                                {item.icon}
                                                <span style={{ display: isOpen || activeKey ? "inline" : "none" }}>
                                                    <Link href={item.href} className={isActiveLink(item.href) ? "active" : ""}>
                                                        {item.title}
                                                    </Link>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}
                        {hasAccess("notice") && (
                            <Accordion.Item eventKey="notice">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }} className={noticeItems.some(item => isActiveLink(item.href)) ? "active-parent" : ""}>
                                        <FaBell style={{ marginRight: isOpen || activeKey ? "10px" : "0" }} />
                                        {(isOpen || activeKey) && "Notice"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: isOpen || activeKey ? "20px" : "0" }}>
                                        {noticeItems.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0", display: "flex", alignItems: "center" }}>
                                                {item.icon}
                                                <span style={{ display: isOpen || activeKey ? "inline" : "none" }}>
                                                    <Link href={item.href} className={isActiveLink(item.href) ? "active" : ""}>
                                                        {item.title}
                                                    </Link>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}
                        {hasAccess('library') && (
                            <Accordion.Item eventKey="library">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }} className={libraryItems.some(item => isActiveLink(item.href)) ? "active-parent" : ""}>
                                        <FaBoxOpen style={{ marginRight: (isOpen || sidebarHover) ? "10px" : "0" }} />
                                        {(isOpen || sidebarHover) && "Library"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: (isOpen || sidebarHover) ? "20px" : "0" }}>
                                        {libraryItems.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0" }}>
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    {item.icon}
                                                    <span
                                                        style={{
                                                            marginLeft: "10px",
                                                            display: (isOpen || sidebarHover) ? "inline" : "none",
                                                        }}
                                                    >
                                                        <Link href={item.href} className={isActiveLink(item.href) ? "active" : ""}>{item.title}</Link>
                                                    </span>
                                                </div>
                                                {item.children && activeKey === "library" && (
                                                    <ul style={{ listStyle: "none", paddingLeft: "20px" }}>
                                                        {item.children.map((child, childIndex) => (
                                                            <li
                                                                key={childIndex}
                                                                style={{
                                                                    padding: "5px 0",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                }}
                                                            >
                                                                {child.icon}
                                                                <span style={{ marginLeft: "10px" }}>
                                                                    <Link href={child.href} className={isActiveLink(child.href) ? "active" : ""}>{child.title}</Link>
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}
                        {hasAccess("sendsms") && (
                            <Accordion.Item eventKey="sendsms">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }} className={sendBulkSmsItems.some(item => isActiveLink(item.href)) ? "active-parent" : ""}>
                                        <FaSms style={{ marginRight: isOpen || activeKey ? "10px" : "0" }} />
                                        {(isOpen || activeKey) && "Send Bulk SMS"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: isOpen || activeKey ? "20px" : "0" }}>
                                        {sendBulkSmsItems.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0", display: "flex", alignItems: "center" }}>
                                                {item.icon}
                                                <span style={{ display: isOpen || activeKey ? "inline" : "none" }}>
                                                    <Link href={item.href} className={isActiveLink(item.href) ? "active" : ""}>
                                                        {item.title}
                                                    </Link>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}
                        {hasAccess("dailydairy") && (
                            <Accordion.Item className="nav-item">
                                <Accordion.Header>
                                    <Link href="/dailyDairy" className={isActiveLink("/dailyDairy") ? "active-parent" : "nav-link"}>
                                        <span>
                                            <FaBook /> {(isOpen || activeKey) && "DailyDiary Details"}
                                        </span>
                                    </Link>
                                </Accordion.Header>
                            </Accordion.Item>
                        )}
                        {hasAccess('thought') && (
                            <Accordion.Item className="nav-item" eventKey="thought">
                                <Accordion.Header>
                                    <Link href="/thought" className={isActiveLink("/thought") ? "active-parent" : "nav-link"}>
                                        <span>
                                            <FaFileAlt /> {(isOpen || activeKey) && "Thought"}
                                        </span>
                                    </Link>
                                </Accordion.Header>
                            </Accordion.Item>
                        )}
                        {hasAccess("appoinmentdetails") && (
                            <Accordion.Item className="nav-item" eventKey="appointment">
                                <Accordion.Header>
                                    <Link href="/appointment" className={isActiveLink("/appointment") ? "active-parent" : "nav-link"}>
                                        <span>
                                            <FaCalendarPlus /> {(isOpen || activeKey) && "Appointment Details"}
                                        </span>
                                    </Link>
                                </Accordion.Header>
                            </Accordion.Item>
                        )}
                        {hasAccess("complaintdetails") && (
                            <Accordion.Item className="nav-item" eventKey="complaints">
                                <Accordion.Header>
                                    <Link href="/complaintdetails" className={isActiveLink("/complaintdetails") ? "active-parent" : "nav-link"}>
                                        <span>
                                            <FaBug /> {(isOpen || activeKey) && "Complaint Details"}
                                        </span>
                                    </Link>
                                </Accordion.Header>
                            </Accordion.Item>
                        )}
                        {hasAccess("importantsms") && (
                            <Accordion.Item className="nav-item" eventKey="importantSMS">
                                <Accordion.Header>
                                    <Link href="/importantSMS" className={isActiveLink("/importantSMS") ? "active-parent" : "nav-link"}>
                                        <span>
                                            <FaEnvelope /> {(isOpen || activeKey) && "Important SMS"}
                                        </span>
                                    </Link>
                                </Accordion.Header>
                            </Accordion.Item>
                        )}
                        
                        {hasAccess('visitordetails') && (
                            <Accordion.Item eventKey="visitordetails">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }} className={visitorDetailsItems.some(item => isActiveLink(item.href)) ? "active-parent" : ""}>
                                        <FaArrowRightArrowLeft style={{ marginRight: isOpen || activeKey ? "10px" : "0" }} />
                                        {(isOpen || activeKey) && "Visitor Details"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: isOpen || activeKey ? "20px" : "0" }}>
                                        {visitorDetailsItems.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0", display: "flex", alignItems: "center" }}>
                                                {item.icon}
                                                <span style={{ display: isOpen || activeKey ? "inline" : "none" }}>
                                                    <Link href={item.href} className={isActiveLink(item.href) ? "active" : ""}>
                                                        {item.title}
                                                    </Link>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}
                        {hasAccess('balbank') && (
                            <Accordion.Item eventKey="balbank">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }} className={balbankItems.some(item => isActiveLink(item.href)) ? "active-parent" : ""}>
                                        <RiBankCard2Line style={{ marginRight: isOpen || activeKey ? "10px" : "0" }} />
                                        {(isOpen || activeKey) && "Bal Bank"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: isOpen || activeKey ? "20px" : "0" }}>
                                        {balbankItems.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0", display: "flex", alignItems: "center" }}>
                                                {item.icon}
                                                <span style={{ display: isOpen || activeKey ? "inline" : "none" }}>
                                                    <Link href={item.href} className={isActiveLink(item.href) ? "active" : ""}>
                                                        {item.title}
                                                    </Link>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}
                        {hasAccess('youtubevideo') && (
                            <Accordion.Item eventKey="youtubevideo">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }} className={youtubeVideoItems.some(item => isActiveLink(item.href)) ? "active-parent" : ""}>
                                        <FaYoutube style={{ marginRight: isOpen || activeKey ? "10px" : "0" }} />
                                        {(isOpen || activeKey) && "Youtube Video"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: isOpen || activeKey ? "20px" : "0" }}>
                                        {youtubeVideoItems?.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0", display: "flex", alignItems: "center" }}>
                                                {item.icon}
                                                <span style={{ display: isOpen || activeKey ? "inline" : "none" }}>
                                                    <Link href={item.href} className={isActiveLink(item.href) ? "active" : ""}>
                                                        {item.title}
                                                    </Link>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}
                        {hasAccess('chartfilling') && (
                            <Accordion.Item eventKey="chartfilling">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }}>
                                        <FaChartArea style={{ marginRight: isOpen || activeKey ? "10px" : "0" }} />
                                        {(isOpen || activeKey) && "Chart Filling"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: isOpen || activeKey ? "20px" : "0" }}>
                                        {chartfillingItems.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0", display: "flex", alignItems: "center" }}>
                                                {item.icon}
                                                <span style={{ display: isOpen || activeKey ? "inline" : "none" }}>
                                                    <Link href={item.href} className={isActiveLink(item.href) ? "active" : ""}>
                                                        {item.title}
                                                    </Link>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}
                        {hasAccess('copycorrection') && (
                            <Accordion.Item eventKey="copycorrection">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }} className={copycorrectionItems.some(item => isActiveLink(item.href)) ? "active-parent" : ""}>
                                        <MdLibraryBooks style={{ marginRight: isOpen || activeKey ? "10px" : "0" }} />
                                        {(isOpen || activeKey) && "Copy Correction"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: isOpen || activeKey ? "20px" : "0" }}>
                                        {copycorrectionItems.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0", display: "flex", alignItems: "center" }}>
                                                {item.icon}
                                                <span style={{ display: isOpen || activeKey ? "inline" : "none" }}>
                                                    <Link href={item.href} className={isActiveLink(item.href) ? "active" : ""}>
                                                        {item.title}
                                                    </Link>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}
                        {hasAccess("usermanagement") && (
                            <Accordion.Item eventKey="userManagement">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }} className={userItems.some(item => isActiveLink(item.href)) ? "active-parent" : ""}>
                                        <FaUsersCog style={{ marginRight: isOpen || activeKey ? "10px" : "0" }} />
                                        {(isOpen || activeKey) && "User Management"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: isOpen || activeKey ? "20px" : "0" }}>
                                        {userItems.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0", display: "flex", alignItems: "center" }}>
                                                {item.icon}
                                                <span style={{ display: isOpen || activeKey ? "inline" : "none" }}>
                                                    <Link href={item.href} className={isActiveLink(item.href) ? "active" : ""}>
                                                        {item.title}
                                                    </Link>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}
                        {hasAccess("websitemanagement") && (
                            <Accordion.Item eventKey="websitemanagement">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }} className={websitemanagementItems.some(item => isActiveLink(item.href)) ? "active-parent" : ""}>
                                        <FaGlobe style={{ marginRight: (isOpen || sidebarHover) ? "10px" : "0" }} />
                                        {(isOpen || sidebarHover) && "Website Management"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: (isOpen || sidebarHover) ? "20px" : "0" }}>
                                        {websitemanagementItems.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0" }}>
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    {item.icon}
                                                    <span
                                                        style={{
                                                            marginLeft: "10px",
                                                            display: (isOpen || sidebarHover) ? "inline" : "none",
                                                        }}
                                                    >
                                                        <Link href={item.href} className={isActiveLink(item.href) ? "active" : ""}>{item.title}</Link>
                                                    </span>
                                                </div>
                                                {item.children && activeKey === "websitemanagement" && (
                                                    <ul style={{ listStyle: "none", paddingLeft: "20px" }}>
                                                        {item.children.map((child, childIndex) => (
                                                            <li
                                                                key={childIndex}
                                                                style={{
                                                                    padding: "5px 0",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                }}
                                                            >
                                                                {child.icon}
                                                                <span style={{ marginLeft: "10px" }}>
                                                                    <Link href={child.href} className={isActiveLink(child.href) ? "active" : ""}>{child.title}</Link>
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}
                    </Accordion>
                </ul>
            </div>
            <div
                style={{
                    marginLeft: isOpen ? "250px" : "80px",
                    transition: "margin-left 0.2s ease",
                }}
            >
            </div>
        </div>
    );
}