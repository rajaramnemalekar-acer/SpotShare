import nodemailer from 'nodemailer';

export const sendBrevoEmail = async ({ toEmail, toName, subject, htmlContent }) => {
  try {
    const smtpLogin = process.env.SMTP_LOGIN;
    const smtpKey = process.env.SMTP_KEY;
    const senderEmail = process.env.SENDER_EMAIL || 'rajaramnemalekar@gmail.com';

    if (!smtpLogin || !smtpKey) {
      console.warn('Brevo SMTP credentials missing in .env file.');
      return false;
    }

    // Configure SMTP transport using Brevo credentials
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // TLS
      auth: {
        user: smtpLogin,
        pass: smtpKey,
      },
    });

    const mailOptions = {
      from: `"SpotShare" <${senderEmail}>`,
      to: toEmail,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Brevo Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email via Brevo SMTP:', error.message);
    return false;
  }
};