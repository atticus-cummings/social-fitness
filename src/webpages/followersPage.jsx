import React, { useState } from "react";
import { Taskbar } from "../components/taskbar";
import SearchBar from 'react-search-bar';
import useSWR from 'swr';

export default function Followers({ supabase, session }) {
    const userId = session.user.id;
    const [followers, setFollowers] = useState([]);

    const { data, mutate } = useSWR(`follower-${userId}`, fetchData);

    async function fetchData() {
        try {
            const { data: followingUserIds } = await supabase
                .from('followers')
                .select('following_user_id')
                .eq('user_id', userId)
                .throwOnError();

            setFollowers(followingUserIds);
            //followingUserIds.push(userId);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    return (
        <>
            {followers.length === 0 ? (
                <>
                    <h1>YOU HAVE NO FOLLOWERS, LOSER</h1>
                    <Taskbar />
                </>
            ) : (
                <>
                    <h1>FOLLOWERS</h1>
                    <div>
                        {followers.map((elem, index) => (
                            <div key={index}>{elem}</div>
                        ))}
                    </div>
                    <Taskbar />
                </>
            )}
        </>
    );
}
