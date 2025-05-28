"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import feeImg from "@/app/Assets/fee.webp";
import studentImg from "@/app/Assets/contactImg.webp";
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
import Card1 from "./component/Card1";
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
import axios from "axios";

// Dynamically import ReactApexChart with SSR disabled
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const Dashboard = () => {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentCount, setStudentCount] = useState(0);
  const [studentsByClass, setStudentsByClass] = useState([]);
  const [thoughtOfTheDay, setThoughtOfTheDay] = useState("");

  // Check authentication and fetch data
  useEffect(() => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token) {
      router.push('/');
    } else {
      fetchStudentData();
      fetchDashboardData();
      fetchThoughtOfTheDay();
    }
  }, [router]);

  // Fetch thought of the day
  const fetchThoughtOfTheDay = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/thoughts?date=${today}`);
      if (response.data.data && response.data.data.length > 0) {
        setThoughtOfTheDay(response.data.data[0].thought_name);
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
      const response = await fetch('https://erp-backend-fy3n.onrender.com/api/students-total');
      if (!response.ok) {
        throw new Error('Failed to fetch student data');
      }
      const data = await response.json();
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
    series: [67],
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
                        <h4 className="fw-normal mt-5 pt-7 mb-1 fw-bold text-start">Student</h4>
                        <div className="hstack gap-2">
                          <h5 className="card-title mb-0 fs-7">
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
                          <h5 className="card-title mb-0 fs-7"> 50 </h5>
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
                        <h5 className="mt-2 pt-7 mb-1 text-center"> Department </h5>
                        <div className="hstack d-block">
                          <h5 className="card-title mb-0 fs-7">  850 </h5>
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
                          <h5 className="card-title mb-0 fs-7"> 650 </h5>
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
                          <h5 className="card-title mb-0 fs-7"> 250 </h5>
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
                          <h5 className="card-title mb-0 fs-7"> 500 </h5>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
              <Col lg={3}>
                <div className="card overflow-hidden pt-2 mb-3 shadow-none">
                  <div className="card-body position-relative z-1">
                    <div>
                      <div id="chart">
                        {typeof window !== 'undefined' && (
                          <ReactApexChart options={state.options} series={state.series} type="radialBar" height={450} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <button className="card btn-primary w-100 py-4 text-white mx-0">
                  <div className="">
                    Dummy Button
                  </div>
                </button>
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
                    <h5 className="fw-normal mb-1 fw-bold text-start">Top Categories  </h5>
                  </div>
                  <div className="card-body position-relative z-1 categories-box-wrap text-start">
                    <div className="space-y-5">
                      <a aria-current="page" href="#" className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <span className="d-inline-flex align-items-center justify-content-center font-normal bg-card overflow-hidden">
                            <Image role="img" src="/user.webp" width={100} height={100} alt="Web Development" />
                          </span>
                          <div>
                            <p className="pb-2">Web Development <span>40+ Courses</span></p>
                          </div>
                        </div>
                      </a>
                      <a aria-current="page" href="#" className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-start gap-3">
                          <span className="d-inline-flex align-items-center justify-content-center font-normal bg-card overflow-hidden">
                            <Image role="img" src="/user.webp" width={100} height={100} alt="Graphic Design" />
                          </span>
                          <div>
                            <p className="pb-2">Graphic Design <span>40+ Courses</span></p>
                          </div>
                        </div>
                      </a>
                      <a aria-current="page" href="#" className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <span className="d-inline-flex align-items-center justify-content-center font-normal bg-card overflow-hidden">
                            <Image role="img" src="/user.webp" width={100} height={100} alt="UI/UX Design" />
                          </span>
                          <div>
                            <p className="pb-2">UI/UX Design <span>10+ Courses</span></p>
                          </div>
                        </div>
                      </a>
                      <a aria-current="page" href="#" className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <span className="d-inline-flex align-items-center justify-content-center font-normal bg-card overflow-hidden">
                            <Image role="img" src="/user.webp" width={100} height={100} alt="3D Animation &amp; Modeling" />
                          </span>
                          <div>
                            <p className="pb-2">3D Animation &amp; Modeling  <span>30+ Courses</span></p>
                          </div>
                        </div>
                      </a>
                      <a aria-current="page" href="#" className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <span className="d-inline-flex align-items-center justify-content-center font-normal bg-card overflow-hidden">
                            <Image role="img" src="/user.webp" width={100} height={100} alt="Digital Marketing" />
                          </span>
                          <div>
                            <p className="pb-2">Digital Marketing <span>80+ Courses</span></p>
                          </div>
                        </div>
                      </a>
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
                      <div className="notice-list">
                        <div className="post-date bg-skyblue">16 June, 2019</div>
                        <h6 className="notice-title"><a href="#">Great School manag mene esom text of the
                          printing.</a></h6>
                        <div className="entry-meta"> Jennyfar Lopez / <span>5 min ago</span></div>
                      </div>
                      <div className="notice-list">
                        <div className="post-date bg-yellow">16 June, 2019</div>
                        <h6 className="notice-title"><a href="#">Great School manag printing.</a></h6>
                        <div className="entry-meta"> Jennyfar Lopez / <span>5 min ago</span></div>
                      </div>
                      <div className="notice-list">
                        <div className="post-date bg-pink">16 June, 2019</div>
                        <h6 className="notice-title"><a href="#">Great School manag meneesom.</a></h6>
                        <div className="entry-meta"> Jennyfar Lopez / <span>5 min ago</span></div>
                      </div>
                      <div className="notice-list">
                        <div className="post-date bg-skyblue">16 June, 2019</div>
                        <h6 className="notice-title"><a href="#">Great School manag mene esom text of the
                          printing.</a></h6>
                        <div className="entry-meta"> Jennyfar Lopez / <span>5 min ago</span></div>
                      </div>
                      <div className="notice-list">
                        <div className="post-date bg-yellow">16 June, 2019</div>
                        <h6 className="notice-title"><a href="#">Great School manag printing.</a></h6>
                        <div className="entry-meta"> Jennyfar Lopez / <span>5 min ago</span></div>
                      </div>
                      <div className="notice-list">
                        <div className="post-date bg-pink">16 June, 2019</div>
                        <h6 className="notice-title"><a href="#">Great School manag meneesom.</a></h6>
                        <div className="entry-meta"> Jennyfar Lopez / <span>5 min ago</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
              <Col lg={4}>
                <div className="card overflow-hidden pt-2 mb-3 shadow-none">
                  <div className="card-header">
                    <h5 className="fw-normal mb-1 fw-bold text-start">Thought of the Day</h5>
                  </div>
                  <div className="card-body position-relative z-1 notice-box-wrap text-start">
                    <div className="thought-of-day">
                      <div className="thought-content">
                        <p className="thought-text">{thoughtOfTheDay}</p>
                        <div className="thought-date">
                          {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
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