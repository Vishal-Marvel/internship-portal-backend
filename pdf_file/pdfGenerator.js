const PDFDocument = require('pdfkit');
const fs = require('fs');
const mysql = require('mysql2');
const internship = require('../models/internshipModel');

// Function to generate the PDF form
function generatePDF(data) {
  // Create a new PDF document
  const doc = new PDFDocument();

  // Set the output file path
  const outputPath = 'C:\Users\padma\pdffiles\internship_detail.pdf';

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

// Fetch internship details from the "internships" table
internship.query('SELECT * FROM internship_portal.internships', (error, results) => {
  if (error) {
    console.error('Error fetching internship details:', error);
    return;
  }

  // Assuming you have only one internship record
  const internshipData = results[0];

  // Fetch student details from the "students" table
  internship.query('SELECT * FROM internship_portal.students', (error, results) => {
    if (error) {
      console.error('Error fetching student details:', error);
      return;
    }

    // Assuming you have only one student record
    const studentData = results[0];

    // Generate the PDF form with the fetched data
    generatePDF({
      company_name: internshipData.company_name,
      company_address: internshipData.company_address,
      company_ph_no: internshipData.company_ph_no,
      current_cgpa: studentData.current_cgpa,
      sin_tin_gst_no: internshipData.sin_tin_gst_no,
      industry_supervisor_name: internshipData.industry_supervisor_name,
      industry_supervisor_ph_no: internshipData.industry_supervisor_ph_no,
      mode_of_intern: internshipData.mode_of_intern,
      starting_date: internshipData.starting_date,
      ending_date: internshipData.ending_date,
      days_of_internship: internshipData.days_of_internship,
      location: internshipData.location,
      domain: internshipData.domain,
      offer_letter: internshipData.offer_letter,
      student_id: studentData.student_id,
    });
  });
});

// Close the database connection after generating the PDF
connection.end();

