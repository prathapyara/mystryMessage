import { UserModel } from "@/model/User";
import { dbConnect } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";

export async function GET(request: Response) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const userId = new mongoose.Types.ObjectId(user?._id);

  console.log(userId);

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
    
    const userList = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      {
        $group: {
          _id: "$_id",
          messages: { $push: "$messages" },
        },
      },
    ]);

    if (!userList || userList.length === 0) {
      return Response.json({
        success: false,
        message: "user not found or no messages present",
      },{
        status:401
      });
    }

    return Response.json({
      success:true,
      messages:userList[0].messages
    },{
      status:200
    })
    
  } catch (error) {
    console.log("unable to fecth the user Messages",error);
    return Response.json(
      {
        success: false,
        message: "unable to fecth the user Messages",
      },
      {
        status: 500,
      }
    );
  }
}
