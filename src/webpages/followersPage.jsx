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
    const [file, setFile] = useState('')
    const [ppUrl, setppUrl] = useState('')

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
        //based on the users search query, search the database for any users with a given user_name
        try{
            const { data: searchedUser, error: searchError } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', searchQuery)
                .throwOnError()
                //console.log(searchedUser)
            setSearchedUserID(searchedUser[0].id)
            console.log(searchedUserID)
            setSearchedUserName(searchQuery)

        } catch (searchError) {
            console.error("Error in searching the user:", searchError);
            //if its null, just set it to the empty string 
            setSearchedUserID("")
        }
        //if the user exists, get their profile picture (pp) :)
        if (searchedUserID != ""){
            console.log("HERE:", searchedUserID)
            const {data: ppFile, error: ppurlError} = await supabase
                .from('avatars')
                .select('file_name')
                .eq('user_id', searchedUserID)
                .throwOnError()
            if (ppFile.length === 0) {
                //The user has no profile photo !
                setFile('default.png')
            }
            else{
                console.log(ppFile)
                setFile(ppFile[0].file_name);
                console.log("HERE", ppFile[0].file_name)
            }
        }
        console.log("FILE:", file); 
        if (file){
            const { data: ppUrl, error: ppUrlError } = await supabase
                .storage
                .from('media')
                .createSignedUrl(`/avatars/${file}`, 60) 
            setppUrl(ppUrl.signedUrl)
        }
        console.log("PPURL:", ppUrl);
    }

    //document.getElementById("myBtn").addEventListener("click", searchUser); 

    const handleInputChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        //console.log("Search query:", searchQuery);
        searchUser();
    };
    //console.log(searchedUserID)
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
                {searchedUserID.length === 0 ? <>No Data to Show</> : searchedUserID}
                <img src={ppUrl} alt="" width="auto" ></img>
            </div>
        </>
    );
}
