import { dbConnect } from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { Message, UserModel } from "@/model/User";
import { MessageModel } from "@/model/User";
import mongoose from "mongoose";

export async function DELETE(
  request: Request,
  context: { params: { messageId: string } }
) {
  await dbConnect();
   const { params } = context; 
   const messageId = params.messageId;
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;
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
   
    const response = await MessageModel.deleteOne({
      _id: new mongoose.Types.ObjectId(messageId),
    });
    console.log(response);
    
    const result = await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: new mongoose.Types.ObjectId(messageId) } } }
    );
    if (result.modifiedCount === 0) {
      return Response.json(
        {
          success: false,
          message: "Messages is not deleted",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Message has been deleted successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("Error is delete message route", error);
    return Response.json(
      {
        success: false,
        message: "An error occurred while deleting the message",
      },
      {
        status: 500,
      }
    );
  }
}
