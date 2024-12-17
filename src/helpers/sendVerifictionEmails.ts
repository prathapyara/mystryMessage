import { resend } from "../lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "../types/ApiResponse";

export const sendVerificationEmail = async (
  username: string,
  verifyCode: string,
  email: string
): Promise<ApiResponse> => {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Mystry Verification code",
      react: VerificationEmail({ username, otp: verifyCode }),
    });
    return {
      success: true,
      message: "Email has been sent successfully",
    };
  } catch (err) {
    console.log("Error sending verification email", err);
    return {
        success:false,
        message:"Error has occured while sending the email"
    }
  }
};
