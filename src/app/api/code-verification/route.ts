import { z } from "zod";
import { UserModel } from "@/model/User";
import { verifySchema } from "@/schemas/verifySchema";
import { dbConnect } from "@/lib/dbConnect";

export async function POST(request: Request) {
  await dbConnect();

  try {
    // const { searchParams } = new URL(request.url);
    // const username = searchParams.get("username");
    const { username, code } = await request.json();
    const decodedUsername = decodeURIComponent(username);
    const queryParams = { code: code };
    const result = verifySchema.safeParse(queryParams);
    
    if (!result.success) {
      const verficationCodeErrors = result.error.format().code?._errors || [];
      console.log(verficationCodeErrors);
      return Response.json(
        {
          success: false,
          message:
            verficationCodeErrors.length > 0
              ? verficationCodeErrors.join(",")
              : "Some thing went wront in the result",
        },
        { status: 500 }
      );
    }

    const userFound = await UserModel.findOne({ username: decodedUsername });

    if (!userFound) {
      return Response.json(
        {
          success: false,
          message: "user not found",
        },
        {
          status: 400,
        }
      );
    }

    if (
      userFound.verifyCode !== code &&
      new Date(userFound.verifyCodeExpiry) > new Date()
    ) {
      return Response.json(
        {
          success: false,
          message: "verfication code missmatch or code got expired",
        },
        {
          status: 405,
        }
      );
    } else {
      await UserModel.updateOne(
        { username: decodedUsername },
        { $set: { isVerified: true } }
      );

      return Response.json(
        {
          success: true,
          message: "successfully verfiy",
        },
        {
          status: 200,
        }
      );
    }
  } catch (error) {
    console.log("Error verifing user", error);
    return Response.json(
      {
        success: false,
        message: "Error verifing user",
      },
      {
        status: 500,
      }
    );
  }
}
