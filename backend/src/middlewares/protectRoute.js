import {requireAuth} from "@clerk/express"
import User from "../models/User.js"

export const protectRoute = [
requireAuth(),
async(req,res,next)=>{
    try{
        const clerkId = req.Auth().userId;

        if(!clerkId){
            return res.status(401).json({msg:"Unauthorized invalid Token"})
        }
        //find user in db by clerkid this from where we are setting up value for user 
        const user = await User.findOne({clerkId});
        if(!user){
            return res.status(404).json({msg:"User not Found"})
        }
        //attach user to request
        req.user = user;
        next();
    }catch(error){
        console.error("Error in protectRoute Middleware:" ,error);
        res.status(500).json({msg:"Internal Server Error"});
    }
}

]