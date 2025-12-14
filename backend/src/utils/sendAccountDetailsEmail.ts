// utils/emailService.ts

import nodemailer from "nodemailer";

interface AccountDetails {
    employee_id: string;
    email: string;
    first_name: string;
    last_name: string;
    tempPassword: string; // The plain text password
}

// NOTE: Configure your SMTP transporter securely (e.g., using environment variables)
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "maddison53@ethereal.email",
    pass: "jn7jnAPss4f63QBp6D",
  },
});

export const sendAccountDetailsEmail = async (details: AccountDetails) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: details.email,
        subject: "Welcome to AeroStack! Your New Account Details",
        html: `
            <p>Dear ${details.first_name} ${details.last_name},</p>
            <p>Welcome to AeroStack! Your new payroll system account has been created.</p>
            
            <h3>Your Temporary Login Details:</h3>
            <ul>
                <li><strong>Employee ID:</strong> ${details.employee_id}</li>
                <li><strong>Temporary Password:</strong> <code>${details.tempPassword}</code></li>
            </ul>
            
            <p><strong>SECURITY WARNING:</strong> You are required to change this temporary password immediately upon your first login. You will be redirected to the change password page.</p>
            <p>Please log in here: <a href="YOUR_FRONTEND_LOGIN_URL">Login Portal</a></p>
            
            <p>If you have any issues, please contact HR.</p>
            <p>Thanks,<br>AeroStack HR Team</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Account details sent successfully to ${details.email}`);
    } catch (error) {
        console.error(`Failed to send email to ${details.email}:`, error);
        throw new Error("Email sending failed."); // Re-throw to be caught in the controller
    }
};