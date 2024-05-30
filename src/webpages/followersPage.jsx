import React, { useState } from "react";
import { Taskbar } from "../components/taskbar";
import useSWR from 'swr';
import "./followersPage.css"

export default function Followers({ supabase, session }) {
    const userId = session.user.id;

    const [followers, setFollowers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchedUserID, setSearchedUserID] = useState('')
    const [searchedUserName, setSearchedUserName] = useState('')

    const { data, mutate } = useSWR(`follower-${userId}`, fetchData);

    //gets the users that are currently being followed
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

    //finds users by username
    async function searchUser() {
        try{
            const { data: searchedUser, error: searchError } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', searchQuery)
                .throwOnError()
                console.log(searchedUser)
            setSearchedUserID(searchedUser)
            setSearchedUserName(searchQuery)

        } catch (searchError) {
            console.error("Error in searching the user:", searchError);
        }
        if (searchedUserID != ""){
            console.log("HERE:", searchedUserID)
            const {data: ppUrl, error: ppurlError} = await supabase
                .from('avatars')
                .select('file_name')
                .eq('user_id', searchedUserID[0].id)
                .throwOnError()
            console.log("PPURL:", ppUrl)
        }
    }

    //document.getElementById("myBtn").addEventListener("click", searchUser); 

    const handleInputChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("Search query:", searchQuery);
        searchUser();
    };
    console.log(searchedUserID)
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
                        <button id="myBtn" type="submit">Submit</button>
                    </div>
                </form>
            </div>
            <div>
                {searchedUserID.length === 0 ? <>No Data to Show</> : searchedUserID[0].id}
            </div>
        </>
    );
}
