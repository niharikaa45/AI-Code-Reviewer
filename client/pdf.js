import jsPDF from "jspdf";

const downloadPDF = () => {
  const doc = new jsPDF();
  doc.text(JSON.stringify(review, null, 2), 10, 10);
  doc.save("review.pdf");
};