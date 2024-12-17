"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { messageSchema } from "@/schemas/messageSchema";
import { useParams } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { ApiResponse } from "@/types/ApiResponse";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";


const sendMessage = () => {
  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const {toast}=useToast();

  const { username } = useParams();

  const onSubmit =async (data:z.infer<typeof messageSchema>) => {
    try {
        const response=await axios.post<ApiResponse>("/api/send-message",{
            content:data.content,
            username
        })

        if(response.data.success){
          
          toast({
            title:"Message Sent",
            description:"Message has been send successfully"
          })

        }
    } catch (error) {
        console.log(error)
    }
  };

  const suggestMessage=async()=>{
    try {
      console.log("iam here...")
      //this api is not working as we need to pay the bill for using the open ai
      const response=await axios.post<ApiResponse>("/api/suggest-message");
      console.log(response);

      //if response is getting then we can do the further processing 
      
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded-smw-full max-w-6xl">
        <h1 className="text-4xl font-bold mb-4">Public Profile link</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-1xl">
                    Send anonymous message to @{username}{" "}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Type your message here."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    please enter the message that you want to send
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-center">
              <Button type="submit">
                Send Message
              </Button>
            </div>
          </form>
        </Form>
        <div className="flex flex-col justify-center align-items">
          <Button style={{ width: "fit-content" }} className="mt-7 w-auto" onClick={suggestMessage}>
            Suggest Messages
          </Button>
          <span className=" text-gray-700 mt-2">
            click on any message below to select it
          </span>
        </div>
      </div>
    </>
  );
};

export default sendMessage;
