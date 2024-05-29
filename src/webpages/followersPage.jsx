import React from "react"
import {Taskbar} from "../components/taskbar"
import SearchBar from 'react-search-bar';
import useSWR from 'swr';
import { useState } from 'react';

export default function Followers({supabase, session}) {

    const userId = session.user.id
    const [followers, setFollowers] = useState([]);

    const {data, mutate} = useSWR(`follower-${userId}`,
        async() => await fetchData()
    );
    async function fetchData() {
        //gets all the uuids of all of a users following
        const {data: followingUserIds} = await supabase
            .from('followers')
            .select('following_user_id')
            .eq('user_id', userId)
//           .sort() TODO
            .throwOnError();

        //followingUserIds.push(userId)
    
        console.log("followingUserIds:", followingUserIds);
        setFollowers(followingUserIds);
    }

    return(
        <>
        <div>
            {followers.length === 0 ? <h1>YOU HAVE NO FOLLOWERS, LOSER </h1> : <span>hi</span>}
            <Taskbar></Taskbar>
        </div>
        </>
    )
}