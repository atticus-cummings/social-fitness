import React, { useState, useEffect } from 'react';
import useSWR from 'swr';

export default function Followers({ supabase, session }) {
    const userId = session.user.id;

    const [followers, setFollowers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchedUserID, setSearchedUserID] = useState('');
    const [searchedUserName, setSearchedUserName] = useState('');
    const [file, setFile] = useState('');
    const [ppUrl, setPpUrl] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);

    const { data, mutate } = useSWR(`follower-${userId}`, fetchData);

    async function fetchData() {
        try {
            const { data: followingUserIds } = await supabase
                .from('followers')
                .select('following_user_id')
                .eq('user_id', userId)
                .throwOnError();

            setFollowers(followingUserIds.map(follow => follow.following_user_id));
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    async function searchUser() {
        try {
            const { data: searchedUser, error: searchError } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', searchQuery)
                .throwOnError();
            console.log(searchedUser)
            if (searchedUser.length === 0) {
                setSearchedUserID('');
                setSearchedUserName('');
                setFile('');
                setPpUrl('');
                setIsFollowing(false);
            } else {
                setSearchedUserID(searchedUser[0].id);
                setSearchedUserName(searchQuery);
                setIsFollowing(followers.includes(searchedUser[0].id));

                const { data: ppFile, error: ppFileError } = await supabase
                    .from('avatars')
                    .select('file_name')
                    .eq('user_id', searchedUser[0].id)
                    .throwOnError();

                if (ppFile.length === 0) {
                    setFile('default.png');
                    const { data: signedUrl, error: signedUrlError } = await supabase
                        .storage
                        .from('media')
                        .createSignedUrl(`/avatars/default.png`, 60);

                    if (signedUrlError) {
                        console.error("Error creating signed URL:", signedUrlError);
                    } else {
                        setPpUrl(signedUrl.signedUrl);
                    }
                } else {
                    setFile(ppFile[0].file_name);
                    const { data: signedUrl, error: signedUrlError } = await supabase
                        .storage
                        .from('media')
                        .createSignedUrl(`/avatars/${ppFile[0].file_name}`, 60);

                    if (signedUrlError) {
                        console.error("Error creating signed URL:", signedUrlError);
                    } else {
                        setPpUrl(signedUrl.signedUrl);
                    }
                }
            }
        } catch (error) {
            console.error("Error in searching the user:", error);
        }
    }

    async function toggleFollow() {
        try {
            if (isFollowing) {
                await supabase
                    .from('followers')
                    .delete()
                    .eq('user_id', userId)
                    .eq('following_user_id', searchedUserID)
                    .throwOnError();
            } else {
                await supabase
                    .from('followers')
                    .insert({ user_id: userId, following_user_id: searchedUserID })
                    .throwOnError();
            }
            setIsFollowing(!isFollowing);
            mutate();
        } catch (error) {
            console.error("Error in toggling follow:", error);
        }
    }

    useEffect(() => {
        console.log("PPURL:", ppUrl);
    }, [ppUrl]);

    const handleInputChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        searchUser();
    };

    return (
        <>
            {followers.length === 0 ? (
                <>
                    <h1>YOU HAVE NO FOLLOWERS, LOSER</h1>
                </>
            ) : (
                <>
                    <h1>FOLLOWERS</h1>
                    <div>
                        {followers.map((elem, index) => (
                            <div key={index}>{elem}</div>
                        ))}
                    </div>
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
            <div id="search-result">
                <div id="user-info">
                    <p> </p>
                    <img src={ppUrl} alt="" width="100" />
                    <div id="caption">
                        {searchedUserID.length === 0 ? <>No Data</> : searchedUserName}
                    </div>
                    {searchedUserID.length > 0 && (
                        <button onClick={toggleFollow}>
                            {isFollowing ? 'Unfollow' : 'Follow'}
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
