const PDFDocument = require('pdfkit');
const fs = require('fs');

const outputPath = '\pdf_file\\report.pdf';

// Function to generate the PDF form
function generateInternshipDetails(internship, student) {

  const doc = new PDFDocument();
  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);
  const backgroundColor = '#FFFFFF'; // Light gray background color
  const logoPath = 'public/images/logo.jpg'; // Path to your logo image
  const tableCellPadding = 40; // Padding for table cells
  const pageHeight = doc.page.height;
  let tableY = 150;
// Define a helper function for table formatting
  const addTableRow = (label, value) => {
    if (tableY + tableCellPadding+100 > pageHeight) {
      doc.addPage();
      tableY = 100; // Reset Y position for the new page
    }
    doc.text(label, 100, tableY, { width: 200, align: 'left' });
    doc.text(value, 300, tableY, { width: 200, align: 'left' });

    tableY += tableCellPadding; // Increment y position after adding the row
  };
  doc.image(logoPath, 100, 25,  { width: 100, height: 100, align: 'center' });

  doc.font('Helvetica-Bold');
  doc.fontSize(16);
  doc.text('Internship Details', { align: 'center' });

  doc.moveDown(); // Add some vertical spacing

  doc.font('Helvetica');
  doc.fontSize(12);
  doc.fillColor('black');
  // doc.rect(0, 0, doc.page.width, doc.page.height).fill(backgroundColor); // Set background color

  // Add table rows with data and update tableY
  addTableRow('Student Name:', student.get('name'));
  addTableRow('Student Email:', student.get('email'));
  addTableRow('Student Department:', student.get('dept'));
  addTableRow('Academic Year:', internship.get('academic_year'));
  addTableRow('Current CGPA:', internship.get('current_cgpa'));
  addTableRow('Company Name:', internship.get('company_name'));
  addTableRow('Company Address:', internship.get('company_address'));
  addTableRow('Company Phone Number:', internship.get('company_ph_no'));
  addTableRow('SIN/TIN/GST Number:', internship.get('sin_tin_gst_no'));
  addTableRow('Industry Supervisor Name:', internship.get('industry_supervisor_name'));
  addTableRow('Industry Supervisor Phone Number:', internship.get('industry_supervisor_ph_no'));
  addTableRow('Mode of Internship:', internship.get('mode_of_intern'));
  addTableRow('Starting Date:', internship.get('starting_date'));
  addTableRow('Ending Date:', internship.get('ending_date'));
  // console.log(tableY);
  addTableRow('Days of Internship:', internship.get('days_of_internship'));
  addTableRow('Location:', internship.get('location'));
  addTableRow('Domain:', internship.get('domain'));
  // table.draw();

  doc.end();
  return doc;
}



module.exports = {
  generateInternshipDetails
}
