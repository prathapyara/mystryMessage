import { Message, UserModel } from "@/model/User";
import { dbConnect } from "@/lib/dbConnect";
import { messageSchema } from "@/schemas/messageSchema";
import { MessageModel } from "@/model/User";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, content } = await request.json();

    const messageQuery = { content: content };
    const result = messageSchema.safeParse(messageQuery);
    
    if (!result.success) {
      const messageErrors = result.error.format().content?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            messageErrors.length > 0
              ? messageErrors.join(",")
              : "validation has been not met",
        },
        {
          status: 400,
        }
      );
    }
    const user = await UserModel.findOne({ username });
    if (!user || !user.isVerified) {
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

    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: "user is not ready to accept the messages",
        },
        {
          status: 403,
        }
      );
    }

    const messageData = { content, createdAt: new Date() };
    const updateResult = await UserModel.findOneAndUpdate(
      { username },
      { $push: { messages: messageData } },
      { new: true, projection: { messages: { $slice: -1 } } }
    );

    if (!updateResult) {
      return Response.json(
        {
          success: false,
          message: "Failed to update user's messages",
        },
        { status: 500 }
      );
    }

    const newMessage = updateResult.messages[0];
    const messageId = newMessage._id;

    await MessageModel.create({
      _id: messageId,
      content,
      createdAt: new Date(),
    });

    return Response.json(
      {
        success: true,
        message: "message as been sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("unable to send the message ", error);
    return Response.json(
      {
        success: false,
        message: "unable to send the message ",
      },
      {
        status: 500,
      }
    );
  }
}
