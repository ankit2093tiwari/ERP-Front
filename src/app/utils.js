//calculate toatal expected fee in one yaer for a seesion (used in fee dashboard)
import { getFeeStructures, getTotalStudentsCount } from "@/Services";
export const getExpectedYearlyFees = async () => {
    // Fetch total students
    const studentsRes = await getTotalStudentsCount();
    const totalStudents = studentsRes.data.totalStudents;

    // Fetch fee structures
    const feeRes = await getFeeStructures();
    const structures = feeRes.feeSettings;

    // Group totals by group_name
    const groupedTotals = structures.reduce((acc, item) => {
        const group = item.group_name.group_name;
        if (!acc[group]) acc[group] = 0;
        acc[group] += item.total_amount;
        return acc;
    }, {});

    // Calculate average
    const totalValues = Object.values(groupedTotals);
    const sum = totalValues.reduce((acc, val) => acc + val, 0);
    const average = totalValues.length > 0 ? sum / totalValues.length : 0;

    // Calculate total expected amount
    const totalExpectedAmount = totalStudents * average;

    return {
        totalStudents,
        average,
        totalExpectedAmount,
        groupedTotals
    };
};


export function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}


//copy and print table content
export const copyContent = (headerFields, rowsData) => {
    if (typeof window !== "undefined" && navigator.clipboard) {
        const headers = headerFields.join("\t");
        const rows = rowsData.join("\n");
        const fullData = `${headers}\n${rows}`;

        navigator.clipboard.writeText(fullData)
            .then(() => alert("Copied to clipboard!"))
            .catch(() => alert("Failed to copy table data to clipboard."));
    } else {
        console.error("Clipboard API not available in this environment.");
    }
};
export const printContent = async (tableHeaders, tableRows) => {
    if (typeof window === "undefined") return;  // Prevent server-side execution

    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    autoTable(doc, {
        head: tableHeaders,
        body: tableRows,
        theme: "grid",
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] },
    });

    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);

    const printWindow = window.open(pdfUrl);
    if (printWindow) {
        printWindow.onload = () => printWindow.print();
    } else {
        console.error("Popup blocked! Unable to open print window.");
    }
};


const arrOptions = [
    { value: 1, label: 'Hindi' },
    { value: 2, label: 'English' },
    { value: 3, label: 'Gujarati' },
    { value: 4, label: 'Marathi' },
    { value: 5, label: 'Bengali' },
    { value: 6, label: 'Kannada' },
    { value: 7, label: 'Malayalam' },
    { value: 8, label: 'Odia' },
    { value: 9, label: 'Sanskrit' },
    { value: 10, label: 'Tamil' },
    { value: 11, label: 'Telugu' },
    { value: 12, label: 'Urdu' }

]

export const motherTongueOptions = () => {
    return [
        { value: 1, label: 'Hindi' },
        { value: 2, label: 'English' },
        { value: 3, label: 'Gujarati' },
        { value: 4, label: 'Marathi' },
        { value: 5, label: 'Bengali' },
        { value: 6, label: 'Kannada' },
        { value: 7, label: 'Malayalam' },
        { value: 8, label: 'Odia' },
        { value: 9, label: 'Sanskrit' },
        { value: 10, label: 'Tamil' },
        { value: 11, label: 'Telugu' },
        { value: 12, label: 'Urdu' }
    ];
}
