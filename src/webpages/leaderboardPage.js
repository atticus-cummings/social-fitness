import { Taskbar } from "../components/taskbar";
import React, { useState } from 'react';
export default function LeaderBoard({ supabase, session }) {
    return(
        <div>
        <div>Leaderboard</div>
        <Taskbar/>
        </div>
    )
}