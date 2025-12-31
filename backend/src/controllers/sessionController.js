import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";

export async function createSession(req,res){
    try{
        const {problem,difficulty} = req.body;
        const userId = req.user._id;// here user is coming from protectRoute where we defined req.user
        const clerkId = req.user.clerkId;

        if(!problem || !difficulty){
            return res.status(400).json({msg:"Problem and Difficulty are required"});
        }

        //generate a unique call id for stream video
        const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        //create the session in the database
        const session = await Session.create({
            problem,
            difficulty,
            host:userId,
            callId,
        });

        //create stream video call
        await streamClient.video.call("default",callId).getOrCreate({
            data:{
                created_by_id: clerkId,
                custom: { problem, difficulty, sessionId:session._id.toString()}
            }
        });

        //Chat messaging
        const channel = chatClient.channel("messaging",callId,{
            name:`${problem} session`,
            created_by_id:clerkId,
            members:[clerkId],
        });
        await channel.create();
        res.status(201).json({session});
    }catch(error){
        console.log("Error in createSession Controller",error.message);
        res.status(500).json({msg:"Internal Server Error"});

    }
}




export async function getActiveSessions(req,res){
    try{
        const sessions = await Session.find({status:"active"}).
        populate("host","name profileImage email clerkId").
        sort({created_At:-1}).
        limit(20);

        res.status(200).json({sessions});
    }catch(error){
        console.log("Error in getActiveSessions Controller",error.message);
        res.status(500).json({msg:"Internal Server Error"});
    }
}


export async function getMyRecentSessions(req,res){
    try{
        const userId = req.user._id;
     
        const sessions = await Session.find({
            status:"completed",
            $or:[ { host:userId } , { participant:userId } ]
        })
        .sort({created_At:-1})
        .limit(20);

        res.status(200).json({sessions});

    }catch(error){
        console.log("Error in getMyRecentSessions Controller",error.message);
        res.status(500).json({msg:"Internal Server Error"});
    }
}


export async function getSessionById(req,res){
    try{
        const {id} = req.params;
        const sessions = await Session.findById(id)
        .populate("host","name email profileImage clerkId")
        .populate("participant","name email profileImage clerkId");


        if(!sessions) {
            return res.status(404).json({msg:"Session not found"});
        }

        res.status(200).json({sessions});
    }catch(error){
        console.log("Error in getSessionById Controller",error.message);
        res.status(500).json({msg:"Internal Server Error"});
    }
}


export async function joinSession(req,res){
    try{
        //check if the session is already
        const {id} = req.params;
        const userId = req.user._id;
        const clerkId = req.user.clerkId;

        const session = await Session.findById(id);

        if(!session) return res.status(404).json({msg:"Session not found"});

        if(session.status !== "active"){
            return res.status(400).json({msg:"Cannot join a completed method"});
        }

        //you can either be host or participant
        if(session.host.toString() === userId.toString()){
            return res.status(400).json({msg:"Host cannot join their own session as participant"})
        }

        //check if the session is already
        if(session.participant) return res.status(409).json({msg:"Session is Full"});

        session.participant = userId;
        await session.save();
        // here session is coming from createsession
        const channel = chatClient.channel("messaging",session.callId);
        await channel.addMembers([clerkId]);

        res.status(200).json({session});

        
    }catch(error){
        console.log("Error in joinSession Controller",error.message);
        res.status(500).json({msg:"Internal Server Error"});
    }
}


export async function endSession(req,res){
    try{
        const {id} =  req.params;
        const userId = req.user._id;
        
        const session = await Session.findById(id);

        if(!session) return res.status(404).json({msg:"Session not found"});

        //check if user is the host
        if(session.host.toString() !== userId.toString()){
            return res.status(403).json({msg:"Only host can end the session"});
        }

        //check if session is already completed
        if(session.status === "completed"){
            return res.status(400).json({msg:"Session is already completed"});
        }

        //delete stream video call
        const call = streamClient.video.call("default",session.callId);
        await call.delete({hard:true});

        //delete stream chat channel
        const channel = chatClient.channel("messaging",session.callId);
        await channel.delete();

        session.status = "completed";
        await session.save();
        
        res.status(200).json({session,msg:"Session ended successfully"});

    }catch(error){
        console.log("Error in endSession Controller",error.message);
        res.status(500).json({msg:"Internal Server Error"});
    }
}