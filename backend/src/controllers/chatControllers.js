import { chatClient } from "../lib/stream.js";


/**
 * Generate a Stream Chat token for the authenticated user and send it with user details.
 * @param {import('express').Request} req - Express request; `req.user` must include `clerkId` (used for Stream), `name`, and `image`.
 * @param {import('express').Response} res - Express response used to send a 200 JSON payload containing `token`, `userId`, `userName`, and `userImage`, or a 500 error on failure.
 */
export async function getStreamToken(req,res){
    try{
        //use clerkId for stream (not monogdb_id) => it should match the id we have in the stream dashboard
        const token = chatClient.createToken(req.user.clerkId);
        res.status(200).json({
            token,
            userId: req.user.clerkId,
            userName: req.user.name,
            userImage: req.user.image,
        });
    }catch(error){
        console.error("Error in getstream token controller:",error.message);
        res.status(500).json({msg:"Internal server error"});
    }
}