const nodemailer = require("nodemailer");

const getTransporter = () => {
    const user = (process.env.YAHOO_USER || "").trim();
    const pass = (process.env.YAHOO_APP_PASSWORD || "").trim();

    if (!user || !pass) {
        throw new Error("Yahoo email credentials are missing in environment variables");
    }

    return nodemailer.createTransport({
        host: "smtp.mail.yahoo.com",
        port: 465,
        secure: true,
        auth: { user, pass },
    });
};

const sendApplicationEmail = async (studentEmail, internshipTitle, status) => {
    try {
        const isAccepted = status === "Accepted";
        const transporter = getTransporter();

        const mailOptions = {
            from: `"InternConnect" <${process.env.YAHOO_USER}>`,
            to: studentEmail,
            subject: isAccepted
                ? `Congratulations! Your Application for "${internshipTitle}" is Accepted`
                : `Application Update: "${internshipTitle}"`,
            html: isAccepted ? `
                <div style="font-family: Arial, sans-serif; max-width: 600px;">
                    <h2 style="color: #4CAF50;">Great News!</h2>
                    <p>Your application for <strong>${internshipTitle}</strong> has been <strong style="color: #4CAF50;">ACCEPTED</strong>!</p>
                    <p>Next steps:</p>
                    <ul>
                        <li>Log in to your InternConnect account</li>
                        <li>Check your applications section for company details</li>
                        <li>Prepare for your internship</li>
                    </ul>
                    <p style="color: #666; font-size: 12px; margin-top: 20px;">
                        Best regards,<br>InternConnect Team
                    </p>
                </div>
            ` : `
                <div style="font-family: Arial, sans-serif; max-width: 600px;">
                    <h2 style="color: #FF9800;">Application Update</h2>
                    <p>Your application for <strong>${internshipTitle}</strong> has been <strong style="color: #FF9800;">REJECTED</strong>.</p>
                    <p>Don't worry! Continue exploring other internship opportunities on our platform. Each application is a learning opportunity.</p>
                    <p style="color: #666; font-size: 12px; margin-top: 20px;">
                        Best regards,<br>InternConnect Team
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${studentEmail}`);
        return true;
    } catch (error) {
        console.error("Email sending failed:", error.message);
        return false;
    }
};

module.exports = { sendApplicationEmail };
