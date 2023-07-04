const PDFDocument = require('pdfkit');
const fs = require('fs');

const createPDF = (outputPath) => {
    // Create a new PDFDocument
    const doc = new PDFDocument();

    // Create a write stream for the PDF
    const writeStream = fs.createWriteStream(outputPath);

    // Pipe the PDFDocument to the write stream
    doc.pipe(writeStream);

    // Add content and styles to the PDF
    doc.font('Helvetica-Bold').fontSize(24).text('My PDF Document', { align: 'center' });

    // Add an image to the PDF
    doc.image('public/images/logo.jpg', { width: 200, align: 'center' });

    // Add a table to the PDF
    const table = {
        headers: ['Column 1', 'Column 2'],
        rows: [
            ['Row 1, Column 1', 'Row 1, Column 2'],
            ['Row 2, Column 1', 'Row 2, Column 2'],
        ],
        cellPadding: 10,
    };

    doc.moveDown().font('Helvetica-Bold').fontSize(16).text('Table', { align: 'center' });

    // Calculate column widths
    const columnWidth = doc.page.width / table.headers.length;

    // Draw table headers
    table.headers.forEach((header, columnIndex) => {
        doc.font('Helvetica-Bold').fontSize(12).text(header, columnIndex * columnWidth, doc.y);
    });

    // Draw table rows
    table.rows.forEach((row) => {
        row.forEach((cell, columnIndex) => {
            doc.font('Helvetica').fontSize(12).text(cell, columnIndex * columnWidth, doc.y);
        });
        doc.moveDown();
    });

    // Finalize the PDF and close the write stream
    doc.end();
    writeStream.on('finish', () => {
        console.log('PDF created successfully.');
    });
};

const outputPath = '\pdf_file\\output.pdf';
createPDF(outputPath);
