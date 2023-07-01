const PDFDocument = require('pdfkit');
const fs = require('fs');
const internship = require('../models/internshipModel');
const {models} = require("mongoose");

// Function to generate the PDF form
function generateInternshipDetails(data) {
  // Create a new PDF document
  const doc = new PDFDocument();

  // Set the output file path
  const outputPath = '..\pdfFiles\report.pdf';

  // Pipe the PDF document to a writable stream
  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  // Set the content of the PDF form using the fetched data
  doc.font('Helvetica-Bold');
  doc.fontSize(16);
  doc.text('Internship Details', { align: 'center' });

  doc.font('Helvetica');
  doc.fontSize(12);
  doc.text(`Company Name: ${data.company_name}`);
  doc.text(`Company Address: ${data.company_address}`);
  doc.text(`Company Phone Number: ${data.company_ph_no}`);
  doc.text(`Current CGPA: ${data.current_cgpa}`);
  doc.text(`SIN/TIN/GST Number: ${data.sin_tin_gst_no}`);
  doc.text(`Industry Supervisor Name: ${data.industry_supervisor_name}`);
  doc.text(`Industry Supervisor Phone Number: ${data.industry_supervisor_ph_no}`);
  doc.text(`Mode of Internship: ${data.mode_of_intern}`);
  doc.text(`Starting Date: ${data.starting_date}`);
  doc.text(`Ending Date: ${data.ending_date}`);
  doc.text(`Days of Internship: ${data.days_of_internship}`);
  doc.text(`Location: ${data.location}`);
  doc.text(`Domain: ${data.domain}`);
  doc.text(`Offer Letter: ${data.offer_letter}`);
  doc.text(`Student ID: ${data.student_id}`);

  // Finalize the PDF document
  doc.end();
}



module.exports = {
  generateInternshipDetails
}
