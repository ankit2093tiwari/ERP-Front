"use client"

import React, { useEffect, useState } from "react";
import { Card, FormControl, FormLabel } from "react-bootstrap";
import { Button } from "react-bootstrap";
import FormCheckLabel from "react-bootstrap/esm/FormCheckLabel";
// import { getAllLeaveRequests, approveLeaveRequest, rejectLeaveRequest } from "@/services/leaveService";
import { toast } from "react-toastify";

const RequestedLeaveRecords = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const res = await getAllLeaveRequests();
      setLeaveRequests(res.data);
    } catch (error) {
      toast.error("Failed to fetch leave requests");
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveLeaveRequest(id);
      toast.success("Leave Approved");
      fetchLeaveRequests();
    } catch (error) {
      toast.error("Failed to approve leave");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectLeaveRequest(id);
      toast.success("Leave Rejected");
      fetchLeaveRequests();
    } catch (error) {
      toast.error("Failed to reject leave");
    }
  };

  const copyContent = () => {
    const text = document.getElementById("leaveTable").outerHTML;
    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const printContent = () => {
    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write("<html><head><title>Leave Records</title></head><body>");
    printWindow.document.write(document.getElementById("leaveTable").outerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  const filteredRequests = leaveRequests.filter((item) =>
    item.facultyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Requested Leave Records</h2>

      <Card className="mb-4">
        <FormLabel className="flex justify-between items-center p-4">
          <FormControl
            placeholder="Search by Faculty Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-1/3"
          />
          <div>
            <Button onClick={copyContent} className="mr-2">Copy</Button>
            <Button onClick={printContent}>Print</Button>
          </div>
        </FormLabel>
      </Card>

      <Card>
        <div className="p-4 overflow-auto">
          <table className="min-w-full border text-sm" id="leaveTable">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Faculty Name</th>
                <th className="border p-2">Leave Type</th>
                <th className="border p-2">Leave For</th>
                <th className="border p-2">From Date</th>
                <th className="border p-2">To Date</th>
                <th className="border p-2">Description</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr key={req._id}>
                    <td className="border p-2">{req.facultyName}</td>
                    <td className="border p-2">{req.leaveType}</td>
                    <td className="border p-2">{req.leaveFor}</td>
                    <td className="border p-2">{req.fromDate}</td>
                    <td className="border p-2">{req.toDate}</td>
                    <td className="border p-2">{req.description}</td>
                    <td className="border p-2">{req.status}</td>
                    <td className="border p-2">
                      {req.status === "Pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleApprove(req._id)}>
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReject(req._id)}>
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="border p-2 text-center" colSpan="8">No Leave Requests Found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default RequestedLeaveRecords;
