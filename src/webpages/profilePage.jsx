import React from "react"
import {Taskbar} from "../components/taskbar"
import  Profile from "../Profile"
import FitnessStatsInput from "./fitnessStatsInput";
import "./profile.css";

export const ProfilePage = ( {session, supabase} ) => {
    return(
        <>
        <div>
            <h1>PROFILE PAGE</h1>
        </div>
        <div className="profileLayout">
        <Profile session={session} supabase={supabase}/>
        <FitnessStatsInput session={session} supabase={supabase}/>
        </div>
        <Taskbar></Taskbar>

        </>

    )
}