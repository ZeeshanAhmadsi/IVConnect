import express from "express";
import path from "path";
import cors from "cors";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import {serve} from "inngest/express"
import { inngest , functions } from "./lib/inngest.js";
import { clerkMiddleware } from '@clerk/express';

import chatRoutes from "./routes/chatRoutes.js";

const app = express();
const __dirname = path.resolve();

//middleware
app.use(express.json());
//credentials:true ??=> meaning server allows browser to include cookies on request
app.use(cors({origin:ENV.CLIENT_URL,credentials:true}));

app.use("/api/inngest",serve({client: inngest,functions}));
app.use("/api/chat",chatRoutes);
app.use(clerkMiddleware());// this add auth field to request object : req.auth()

app.get("/health",(req,res)=>{
    res.status(200).json({message:"api is up and running "});
});


//making our product ready for our deployment
if(ENV.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));
    app.get("/{*any}",(req,res)=>{
        res.sendFile(path.join(__dirname,"../frontend","dist","index.html"));
    });
}

const startServer = async () => {
    try{
        await connectDB();
        app.listen(ENV.PORT,() => { 
            console.log(`Listening to port ${ENV.PORT}`); 
        });
    }catch(error){
            console.error("Error in starting the server",error);
    }
}

startServer();