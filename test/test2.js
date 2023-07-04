const fs = require('fs');
const pdf = require('html-pdf');
const htmlContent = fs.readFileSync('C:\\Windows\\System32\\battery-report.html', 'utf-8');
const options = {
    format: 'A4',
    orientation: 'portrait',
    // border: {
    //     top: '1in',
    //     right: '1in',
    //     bottom: '1in',
    //     left: '1in'

    // },
};

pdf.create(htmlContent, options).toFile('\pdf_file\\test1.pdf', (err, res) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('PDF created successfully.');
});
