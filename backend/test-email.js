import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function main() {
  console.log('Testing SMTP connection with:', process.env.SMTP_USER);
  try {
    let info = await transporter.sendMail({
      from: `"Fameu App" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: "Test Email from Node.js",
      text: "Hello world?",
      html: "<b>Hello world?</b>",
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
main();
