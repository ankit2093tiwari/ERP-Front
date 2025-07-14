"use client"

import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert } from 'react-bootstrap';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { getClasses, getAllExamTypes, BASE_URL, getExamsTimeTable } from '@/Services';
import DataTable from '@/app/component/DataTable';
import { copyContent, printContent } from "@/app/utils";
import useSessionId from '@/hooks/useSessionId';

const ExamTimeTable = () => {
  const selectedSessionId = useSessionId()
  const [classes, setClasses] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [timeTables, setTimeTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredTables, setFilteredTables] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, [selectedSessionId]);

  const fetchInitialData = async () => {
    try {
      const [classRes, examTypeRes] = await Promise.all([
        getClasses(),
        getAllExamTypes(),
      ]);
      setClasses(classRes.data);
      setExamTypes(examTypeRes.data);
    } catch (err) {
      console.error("Error loading initial data", err);
    }
  };

  const fetchTimeTable = async () => {
    if (!selectedClass) return;

    try {
      setLoading(true);
      const res = await getExamsTimeTable({
        class: selectedClass,
        examType: selectedExamType
      })
      setTimeTables(res.data || []);
      setFilteredTables(res.data || []);
    } catch (err) {
      console.error("Error fetching timetable", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    let filtered = timeTables;
    if (selectedExamType) {
      filtered = filtered.filter(tt => tt.examType?._id === selectedExamType);
    }
    setFilteredTables(filtered);
  };

  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line
  }, [selectedExamType]);

  const tableData = filteredTables.flatMap((exam, idx) =>
    exam.examDetails.map((detail, subIdx) => ({
      sno: `${idx + 1}.${subIdx + 1}`,
      className: exam.class?.class_name,
      examTypeName: exam.examType?.examTypeName,
      subjectName: detail.subject?.subject_details?.subject_name,
      date: new Date(detail.examDate).toLocaleDateString(),
      time: `${detail.fromTime} - ${detail.toTime}`,
      examHolder: detail.examHolder?.employee_name || '-',
      maxMin: `${detail.maxMarks} / ${detail.minMarks}`,
      practical: `${detail.practicalMaxMarks} / ${detail.practicalMinMarks}`,
    }))
  );
  const columns = [
    { name: "#", selector: (_, i) => i + 1, width: "80px" },
    { name: "Class", selector: row => row.className },
    { name: "Exam Type", selector: row => row.examTypeName },
    { name: "Subject", selector: row => row.subjectName },
    { name: "Date", selector: row => row.date },
    { name: "Time", selector: row => row.time, width: "160px" },
    { name: "Exam Holder", selector: row => row.examHolder },
    { name: "Max / Min", selector: row => row.maxMin },
    { name: "Practical Max / Min", selector: row => row.practical },
  ];

  const handlePrint = () => {
    const tableHeaders = [["#", "Class", "Exam Type", "Subject", "Date", "Time", "Exam Holder", "Max / Min", "P-Max / Min"]];

    const tableRows = tableData.map((row, index) => [
      index + 1,
      row.className,
      row.examTypeName,
      row.subjectName,
      row.date,
      row.time,
      row.examHolder,
      row.maxMin,
      row.practical
    ]);

    printContent(tableHeaders, tableRows);
  };
  const handleCopy = () => {
    const headers = ["#", "Class", "Exam Type", "Subject", "Date", "Time", "Exam Holder", "Max / Min", "Practical Max / Min"];

    const rows = filteredTables.flatMap((exam, idx) =>
      exam.examDetails.map((detail, subIdx) => {
        const sno = `${subIdx + 1}`;
        const className = exam.class?.class_name || "N/A";
        const examType = exam.examType?.examTypeName || "N/A";
        const subject = detail.subject?.subject_details?.subject_name || "N/A";
        const date = new Date(detail.examDate).toLocaleDateString();
        const time = `${detail.fromTime} - ${detail.toTime}`;
        const examHolder = detail.examHolder?.employee_name || "-";
        const maxMin = `${detail.maxMarks} / ${detail.minMarks}`;
        const practical = `${detail.practicalMaxMarks} / ${detail.practicalMinMarks}`;

        return [sno, className, examType, subject, date, time, examHolder, maxMin, practical].join("\t");
      })
    );

    copyContent(headers, rows);
  };



  // Breadcrumb
  const breadcrumbItems = [
    { label: "Exams", link: "/exam/all-module" },
    { label: "Exam timeTable", link: null },
  ];

  return (
    <>
      <div className="breadcrumbSheet">
        <Container>
          <Row>
            <Col>
              <BreadcrumbComp items={breadcrumbItems} />
            </Col>
          </Row>
        </Container>
      </div>
      <section>
        <Container fluid className="mt-4 studentHeading">
          <h2>Exam Time Table</h2>
          <div className="cover-sheet">
            <div className='formSheet'>
              <Row className="mb-3">
                <Col md={5}>
                  <Form.Group>
                    <Form.Label>Select Class</Form.Label>
                    <Form.Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                      <option value="">-- Select Class --</option>
                      {classes.map(cls => (
                        <option key={cls._id} value={cls._id}>{cls.class_name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Group>
                    <Form.Label>Select Exam Type</Form.Label>
                    <Form.Select value={selectedExamType} onChange={(e) => setSelectedExamType(e.target.value)}>
                      <option value="">-- All Exam Types --</option>
                      {examTypes.map(et => (
                        <option key={et._id} value={et._id}>{et.examTypeName}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4} className="d-flex align-items-end">
                  <Button onClick={fetchTimeTable} disabled={!selectedClass}>Search</Button>
                </Col>
              </Row>
            </div>

          </div>

          {loading && <p>Loading...</p>}


          {filteredTables.length > 0 ? (
            <DataTable
              columns={columns}
              data={tableData}
              handlePrint={handlePrint}
              handleCopy={handleCopy}
            />
          ) : !loading && (
            <Alert variant="info">No data available. Please select filters and search.</Alert>
          )}
        </Container>
      </section >
    </>
  );
};

export default ExamTimeTable;
