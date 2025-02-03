import nodemailer from "nodemailer";
import env from "@/env";

// For production
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//       user: env.GOOGLE_APP_SENDER_EMAIL,
//       pass: env.GOOGLE_APP_PASSWORD,
//   },
// });


const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'freddy24@ethereal.email',
      pass: 'QgAK6cMc5ymV47kBH1'
  }
});


export const sendVerificationEmail = async (baseUrl: string, email: string, code: string, entityType: 'employee' | 'company') => {
  const verificationLink = entityType === 'employee'
  ? `${baseUrl}/api/employee/verify?email=${email}&code=${code}`
  : `${baseUrl}/api/company/verify?email=${email}&code=${code}`;


    const info = await transporter.sendMail({
        from: env.GOOGLE_APP_SENDER_EMAIL,
        to: email,
        subject: "Please verify your email",
        text: `Click the following link to verify your email: ${baseUrl}/verify-email?code=${code}`,
        html: `
        <body style="margin: 0; padding: 0; background-color: #333; background-image: linear-gradient(to bottom, #333, #000); color: #fff; border-radius: 10px;">
          <div style="max-width: 600px; margin: 20px auto; padding: 20px; padding-top: 30px; padding-bottom:30px;">
            <p style="font-family: Arial, sans-serif; font-size: 18px; line-height: 1.6;">Thank you for signing up in Sweeft Node Company! Please verify your email by clicking the button below:</p>
            <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background: linear-gradient(to bottom, #ff9f45, #ff784f); color: #fff; text-decoration: none; border-radius: 5px;">Verify your email</a>
          </div>
        </body>
        `,
    });

    return info.response.split(' ')[0] === '250';
};