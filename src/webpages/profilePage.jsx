import React from "react"
import {Taskbar} from "../components/taskbar"
import  Profile from "../Profile"

export const ProfilePage = () => {
    return(
        <>
        <div>
            <h1>PROFILE PAGE</h1>
        </div>
        <Profile></Profile>
        <Taskbar></Taskbar>
        </>

    )
}