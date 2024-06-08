import React, { useEffect, useState } from 'react';
import 'react-photo-view/dist/react-photo-view.css';
import Feed from './components/feed';
import {Taskbar} from "./components/taskbar";
import {Header} from "./components/header";


export default function Home({supabase, session}) {

    //get the current user id
    let userId;
    if (session){
        userId = session.user_id
    }
    console.log("USER ID:", userId)

    return (
        <div>
            <Header/>
            <Taskbar/>
            <Feed session={session} supabase={supabase} />

        </div>
    );
}
