import React, { useState } from "react";
import { Taskbar } from "../components/taskbar";
import useSWR from 'swr';
import "./followersPage.css"

export default function Followers({ supabase, session }) {
    const userId = session.user.id;

    const [followers, setFollowers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const { data, mutate } = useSWR(`follower-${userId}`, fetchData);

    async function fetchData() {
        try {
            const { data: followingUserIds } = await supabase
                .from('followers')
                .select('following_user_id')
                .eq('user_id', userId)
                .throwOnError();

            setFollowers(followingUserIds);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }
    async function searchUser() {
        try{
            const { data: searchedUser, error: searchError } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', searchQuery)
                .throwOnError()
                console.log(searchedUser)
        } catch (searchError) {
            console.error("Error in searching the user:", searchError);
        }

    }
    const handleInputChange = (event) => {
        setSearchQuery(event.target.value);
        searchUser();
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("Search query:", searchQuery);
    };

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
            <div id="search-container">
                <form onSubmit={handleSubmit}>
                    <div id="search">
                        <input
                            id="searchbar"
                            type="search"
                            placeholder="&#x1F50D; Enter username"
                            value={searchQuery}
                            onChange={handleInputChange}
                        />
                        <button type="submit">Submit</button>
                    </div>
                </form>
            </div>
        </>
    );
}
