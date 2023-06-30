const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

// Create an OAuth2 client using your client credentials
const oAuth2Client = new OAuth2Client({
  clientId: '972145103272-dmn1oa6nlm06ik7pd5v4uh6c869ougva.apps.googleusercontent.com',
  clientSecret: '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',
  redirectUri: 'https://developers.google.com/oauthplayground',
});

// Set up the Gmail API
const gmail = google.gmail({
  version: 'v1',
  auth: oAuth2Client,
});

// Create a function to send an email
async function sendEmail(recipientEmail, subject, content) {
  try {
    // Get an access token for the OAuth2 client
    const { token } = await oAuth2Client.getAccessToken();

    // Create a nodemailer transporter using the Gmail API
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'padmapriyas.2004@gmail.com',
        clientId: '972145103272-dmn1oa6nlm06ik7pd5v4uh6c869ougva.apps.googleusercontent.com',
        clientSecret: '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',
        refreshToken: '1//04OrofRMe5t2ICgYIARAAGAQSNwF-L9IrISXPqmvB3a3jND3BQvxRfPncfss203WPjvHAl7S1c4u251lrI5JtmP5mZhOw5yMFTfE',
        accessToken: token,
      },
    });

    // Set up the email data
    const mailOptions = {
      from: 'padmapriyas.2004@gmail.com',
      to: recipientEmail,
      subject: subject,
      text: content,
    };

    // Send the email using the nodemailer transporter
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent:', result);
  } catch (err) {
    console.error('Error sending email:', err);
  }
}

module.exports = {
  sendEmail,
};
sendEmail('spmfp1357@gmail.com', 'Test Email', 'This is a test email.');

