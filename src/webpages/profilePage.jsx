import React from "react"
import {Taskbar} from "../components/taskbar"
import  Profile from "../Profile"

export const ProfilePage = ( {session, supabase} ) => {
    return(
        <>
        <div>
            <h1>PROFILE PAGE</h1>
        </div>
        <Profile session={session} supabase={supabase}/>
        <Taskbar></Taskbar>
        </>

    )
}