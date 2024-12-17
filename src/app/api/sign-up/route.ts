import { dbConnect } from "@/lib/dbConnect";
import { UserModel } from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerifictionEmails";
import { ApiResponse } from "@/types/ApiResponse";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, email, password } = await request.json();
    const userFoundWithUsernameAndVerifed = await UserModel.findOne({
      username,
      isVerified: true,
    });
    const userFoundWithEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (userFoundWithUsernameAndVerifed) {
      return Response.json(
        {
          success: false,
          message: "User alreay present with the username and verified",
        },
        {
          status: 400,
        }
      );
    }

    if (userFoundWithEmail) {
      if (userFoundWithEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User exits and already verfied",
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        userFoundWithEmail.password = hashedPassword;
        userFoundWithEmail.verifyCode = verifyCode;
        userFoundWithEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await userFoundWithEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = await UserModel.create({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        messages: [],
      });
    }

    const emailResponse = await sendVerificationEmail(
      username,
      verifyCode,
      email
    );

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User registered successfully. Please verify your email",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Something went wrong", err);
    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      {
        status: 500,
      }
    );
  }
}
