// How do I make the first letter of a string uppercase in JavaScript

export function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

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



// export const copyContent = (headerFields, rowsData) => {
//     const headers = headerFields.join("\t");
//     const rows = rowsData.join("\n");
//     const fullData = `${headers}\n${rows}`;

//     navigator.clipboard.writeText(fullData)
//         .then(() => alert("Copied to clipboard!"))
//         .catch(() => alert("Failed to copy table data to clipboard."));
// };

// export const printContent = async (tableHeaders, tableRows) => {
//     const { jsPDF } = await import("jspdf");
//     const autoTable = (await import("jspdf-autotable")).default;

//     const doc = new jsPDF();
    

//     autoTable(doc, {
//       head: tableHeaders,
//       body: tableRows,
//       theme: "grid",
//       styles: { fontSize: 10 },
//       headStyles: { fillColor: [41, 128, 185] },
//     });

//     // Open the print dialog instead of directly downloading
//     const pdfBlob = doc.output("blob");
//     const pdfUrl = URL.createObjectURL(pdfBlob);
//     const printWindow = window.open(pdfUrl);
//     printWindow.onload = () => {
//       printWindow.print();
//     };
//   };

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