import { UserModel } from "@/model/User";
import { z } from "zod";
import { userNameValidation } from "@/schemas/signUpSchema";
import { dbConnect } from "@/lib/dbConnect";

const checkUsernameValidationSchema = z.object({
  username: userNameValidation,
});


export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const queryParam = { username: searchParams.get("username") };
    const result = checkUsernameValidationSchema.safeParse(queryParam);
    if (!result.success) {
      const userNameErrors = result.error?.format().username?._errors || [];

      return Response.json(
        {
          success: true,
          message:
            userNameErrors.length > 0
              ? userNameErrors.join(",")
              : "Some thing went wront in the result",
        },
        { status: 500 }
      );
    }

    const userFoundVerified = await UserModel.findOne({
      username: queryParam.username,
      isVerified: true,
    });

    if (userFoundVerified) {
      return Response.json(
        {
          success: false,
          message: "username is already taken",
        },
        { status: 400 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "user is unique",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("username uniquee check has been failed", error);
    return Response.json(
      {
        success: false,
        message: "error checking the username",
      },
      {
        status: 500,
      }
    );
  }
}
