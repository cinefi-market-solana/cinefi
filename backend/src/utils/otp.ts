import crypto from "crypto";
import { env } from "../config/env";
import { Resend } from "resend";

export function generateOtp(length = 6): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i += 1) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

export function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function sendEmail(email: string, otp: string) {
  const resend = new Resend(env.RESEND_API_KEY);
  const emailHtml = createOtpEmailHtml(otp);

  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: email,
    subject: "Your CineFi Verification Code",
    html: emailHtml,
  });
}

function createOtpEmailHtml(otp: string): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CineFi - OTP Verification</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background-color: #141414;
        color: #ffffff;
        line-height: 1.6;
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      .email-container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #141414;
        padding: 40px 20px;
      }
      .email-wrapper {
        background-color: #1f1f1f;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
      }
      .header-section {
        background-color: #E50914;
        padding: 32px 40px;
        text-align: center;
        border-radius: 16px 16px 0 0;
      }
      .header-section h1 {
        font-size: 28px;
        font-weight: 700;
        color: #ffffff;
        margin: 0;
        letter-spacing: -0.5px;
      }
      .body-section {
        padding: 48px 40px;
        background-color: #1f1f1f;
      }
      .greeting {
        font-size: 16px;
        color: #ffffff;
        margin-bottom: 16px;
      }
      .instruction {
        font-size: 15px;
        color: #cccccc;
        margin-bottom: 32px;
        line-height: 1.5;
      }
      .otp-box {
        background-color: #2a2a2a;
        border-radius: 12px;
        padding: 32px 24px;
        margin: 32px 0;
        text-align: center;
        border: 1px solid #333333;
      }
      .otp-code {
        font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
        font-size: 36px;
        font-weight: 700;
        color: #E50914;
        letter-spacing: 6px;
        user-select: all;
        -webkit-user-select: all;
        line-height: 1.2;
      }
      .warning-text {
        font-size: 14px;
        color: #cccccc;
        margin: 32px 0 16px 0;
        line-height: 1.6;
      }
      .warning-text strong {
        color: #ffffff;
        font-weight: 600;
      }
      .ignore-text {
        font-size: 14px;
        color: #999999;
        margin: 16px 0 0 0;
        line-height: 1.5;
      }
      .thank-you {
        font-size: 15px;
        color: #ffffff;
        margin-top: 32px;
        font-weight: 500;
      }
      .footer-section {
        background-color: #111111;
        padding: 28px 40px;
        text-align: center;
        font-size: 12px;
        color: #777777;
        border-radius: 0 0 16px 16px;
      }
      .footer-section p {
        margin: 0;
      }
      @media only screen and (max-width: 600px) {
        .email-container {
          padding: 20px 16px;
        }
        .body-section {
          padding: 36px 24px;
        }
        .header-section {
          padding: 28px 24px;
        }
        .header-section h1 {
          font-size: 24px;
        }
        .otp-code {
          font-size: 32px;
          letter-spacing: 5px;
        }
        .footer-section {
          padding: 24px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="email-wrapper">
        <div class="header-section">
          <h1>CineFi</h1>
        </div>
        
        <div class="body-section">
          <div class="greeting">Hello,</div>
          
          <div class="instruction">
            Your One-Time Password (OTP) for account verification is:
          </div>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          
          <div class="warning-text">
            This OTP is valid for <strong>5 minutes</strong>. Please do not share this code with anyone.
          </div>
          
          <div class="ignore-text">
            If you didn't request this code, please ignore this email.
          </div>
          
          <div class="thank-you">
            Thanks for using CineFi.
          </div>
        </div>
        
        <div class="footer-section">
          <p>© ${new Date().getFullYear()} CineFi. All rights reserved.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
    `.trim();
}
