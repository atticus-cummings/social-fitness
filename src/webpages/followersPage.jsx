import React from "react"
import {Taskbar} from "../components/taskbar"
import SearchBar from 'react-search-bar';
import useSWR from 'swr';

export default function Followers({supabase, session}) {

    const userId = session.user.id

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

        followingUserIds.push(userId)
    
        console.log("followingUserIds:", followingUserIds);
    }

    return(
        <>
        <div>
            <h1>YOU HAVE NO FOLLOWERS, LOSER </h1>
            <Taskbar></Taskbar>
        </div>
        </>
    )
}