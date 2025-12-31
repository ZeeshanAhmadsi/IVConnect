import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";

/**
 * Create a new session for a problem and difficulty, initialize its Stream video call and chat channel, and respond with the created session.
 *
 * Validates that `problem` and `difficulty` are provided in `req.body`. Uses `req.user` to set the session host and the chat/video creator, generates a unique callId, persists the Session, creates or retrieves the Stream video call with metadata, and creates a messaging channel with the creator as an initial member. Responds with 201 and the created session on success, 400 if required inputs are missing, and 500 on unexpected errors.
 */
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




/**
 * Retrieve up to 20 most recently created sessions with status "active" and send them in the response.
 *
 * Responds with a JSON object containing `sessions` on success; logs the error and responds with a 500 error on failure.
 */
export async function getActiveSessions(req,res){
    try{
        const sessions = await Session.find({status:"active"}).
        populate("host","name profileImage email clerkId").
        sort({createdAt:-1}).
        limit(20);

        res.status(200).json({sessions});
    }catch(error){
        console.log("Error in getActiveSessions Controller",error.message);
        res.status(500).json({msg:"Internal Server Error"});
    }
}


/**
 * Retrieve the requesting user's most recent completed sessions and return them in the response.
 *
 * Responds with status 200 and a JSON object `{ sessions }` containing up to 20 completed sessions
 * where the user is the host or participant, sorted by creation time descending.
 */
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


/**
 * Retrieve a session by its ID and return it with populated host and participant fields.
 *
 * Searches for a Session document matching req.params.id, populates the host and participant with
 * name, email, profileImage, and clerkId, then sends the session in the response body.
 * Responds with 200 and the session when found, 404 if no session exists with that ID, and 500
 * for internal server errors.
 */
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


/**
 * Add the requesting user as the participant of a session and add their clerk ID to the session's chat channel.
 * @param {object} req - Express request; expects `req.params.id` (session ID) and `req.user` with `_id` (user ID) and `clerkId`.
 * @param {object} res - Express response used to send HTTP status and JSON payloads.
 */
export async function joinSession(req,res){
    try{
        //check if the session is already
        const {id} = req.params;
        const userId = req.user._id;
        const clerkId = req.user.clerkId;

        const session = await Session.findById(id);

        if(!session) return res.status(404).json({msg:"Session not found"});

        //check if the session is already
        if(session.participant) return res.status(404).json({msg:"Session is Full"});

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


/**
 * End a host's active session and clean up its streaming and chat resources.
 *
 * Updates the session's status to "completed", persists the change, deletes the associated Stream video call and chat channel, and sends an HTTP response. Responds with 404 if the session doesn't exist, 403 if the requester is not the host, and 400 if the session is already completed.
 */
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

        session.status = "completed";
        await session.save();

        res.status(200).json({session,msg:"Session ended successfully"});

        //delete stream video call
        const call = streamClient.video.call("default",session.callId);
        await call.delete({hard:true});

        //delete stream chat channel
        const channel = chatClient.channel("messaging",session.callId);
        await channel.delete();

    }catch(error){
        console.log("Error in endSession Controller",error.message);
        res.status(500).json({msg:"Internal Server Error"});
    }
}