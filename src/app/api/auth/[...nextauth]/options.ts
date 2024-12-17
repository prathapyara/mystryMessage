import { UserModel } from "@/model/User";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import {NextAuthOptions} from "next-auth";
import  CredentialsProvider  from "next-auth/providers/credentials";
import { dbConnect } from "@/lib/dbConnect";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect();
        try {
          const userFound = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier},
            ],
          });

          if (!userFound) {
            throw new Error(
              "No user found with given username or email please signup"
            );
          }

          if (!userFound.isVerified) {
            throw new Error("user found but not verified");
          }
      
          const isPasswordMatched = await bcrypt.compare(
            credentials.password,
            userFound.password
          );
          
          if (isPasswordMatched) {
            console.log(userFound);
            return userFound;
          } else {
            throw new Error("Password not matched");
          }
        } catch (error: any) {
          throw new Error(error);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.isVerified = user.isVerified;
        token.isAcceptingMessage = user.isAcceptingMessage;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isAcceptingMessage = token.isAcceptingMessage;
        session.user.isVerified = token.isVerified;
        session.user.username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
};
