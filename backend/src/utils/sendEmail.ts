import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

const sendEmail = async (options: EmailOptions) => {
  // 1. Create a transporter using environment variables
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    auth: {
      user: process.env.EMAIL_USER,
      pass: (process.env.EMAIL_PASSWORD || '').replace(/\s/g, ''),
    },
  });

  // 2. Define the email options
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    ...options,
  };

  // 3. Send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;