import { UserModel } from "@/model/User";
import { getServerSession } from "next-auth";
import { dbConnect } from "@/lib/dbConnect";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "User is not authenticated",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const userId = user?._id;
    const { acceptingMessageStatus } = await request.json();
    const userDetails = await UserModel.findByIdAndUpdate(
      { _id:userId },
      { $set: { isAcceptingMessage: acceptingMessageStatus } },
      { new: true }
    );

    if (!userDetails) {
      return Response.json(
        {
          success: false,
          message: "failed to update the user status to accepting messages",
        },
        {
          status: 401,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "isAccepting message status has been accepted",
      },
      {
        status: 200,
      }
    );
  } catch (err) {
    console.log("failed to update the user status to accepting messages", err);
    return Response.json(
      {
        success: false,
        message: "failed to update the user status to accepting messages",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const userId = user?._id;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "User is not authenticated",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const userDetails = await UserModel.findById({ _id:userId });
    if (!userDetails) {
      return Response.json(
        {
          success: false,
          message: "user not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        success: true,
        isAcceptingMessages: userDetails.isAcceptingMessage,
      },
      { status: 200 }
    );
  } catch (err) {
    console.log("Unable to fetch the isAccepting info", err);
    return Response.json(
      {
        success: false,
        message: "Unable to fetch the isAccepting info",
      },
      { status: 500 }
    );
  }
}
