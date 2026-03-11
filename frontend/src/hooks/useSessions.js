import { useQuery , useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { sessionApi } from "../api/sessions";

export const useCreateSessions = ()=>{
const result = useMutation({
    mutationKey: ["createSession"],
    mutationFn: (data) => sessionApi.createSession(data),
    onSuccess: () => toast.success("Session Created Successfully"),
    onError: (error) => toast.error(error.response?.data?.message || "Failed to Create a Room"),
});
return result;
}


export const useActiveSessions = ()=>{
const result = useQuery({
    queryKey: ["activeSessions"],
    queryFn: () => sessionApi.getActiveSessions(),
});

return result;
};


export const useMyRecentSessions = ()=>{
    const result = useQuery({
    queryKey: ["myRecentSessions"],
    queryFn: () => sessionApi.getMyRecentSessions(),
});

return result;
}


export const useSessionById = (id) =>{
const result = useQuery({
    queryKey: ["session",id],
    queryFn: () => sessionApi.getSessionById(id),
    enabled: !!id,
    refetchInterval: 5000, // refetch every 5 seconds to detect the session status changes 
});

return result;
}



export const useJoinSession = (id)=>{
const result = useMutation({
    mutationKey: ["joinSession"],
    mutationFn: () => sessionApi.joinSession(id),
    onSuccess: () => toast.success("Joined Session Successfully"),
    onError: (error) => toast.error(error.response?.data?.message || "Failed to Join the Room"),
 });
 return result;
}


export const useEndSession = (id)=>{
const result = useMutation({
    mutationKey:["endSession"],
    mutationFn: () => sessionApi.endSession(id),
    onSuccess: () => toast.success("Session ended Successfully"),
    onError: (error) => toast.error(error.response?.data?.message || "Failed to end a Room"),
});
return result;
}