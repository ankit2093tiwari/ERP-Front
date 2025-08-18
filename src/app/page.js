"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import feeImg from "@/app/Assets/fee.webp";
import busImg from "@/app/Assets/bus.webp";
import stocksImg from "@/app/Assets/stocks.webp";
import payrollImg from "@/app/Assets/payroll.webp";
import books from "@/app/Assets/books.webp";
import Exam from "@/app/Assets/exam.webp";
import Attendance from "@/app/Assets/attendance.webp";
import timetable from "@/app/Assets/timetable.webp";
import User from "@/app/Assets/user.webp";
import Website from "@/app/Assets/website.webp";
import HomeWork from "@/app/Assets/homeWork.webp";
import { Row, Col } from "react-bootstrap"
import { MdOutlineLibraryBooks, MdOutlineAccountTree } from "react-icons/md";
import { FiUsers } from "react-icons/fi";
import { PiUserGear } from "react-icons/pi";
import { VscLibrary } from "react-icons/vsc";
import dynamic from 'next/dynamic';
import { Table, Container } from "react-bootstrap";
import Image from "next/image";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { useSelector } from "react-redux";
import { getAllBooksCount, getAllDepartmentsCount, getAllEmployee, getAllImportantSMS, getAllStudents, getAllUniqueSubjectCount, getStudentEvaluations, getThoughtOfDay, getTotalStudentsCount } from "@/Services";
import useSessionId from "@/hooks/useSessionId";
import { all } from "axios";


// Dynamically import ReactApexChart with SSR disabled
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const Dashboard = () => {
  const selectedSessionId = useSessionId();
  const { token } = useSelector((state) => state.auth);

  const router = useRouter();
  const [dashboardData, setDashboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentCount, setStudentCount] = useState(0);
  const [studentsByClass, setStudentsByClass] = useState([]);
  const [thoughtOfTheDay, setThoughtOfTheDay] = useState("");
  const [numberOfDepartment, setNumberOfDepartment] = useState(0)
  const [numberOfBooks, setNumberOfBooks] = useState(0)
  const [numberOSubjects, setNumberOfSubjects] = useState(0)
  const [teachingStaff, setTeachingStaff] = useState(0)
  const [nonTeachingStaff, setNonTeachingStaff] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [studentEvaluations, setStudentEvaluations] = useState([]);
  const [allStudents, setAllStudents] = useState([]);

  // Fetch all students data
  const fetchAllStudents = async () => {
    const res = await getAllStudents(5)
    setAllStudents(res.data || []);
  }
  // Check authentication and fetch data
 useEffect(() => {
  if (!token) {
    router.push('/');
    return;
  }

  const fetchAllData = async () => {
    const results = await Promise.allSettled([
      fetchStudentData(),
      fetchDashboardData(),
      fetchThoughtOfTheDay(),
      fetchDepartmentCount(),
      fetchBookCount(),
      fetchStaffCount(),
      fetchSubjectCount(),
      fetchNotifications(),
      fetchStudentEvaluations(),
      fetchAllStudents()
    ]);

    results.forEach((res, index) => {
      if (res.status === "rejected") {
        console.error(`API call ${index} failed:`, res.reason);
      }
    });
  };

  fetchAllData();
}, [router, selectedSessionId, token]);


  // Fetch thought of the day
  const fetchThoughtOfTheDay = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const response = await getThoughtOfDay(today);

      if (response.data && response.data.length > 0) {
        setThoughtOfTheDay(response.data[0].thought_name);
      } else {
        setThoughtOfTheDay("No thought for today. Add one to inspire!");
      }
    } catch (error) {
      console.error("Error fetching thought of the day:", error);
      setThoughtOfTheDay("Error loading today's thought");
    }
  };
  // Fetch student count data from API
  const fetchStudentData = async () => {
    try {
      const data = await getTotalStudentsCount()

      if (data.success) {
        setStudentCount(data.data.totalStudents);
        setStudentsByClass(data.data.studentsByClass);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      // Fallback to default values if API fails
      setStudentCount(1500);
      setStudentsByClass([
        { className: "Class 10", count: 120 },
        { className: "Class 9", count: 110 },
        { className: "Class 8", count: 90 }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartmentCount = async () => {
    try {
      const res = await getAllDepartmentsCount();
      setNumberOfDepartment(res.data || 0)
    } catch (error) {
      console.error('failed to count departments!', error)
    }
  }
  const fetchBookCount = async () => {
    try {
      const res = await getAllBooksCount();
      setNumberOfBooks(res.data || 0)
    } catch (error) {
      console.error('failed to count books!', error)
    }
  }
  const fetchStaffCount = async () => {
    try {
      const res = await getAllEmployee();
      const employees = res.data || [];

      // Count Teaching and Non-Teaching employees
      const teachingCount = employees.filter(emp => emp.designation_name?.designation_type === 'Teaching').length || 0;
      const nonTeachingCount = employees.length - teachingCount || 0;

      setTeachingStaff(teachingCount || 0)
      setNonTeachingStaff(nonTeachingCount || 0)
    } catch (error) {
      console.error('Failed to count staff!', error);
    }
  };
  const fetchSubjectCount = async () => {
    try {
      const res = await getAllUniqueSubjectCount();
      setNumberOfSubjects(res.uniqueSubjectCount || 0)

    } catch (error) {
      console.error('Failed to count staff!', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await getAllImportantSMS()
      const filteredData = res.data.filter((d => d.status == "active"))
      setNotifications(filteredData || [])
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };
  const fetchStudentEvaluations = async () => {
    try {
      const res = await getStudentEvaluations(5);
      const formattedData = res.data.flatMap((eva) =>
        eva.evaluations
          .filter((e) => e.eval === "Excellent")
          .map((student) => ({
            ...student,
            className: eva.classId?.class_name || "",
            sectionName: eva.sectionId?.section_name || "",
          }))
      );
      setStudentEvaluations(formattedData || []);
    } catch (error) {
      console.error("Error fetching student evaluations:", error);
    }
  };


  // Simulated API Data for other dashboard items
  const fetchDashboardData = async () => {
    const mockData = [
      { name: "FEES", icon: feeImg, count: 750000, label: "Amount" },
      { name: "TRANSPORT", icon: busImg, count: 100, label: "Vehicles" },
      { name: "STOCKS", icon: stocksImg, count: 200, label: "Items" },
      { name: "PAYROLL", icon: payrollImg, count: 300, label: "Employees" },
      { name: "LIBRARY", icon: books, count: 5000, label: "Books" },
      { name: "EXAM", icon: Exam, count: 50, label: "Exams" },
      { name: "ATTENDANCE", icon: Attendance, count: 95, label: "Percent" },
      { name: "TIME TABLE", icon: timetable, count: 12, label: "Schedules" },
      { name: "USERS", icon: User, count: 500, label: "Active" },
      { name: "WEBSITE", icon: Website, count: 1, label: "Online" },
      { name: "HOME WORK", icon: HomeWork, count: 150, label: "Tasks" },
    ];
    setDashboardData(mockData);
  };



  // Radial Chart State
  const [state, setState] = useState({
    series: [83],
    options: {
      chart: {
        height: 400,
        type: 'radialBar',
        offsetY: -10
      },
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,
          dataLabels: {
            name: {
              fontSize: '16px',
              color: '#333',
              offsetY: 120
            },
            value: {
              offsetY: 76,
              fontSize: '22px',
              color: '#dc3545',
              fontWeight: 'bold',
              formatter: function (val) {
                return val + "%";
              }
            }
          }
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          shadeIntensity: 0.4,
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 50, 100],
          colors: ['#3498db', '#1abc9c', '#2ecc71']
        },
      },
      stroke: {
        dashArray: 4,
        colors: ['#333']
      },
      labels: ['Attendance'],
    },
  });

  // Bar Chart State
  const [payroll, setPayroll] = useState({
    series: [{
      name: 'Inflation',
      data: [2.3, 3.1, 4.0, 10.1, 4.0, 3.6, 3.2, 2.3, 1.4, 0.8, 0.5, 0.2]
    }],
    options: {
      chart: {
        height: 300,
        type: 'bar',
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          dataLabels: {
            position: 'top',
          },
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val + "%";
        },
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ["#6a637e"]
        }
      },
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        position: 'top',
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          fill: {
            type: 'gradient',
            gradient: {
              colorFrom: '#6a637e',
              colorTo: '#6a637e',
              stops: [0, 100],
              opacityFrom: 0.4,
              opacityTo: 0.5,
            }
          }
        },
        tooltip: {
          enabled: true,
        }
      },
      yaxis: {
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false,
        },
        labels: {
          show: false,
          formatter: function (val) {
            return val + "%";
          }
        }
      },
      title: {
        text: 'Monthly Inflation in Argentina, 2002',
        floating: true,
        offsetY: 330,
        align: 'center',
        style: {
          color: '#444'
        }
      }
    },
  });

  const [value, onChange] = useState(new Date());
  const breadcrumbItems = [{ label: "Dashboard", link: "null" }];

  if (isLoading) {
    return <div className="d-flex justify-content-center align-items-center vh-100">Loading...</div>;
  }

  return (
    <>
      <div className="breadcrumbSheet position-relative">
        <Container>
          <Row>
            <Col>
              <BreadcrumbComp items={breadcrumbItems} />
            </Col>
          </Row>
        </Container>
      </div>
      <section>
        <Container>
          <div className="dashboardCardCard position-relative">
            <h1> Dashboard <span> Overview, Analytics & Report </span></h1>
            <Row>
              <Col lg={9}>
                <Row>
                  <Col lg={6}>
                    <div className="card widget-first overflow-hidden pt-4 mb-3">
                      <div className="card-body position-relative z-1">
                        <h4 className="fw-normal mt-5 pt-7 mb-1 fw-bold text-start text-dark">Students</h4>
                        <div className="hstack gap-2">
                          <h5 className="card-title mb-0 fs-7 text-dark">
                            {studentCount.toLocaleString()}
                          </h5>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col lg={3}>
                    <div className="card widget overflow-hidden pt-0 mb-3 shadow-none">
                      <div className="card-body position-relative z-1 pt-4">
                        <div className="iconBox">
                          <MdOutlineLibraryBooks />
                        </div>
                        <h5 className="mt-2 pt-7 mb-1 text-center"> Subject </h5>
                        <div className="hstack d-block">
                          <h5 className="card-title mb-0 fs-7"> {numberOSubjects.toLocaleString() || "0"} </h5>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col lg={3}>
                    <div className="card widget overflow-hidden pt-0 mb-3 shadow-none">
                      <div className="card-body position-relative z-1 pt-4">
                        <div className="iconBox">
                          <MdOutlineAccountTree />
                        </div>
                        <h5 className="mt-2 pt-7 mb-1 text-center"> Departments </h5>
                        <div className="hstack d-block">
                          <h5 className="card-title mb-0 fs-7">{numberOfDepartment.toLocaleString() || "0"}</h5>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="card widget overflow-hidden pt-4 mb-3 shadow-none">
                      <div className="card-body position-relative z-1">
                        <div className="iconBox">
                          <FiUsers />
                        </div>
                        <h5 className="mt-2 pt-7 mb-1 text-center"> Teaching Staff </h5>
                        <div className="hstack d-block">
                          <h5 className="card-title mb-0 fs-7">{teachingStaff.toLocaleString() || "0"} </h5>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="card widget overflow-hidden pt-4 mb-3 shadow-none">
                      <div className="card-body position-relative z-1">
                        <div className="iconBox">
                          <PiUserGear />
                        </div>
                        <h5 className="mt-2 pt-7 mb-1 text-center"> Non-Teaching Staff </h5>
                        <div className="hstack d-block">
                          <h5 className="card-title mb-0 fs-7"> {nonTeachingStaff.toLocaleString() || "0"} </h5>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="card widget overflow-hidden pt-4 mb-3 shadow-none">
                      <div className="card-body position-relative z-1">
                        <div className="iconBox">
                          <VscLibrary />
                        </div>
                        <h5 className="mt-2 pt-7 mb-1 text-center"> Books </h5>
                        <div className="hstack d-block">
                          <h5 className="card-title mb-0 fs-7">{numberOfBooks.toLocaleString() || "0"} </h5>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
              <Col lg={3}>
                <div className="card overflow-hidden pt-2 mb-3 pb-0 shadow-none">
                  <div className="card-body position-relative z-1 p-2">
                    <div>
                      <div id="chart">
                        {typeof window !== 'undefined' && (
                          <ReactApexChart options={state.options} series={state.series} type="radialBar" height={260} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card bgPurple overflow-hidden mb-3 pb-0 shadow-none">
                  <div className="card-body bgPurple thought-of-day ">
                    <div className="thought-content d-flex flex-column justify-contend-center align-items-center">
                      <p className="notice-title mb-1 text-white fw-bold">{thoughtOfTheDay || "ALWAYS BE HAPPY"}  </p>
                      <div className="thought-date">{new Date().toLocaleDateString('en-GB')}</div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
            <Row>
              <Col lg={8}>
                <div className="card overflow-hidden pt-2 mb-3 shadow-none">
                  <div className="card-header">
                    <h5 className="fw-normal mb-1 fw-bold text-start"> Annual Payroll </h5>
                  </div>
                  <div className="card-body position-relative z-1">
                    <div>
                      <div id="chart">
                        {typeof window !== 'undefined' && (
                          <ReactApexChart options={payroll.options} series={payroll.series} type="bar" height={300} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
              <Col lg={4}>
                <div className="card card-gray overflow-hidden pt-2 mb-3 shadow-none">
                  <div className="card-header">
                    <h5 className="fw-normal mb-1 fw-bold text-start">New Admissions</h5>
                  </div>
                  <div className="card-body position-relative z-1 categories-box-wrap text-start">
                    <div className="space-y-5">
                      {allStudents.length > 0 ? (
                        allStudents?.map((std, index) => (
                          <a aria-current="page" href="#" className="d-flex align-items-center justify-content-between" key={index}>
                            <div className="d-flex align-items-center gap-3">
                              <span className="d-inline-flex align-items-center justify-content-center font-normal bg-card overflow-hidden">
                                <Image role="img" src="/user.webp" width={100} height={100} alt="Web Development" />
                              </span>
                              <div>
                                <p className="pb-2">{`${std?.first_name || "Unknown"} ${std?.last_name || ""}`}<span>{std?.class_name?.class_name || "Class1"}-{std?.section_name?.section_name || "Section A"}</span></p>
                              </div>
                            </div>
                          </a>
                        ))
                      ) : (
                        <>
                        {/* <div>No Students Available (Showing Static Records)</div> */}
                          <a aria-current="page" href="#" className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-3">
                              <span className="d-inline-flex align-items-center justify-content-center font-normal bg-card overflow-hidden">
                                <Image role="img" src="/user.webp" width={100} height={100} alt="Web Development" />
                              </span>
                              <div>
                                <p className="pb-2">Ram Kumar<span>Class 5 - Section A </span></p>
                              </div>
                            </div>
                          </a>
                          <a aria-current="page" href="#" className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-3">
                              <span className="d-inline-flex align-items-center justify-content-center font-normal bg-card overflow-hidden">
                                <Image role="img" src="/user.webp" width={100} height={100} alt="Web Development" />
                              </span>
                              <div>
                                <p className="pb-2">Shivam<span>Class 2 - Section A </span></p>
                              </div>
                            </div>
                          </a>
                          <a aria-current="page" href="#" className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-3">
                              <span className="d-inline-flex align-items-center justify-content-center font-normal bg-card overflow-hidden">
                                <Image role="img" src="/user.webp" width={100} height={100} alt="Web Development" />
                              </span>
                              <div>
                                <p className="pb-2">Aman Gupta<span>Class 8 - Section A </span></p>
                              </div>
                            </div>
                          </a>
                          <a aria-current="page" href="#" className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-3">
                              <span className="d-inline-flex align-items-center justify-content-center font-normal bg-card overflow-hidden">
                                <Image role="img" src="/user.webp" width={100} height={100} alt="Web Development" />
                              </span>
                              <div>
                                <p className="pb-2">Rajesh Singh<span>Class 2 - Section B </span></p>
                              </div>
                            </div>
                          </a>
                          <a aria-current="page" href="#" className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-3">
                              <span className="d-inline-flex align-items-center justify-content-center font-normal bg-card overflow-hidden">
                                <Image role="img" src="/user.webp" width={100} height={100} alt="Web Development" />
                              </span>
                              <div>
                                <p className="pb-2">Nitesh Verma<span>Class 5 - Section C </span></p>
                              </div>
                            </div>
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Col>
              <Col lg={4}>
                <div className="card overflow-hidden pt-2 mb-3 shadow-none">
                  <div className="card-header">
                    <h5 className="fw-normal mb-1 fw-bold text-start">Calendar & Activity </h5>
                  </div>
                  <div className="card-body position-relative z-1">
                    <Calendar onChange={onChange} value={value} className="calendarActivity" />
                  </div>
                </div>
              </Col>
              <Col lg={4}>
                <div className="card overflow-hidden pt-2 mb-3 shadow-none">
                  <div className="card-header">
                    <h5 className="fw-normal mb-1 fw-bold text-start">Best Performance  </h5>
                  </div>
                  <div className="card-body position-relative z-1 notice-box-wrap text-start">
                    <Table>
                      <tbody>
                        {studentEvaluations.length > 0 ? (
                          studentEvaluations?.map((studentEval, index) => (
                            <tr key={index}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <Image
                                    alt="users"
                                    width={40}
                                    height={40}
                                    className="rounded-circle"
                                    src="/user.webp"
                                  />
                                  <div className="profileTable">
                                    <h6 className="text-capitalize">{`${studentEval.studentId.first_name} ${studentEval.studentId.last_name}` || "Unknown"}</h6>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <small>
                                  {studentEval.className} - {studentEval.sectionName}
                                </small>
                              </td>
                            </tr>
                          ))

                        ) : (
                          <>
                            <tr>
                              <td>
                                <div className="d-flex align-items-center">
                                  <Image alt="users" width={40} height={40} className="rounded-circle" src="/user.webp" />
                                  <div className="profileTable">
                                    <h6> Sunil Joshi </h6>
                                    <span> Class IV </span>
                                  </div></div>
                              </td>
                              <td> 95% </td>
                            </tr>
                            <tr>
                              <td>
                                <div className="d-flex align-items-center">
                                  <Image alt="users" width={40} height={40} className="rounded-circle" src="/user.webp" />
                                  <div className="profileTable">
                                    <h6> Sunil Joshi </h6>
                                    <span> Class IV </span>
                                  </div></div>
                              </td>
                              <td> 95% </td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </div>
              </Col>
              <Col lg={4}>
                <div className="card overflow-hidden pt-2 mb-3 shadow-none">
                  <div className="card-header">
                    <h5 className="fw-normal mb-1 fw-bold text-start">Notifications  </h5>
                  </div>
                  <div className="card-body position-relative z-1 notice-box-wrap text-start">
                    <div className="">
                      {notifications.length === 0 ? (
                        <p className="text-center">No notifications available</p>
                      ) : (
                        notifications.map((not, index) => (
                          <div className="notice-list" key={index}>
                            <div className={index % 2 == 0 ? 'post-date bg-skyblue' : 'post-date bg-pink'}>{new Date(not?.entryDate).toISOString().split('T')[0]}</div>
                            <h6 className="notice-title text-capitalize"><a href="#">{not?.detail}</a></h6>
                            <h5>To- {not.sendTo || "All"}</h5>
                            <div className="entry-meta text-capitalize"> {not?.sendBy || "Principal"} / <span>2 min ago</span></div>
                          </div>
                        ))
                      )}

                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Container>
      </section>
    </>
  );
};

export default Dashboard;