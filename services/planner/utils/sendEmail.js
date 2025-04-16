const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const sendEmail = async ({ to, subject, html, text }) => {
    try {
        // Load environment variables
        const {
            SMTP_HOST,
            SMTP_PORT,
            SMTP_USER,
            SMTP_PASS,
            FROM_EMAIL,
            NODE_ENV
        } = process.env;

        // Fallback logic for missing ENV vars
        if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !FROM_EMAIL) {
            throw new Error('Missing required SMTP environment variables.');
        }

        // Configure transporter based on environment
        let transporter;
        if (NODE_ENV === 'production') {
            transporter = nodemailer.createTransport({
                host: SMTP_HOST,
                port: SMTP_PORT,
                secure: SMTP_PORT == 465, // true for 465, false for other ports
                auth: {
                    user: SMTP_USER,
                    pass: SMTP_PASS,
                },
            });
        } else {
            // Use Ethereal for development
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        }

        // Email options
        const mailOptions = {
            from: FROM_EMAIL,
            to,
            subject,
            html,
            text,
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        if (NODE_ENV !== 'production') {
            console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
        }

        console.log('Email sent: ' + info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendEmail;