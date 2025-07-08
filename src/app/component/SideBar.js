"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Accordion } from "react-bootstrap";
import { FaHome, FaBug, FaBell, FaBriefcaseMedical, FaAngleDoubleRight, FaFile, FaEnvelope, FaUsersCog, FaBook, FaCalendarPlus, FaPhotoVideo, FaNewspaper, FaUserGraduate, FaFileAlt, FaBus, FaRupeeSign, FaBusinessTime, FaBoxOpen } from "react-icons/fa";
import { FaGauge } from "react-icons/fa6";
import { MdAccountBalance, MdLibraryBooks } from "react-icons/md";
import { TiContacts } from "react-icons/ti";
import { RiUserFollowLine } from "react-icons/ri";
import { Image } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
export default function Sidebar({ isOpen }) {
    const [activeKey, setActiveKey] = useState(null);
    const [sidebarHover, setSidebarHover] = useState(false);
    const [userName, setUserName] = useState("User Name");
    const [profilePic, setProfilePic] = useState("");
    const [authorities, setAuthorities] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (token) {
            const decoded = jwtDecode(token);
            const userName = decoded.data?.username;
            setUserName(userName);
            setProfilePic(decoded.data?.profile_pic);

            // Set authorities
            setAuthorities(decoded.data?.authorities || []);
        }
    }, []);

    const hasAccess = (moduleName) => {
        return authorities.some((auth) => auth.module === moduleName);
    };


    // Function to handle accordion toggle
    const handleAccordionToggle = (key) => {
        setActiveKey(activeKey === key ? null : key);
    };

    // ... (keep all your item arrays the same)
    const masterEntryItems = [
        { title: "All Modules", href: "/master-entry/all-module", icon: <FaAngleDoubleRight /> },
        { title: "School Info", href: "/master-entry/school-info", icon: <FaAngleDoubleRight /> },
        { title: "Class Master", href: "/master-entry/class-master", icon: <FaAngleDoubleRight /> },
        { title: "City Master", href: "/master-entry/city-master", icon: <FaAngleDoubleRight /> },
        { title: "Year Master", href: "/master-entry/year-master", icon: <FaAngleDoubleRight /> },
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
    ];

    const frontItems = [
        { title: "All Modules", href: "/front-office/all-module", icon: <FaAngleDoubleRight /> },
        { title: "Mail In", href: "/front-office/mail-in", icon: <FaAngleDoubleRight /> },
        { title: "Mail Out", href: "/front-office/mail-out", icon: <FaAngleDoubleRight /> },
        { title: "Address Book", href: "/front-office/address-book", icon: <FaAngleDoubleRight /> },
        { title: "Gate Pass", href: "/stock/gate-pass", icon: <FaAngleDoubleRight /> },
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
        { title: "All Income", href: "/accounts/all-income", icon: <FaAngleDoubleRight /> },
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
            ],
        },
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
    ];
    const dailydairyItems = [
        { title: "DailyDairy Details", href: "/dailyDairy", icon: <FaAngleDoubleRight /> },
    ];
    const thoughtItems = [
        { title: "Thought", href: "/thought", icon: <FaAngleDoubleRight /> },
    ];
    const complaintItems = [
        { title: "Complaint", href: "/complaints", icon: <FaAngleDoubleRight /> },
    ];
    const appointmentItems = [
        { title: "Appointment", href: "/appointment", icon: <FaAngleDoubleRight /> },
    ];
    const importantSMSItems = [
        { title: "importantSMS", href: "/importantSMS", icon: <FaAngleDoubleRight /> },
    ];
    const studentAttendenceItems = [
        { title: "All Modules", href: "/studentAttendence/allModule", icon: <FaAngleDoubleRight /> },
        { title: "Take Attendence", href: "/studentAttendence/TakeAttendence", icon: <FaAngleDoubleRight /> },
        { title: "Attendence Report", href: "/studentAttendence/AttendenceReport", icon: <FaAngleDoubleRight /> },
        { title: "Monthly Report", href: "/studentAttendence/MonthlyReport", icon: <FaAngleDoubleRight /> },
    ];
    const userItems = [
        { title: "All Modules", href: "/userManagement/all-module", icon: <FaAngleDoubleRight /> },
        { title: "Add User", href: "/userManagement/addUser", icon: <FaAngleDoubleRight /> },
        { title: "Existing Users", href: "/userManagement/exisitingUser", icon: <FaAngleDoubleRight /> },
    ];


    return (
        <div>
            <div
                className={`sidebar ${isOpen || sidebarHover ? "open" : "closed"}`}
            // onMouseEnter={() => setSidebarHover(true)}
            // onMouseLeave={() => setSidebarHover(false)}
            >
                <div className="sidebar-profile d-flex align-items-center flex-column">
                    <div className="position-relative">
                        <Image src={profilePic ? profilePic : "/user4.png"} className="img-shadow img-5x mb-2 rounded-circle" alt="Gym Admin Templates" />
                        <span className="count-dot"></span>
                    </div>
                    <div className="text-center">
                        <h6 className="profile-name text-nowrap text-truncate">{userName}</h6>
                        <span className="badge bg-danger">Principal</span>
                    </div>
                </div>
                <ul>
                    <Accordion activeKey={activeKey} onSelect={handleAccordionToggle} className="sidebarAccordion">
                        {/* Single items */}
                        <Accordion.Item eventKey="dashboard" className="nav-item">
                            <Accordion.Header>
                                <Link href="/" className="nav-link">
                                    <span>
                                        <FaGauge /> {(isOpen || sidebarHover) && "Dashboard"}
                                    </span>
                                </Link>
                            </Accordion.Header>
                        </Accordion.Item>
                        <Accordion.Item eventKey="home" className="nav-item">
                            <Accordion.Header>
                                <Link href="/home" className="nav-link">
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
                                    <span>
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
                                                    <Link href={item.href}>
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
                        {hasAccess("student") && (
                            <Accordion.Item eventKey="students">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }}>
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
                                                        <Link href={item.href}>{item.title}</Link>
                                                    </span>
                                                </div>
                                                {item.children && activeKey === "students" && (
                                                    <ul style={{ listStyle: "none", paddingLeft: "20px" }}>
                                                        {item.children.map((child, childIndex) => (
                                                            <li key={childIndex} style={{ padding: "5px 0", display: "flex", alignItems: "center" }}>
                                                                {child.icon}
                                                                <span style={{ marginLeft: "10px" }}>
                                                                    <Link href={child.href}>{child.title}</Link>
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
                                    <span style={{ display: "flex", alignItems: "center" }}>
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
                                                        <Link href={item.href}>{item.title}</Link>
                                                    </span>
                                                </div>
                                                {item.children && activeKey === "transport" && (
                                                    <ul style={{ listStyle: "none", paddingLeft: "20px" }}>
                                                        {item.children.map((child, childIndex) => (
                                                            <li key={childIndex} style={{ padding: "5px 0", display: "flex", alignItems: "center" }}>
                                                                {child.icon}
                                                                <span style={{ marginLeft: "10px" }}>
                                                                    <Link href={child.href}>{child.title}</Link>
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

                        {/* fee module  */}
                        {hasAccess('fees') && (
                            <Accordion.Item eventKey="fee">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }}>
                                        <FaRupeeSign style={{ marginRight: isOpen || activeKey ? "10px" : "0" }} />
                                        {(isOpen || activeKey) && "Fees"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: isOpen || activeKey ? "20px" : "0" }}>
                                        {feeItems.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0", display: "flex", alignItems: "center" }}>
                                                {item.icon}
                                                <span style={{ display: isOpen || activeKey ? "inline" : "none" }}>
                                                    <Link href={item.href}>
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
                                    <span style={{ display: "flex", alignItems: "center" }}>
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
                                                    <Link href={item.href}>
                                                        {item.title}
                                                    </Link>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}

                        {/* stock module  */}
                        {hasAccess("stock") && (
                            <Accordion.Item eventKey="stock">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }}>
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
                                                        <Link href={item.href}>{item.title}</Link>
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
                                                                    <Link href={child.href}>{child.title}</Link>
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
                                    <span style={{ display: "flex", alignItems: "center" }}>
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
                                                    <Link href={item.href}>
                                                        {item.title}
                                                    </Link>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}
                        {/* medical module  */}
                        {hasAccess("medical") && (
                            <Accordion.Item eventKey="medical">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }}>
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
                                                    <Link href={item.href}>
                                                        {item.title}
                                                    </Link>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                        )}
                        {/* gallery module  */}
                        {hasAccess("gallery") && (
                            <Accordion.Item eventKey="gallery">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }}>
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
                                                    <Link href={item.href}>
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
                                    <span style={{ display: "flex", alignItems: "center" }}>
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
                                                    <Link href={item.href}>
                                                        {item.title}
                                                    </Link>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}
                        {hasAccess("exams") && (
                            <Accordion.Item eventKey="exams">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }}>
                                        <FaFileAlt style={{ marginRight: isOpen || activeKey ? "10px" : "0" }} />
                                        {(isOpen || activeKey) && "Exams"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: isOpen || activeKey ? "20px" : "0" }}>
                                        {examItems.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0", display: "flex", alignItems: "center" }}>
                                                {item.icon}
                                                <span style={{ display: isOpen || activeKey ? "inline" : "none" }}>
                                                    <Link href={item.href}>
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
                                    <span style={{ display: "flex", alignItems: "center" }}>
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
                                                    <Link href={item.href}>
                                                        {item.title}
                                                    </Link>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        )}
                        {/* hrd module  */}
                        {hasAccess("hrd") && (
                            <Accordion.Item eventKey="HRD">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }}>
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
                                                        <Link href={item.href}>{item.title}</Link>
                                                    </span>
                                                </div>
                                                {item.children && activeKey === "HRD" && (
                                                    <ul style={{ listStyle: "none", paddingLeft: "20px" }}>
                                                        {item.children.map((child, childIndex) => (
                                                            <li key={childIndex} style={{ padding: "5px 0", display: "flex", alignItems: "center" }}>
                                                                {child.icon}
                                                                <span style={{ marginLeft: "10px" }}>
                                                                    <Link href={child.href}>{child.title}</Link>
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
                        {/* library module  */}
                        {hasAccess('library') && (
                            <Accordion.Item eventKey="library">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }}>
                                        <MdLibraryBooks style={{ marginRight: isOpen || activeKey ? "10px" : "0" }} />
                                        {(isOpen || activeKey) && "Library"}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul style={{ listStyle: "none", paddingLeft: isOpen || activeKey ? "20px" : "0" }}>
                                        {libraryItems.map((item, index) => (
                                            <li key={index} style={{ padding: "5px 0", display: "flex", alignItems: "center" }}>
                                                {item.icon}
                                                <span style={{ display: isOpen || activeKey ? "inline" : "none" }}>
                                                    <Link href={item.href}>
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
                                    <Link href="/dailyDairy" className="nav-link">
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
                                    <Link href="/thought" className="nav-link">
                                        <span>
                                            <FaFileAlt /> {(isOpen || activeKey) && "Thought"}
                                        </span>
                                    </Link>
                                </Accordion.Header>
                            </Accordion.Item>
                        )}
                        {hasAccess("complaintdetails") && (
                            <Accordion.Item className="nav-item" eventKey="complaints">
                                <Accordion.Header>
                                    <Link href="/complaints" className="nav-link">
                                        <span>
                                            <FaBug /> {(isOpen || activeKey) && "Complaint Details"}
                                        </span>
                                    </Link>
                                </Accordion.Header>
                            </Accordion.Item>
                        )}
                        {hasAccess("appoinmentdetails") && (
                            <Accordion.Item className="nav-item" eventKey="appointment">
                                <Accordion.Header>
                                    <Link href="/appointment" className="nav-link">
                                        <span>
                                            <FaCalendarPlus /> {(isOpen || activeKey) && "Appointment Details"}
                                        </span>
                                    </Link>
                                </Accordion.Header>
                            </Accordion.Item>
                        )}
                        {hasAccess("importantsms") && (
                            <Accordion.Item className="nav-item" eventKey="importantSMS">
                                <Accordion.Header>
                                    <Link href="/importantSMS" className="nav-link">
                                        <span>
                                            <FaEnvelope /> {(isOpen || activeKey) && "Important SMS"}
                                        </span>
                                    </Link>
                                </Accordion.Header>
                            </Accordion.Item>
                        )}
                        {hasAccess('attendance') && (
                            <Accordion.Item eventKey="sudentAttendence">
                                <Accordion.Header>
                                    <span style={{ display: "flex", alignItems: "center" }}>
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
                                                    <Link href={item.href}>
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
                                    <span style={{ display: "flex", alignItems: "center" }}>
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
                                                    <Link href={item.href}>
                                                        {item.title}
                                                    </Link>
                                                </span>
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