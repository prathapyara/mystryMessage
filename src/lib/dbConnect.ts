import { config } from "dotenv";
import mongoose from "mongoose";

config();

type connectionObject={
    isConnected?:number
}

const connection: connectionObject = {
};

export const dbConnect = async (): Promise<void> => {
  if (connection.isConnected) {
    console.log("db is already connected");
    return;
  }
  try {
    const mongodburl = process.env.MONGODB_URL;
    const db=await mongoose.connect(mongodburl || "",{});
    connection.isConnected=db.connections[0].readyState;
    console.log("mongodb is connected sucessfully");
  } catch (err) {
    console.log("Error while connecting to db",err);
    process.exit(1);
  }
};
