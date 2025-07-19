import nodemailer from "nodemailer";

export const sendmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_TRAP_SMTP_HOST,
      port: MAIL_TRAP_SMTP_PORT,
      secure: false,
      auth: {
        user: MAIL_TRAP_SMTP_USER,
        pass: MAIL_TRAP_SMTP_PASSWORD
      }
    });

    const info = await transporter.sendMail({
      from: '"Inngest TSM',
      to,
      subject,
      text,// HTML body
    });

    console.log("Message sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
