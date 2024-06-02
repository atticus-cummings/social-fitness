import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Taskbar } from "../components/taskbar";
import "./followersPage.css"

import DefaultPostDisplay from "../components/postDisplays/defaultPostDisplay";
import TextPostDisplay from "../components/postDisplays/textPostDisplay";

export default function Followers({ supabase, session }) {
    const userId = session.user.id;

    const [followers, setFollowers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchedUserID, setSearchedUserID] = useState('');
    const [searchedUserName, setSearchedUserName] = useState('');
    const [file, setFile] = useState('');
    const [ppUrl, setPpUrl] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [fitnessStats, setFitnessStats] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [username, setUsername] = useState([]);

    const { mutate } = useSWR(`follower-${userId}`, fetchData);


    async function fetchData() {
        try {
            const { data: followingUserIds } = await supabase
                .from('followers')
                .select('following_user_id')
                .eq('user_id', userId)
                .throwOnError();
            const { data: usernameArray, error: usernameError } = await supabase
                .from('profiles')
                .select('id, username')

            if (usernameError) throw usernameError;
            const usernamesMap = usernameArray.reduce((map, item) => {
                map[item.id] = item.username;
                return map;
            }, {});
            setUsername(usernamesMap);

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
                setShowProfile(false);
                setFitnessStats(null);
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



    async function fetchFitnessStats() {
        try {
            const { data: stats, error: statsError } = await supabase
                .from('fitness_stats')
                .select('*')
                .eq('user_id', searchedUserID)
                .single();
            if (statsError) throw statsError;
            setFitnessStats(stats);
            /*              From feed.js                */
            // Fetch all the UUIDs of users the current user is following
            /* #####################    Fetch User's Following List  ##################### */

            // Fetch file metadata
            /* #####################    Fetch User's Liked Post list  ##################### */
            console.log("searched userid", searchedUserID);
            const { data: likedPostsArray, error: likedPostsError } = await supabase
                .from('profiles')
                .select('liked_post_id')
                .eq('id', searchedUserID)
            
            if(likedPostsError) throw likedPostsError;
            const likedPosts = likedPostsArray.reduce((acc, item) => {
                if (item.liked_post_id) {
                    return acc.concat(item.liked_post_id);
                }
                return acc;
            }, []);
            console.log("liked posts", likedPostsArray);

            /* #####################    Fetch Post Metadata  ##################### */
            const { data: postMetadata, error: postMetadataError } = await supabase
                .from('posts')
                .select('post_id, file_id, user_id, caption_text, like_count, created_at, title_text, post_type, rpe_value')
                .eq('user_id', searchedUserID);

            if (postMetadataError) throw postMetadataError;
               console.log("Metadata:", postMetadata)
            // Sort metadata by creation date (latest first)
            const sortedMetadata = postMetadata.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            //  console.log("Sorted Metadata:", sortedMetadata);


            /* =================    Define Array of Post ids   ================= */
            const ids = sortedMetadata.map(item => item.post_id);

            const fileIds = sortedMetadata.map(item => item.file_id);
            //  console.log("Captions Map:", captionsMap);

            /* #####################    Fetch Usernames  ##################### */
            const [{ data: usernameArray, error: usernameError }] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('id, username, liked_post_id')
                    .eq('id', searchedUserID)
            ]);
            if (usernameError) throw usernameError;
            const usernamesMap = usernameArray.reduce((map, item) => {
                map[item.id] = item.username;
                return map;
            }, {});
            //  console.log("Usernames:", usernamesMap);

            /* #####################    Fetch Comments  ##################### */
            //Fetch Comments
            const { data: commentsArray, error: commentsError } = await supabase
                .from('comments')
                .select('post_id, comment_text, author_id, created_at')
                .in('post_id', ids)
            if (commentsError) throw commentsError;
            const commentsMap = {};
            for (const com of commentsArray) {
                const { post_id, comment_text, author_id, created_at } = com;
                const authorName = usernamesMap[author_id];
                if (!commentsMap[post_id]) {
                    commentsMap[post_id] = [];
                }
                commentsMap[post_id].push([comment_text, authorName, created_at]);
            }
            console.log("File-->comment map", commentsMap)

            /* #####################    Fetch Signed URLS  ##################### */
            const { data: urlData, error: urlError } = await supabase
                .storage
                .from('media')
                .createSignedUrls(fileIds, 60);

            if (urlError) throw urlError;
            //format url data into map 
            if (urlData) {
                console.log("urlData", urlData);
                const urlMap = Object.fromEntries(urlData.map(item => [item.path, item.signedUrl]));
                console.log("urlMap", urlMap);

                /* #####################    Combine and Send Data  ##################### */
                const combinedData = sortedMetadata.map((item, index) => ({
                    user_id: item.user_id,
                    post_id: item.post_id,
                    signedUrl: urlMap[item.file_id],
                    username: usernamesMap[item.user_id] || '',
                    caption: item.caption_text,
                    timestamp: item.created_at,
                    title: item.title_text,
                    rpe: item.rpe_value,
                    post_type: item.post_type,
                    likes: item.like_count,
                    liked: likedPosts.includes(item.post_id),
                    comments: commentsMap[item.post_id] || [],
                    likedPosts: likedPosts || [],
                }));
                console.log("Combined Data:", combinedData);
                setShowProfile(true);
                setProfileData(combinedData);
            } else {
                return;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    }
    /*      end of feed.js excerpt         */

    /*
                const { data: posts, error: postsError } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('user_id', searchedUserID)
                    .order('created_at', { ascending: false });
                if (postsError) throw postsError;
                setUserPosts(posts);
    
                setShowProfile(true);
            } catch (error) {
                console.error("Error fetching fitness stats or posts:", error);
            }
        }
    */
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
                            <div key={index}>{username[elem]}</div>
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
                        <>
                            <button onClick={toggleFollow}>
                                {isFollowing ? 'Unfollow' : 'Follow'}
                            </button>
                            {isFollowing && (
                                <button onClick={fetchFitnessStats}>
                                    View Profile
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
            {showProfile && fitnessStats && (
                <div id="profile">
                    <h2>Fitness Stats for {searchedUserName}</h2>
                    <p>Deadlift: {fitnessStats.deadlift[fitnessStats.deadlift.length - 1]}</p>
                    <p>Bench: {fitnessStats.bench[fitnessStats.bench.length - 1]}</p>
                    <p>Mile Time: {fitnessStats.mile_time[fitnessStats.mile_time.length - 1]}</p>
                    <p>Pushups: {fitnessStats.pushups[fitnessStats.pushups.length - 1]}</p>
                    <p>Pullups: {fitnessStats.pullups[fitnessStats.pullups.length - 1]}</p>
                    <p>Weight: {fitnessStats.weight[fitnessStats.weight.length - 1]}</p>
                    <p>Height: {fitnessStats.height[fitnessStats.height.length - 1]}</p>
                    <h2>Recent Posts by {searchedUserName}</h2>
                    {profileData === null ? <>You have no data to show!</> : profileData?.map((item, index) => (
                <div>
                    <>posts</>
                    {item.post_type === 1 && <DefaultPostDisplay session={session} supabase={supabase} item={item} index={index} />}
                    {item.post_type === 2 && <TextPostDisplay session={session} supabase={supabase} item={item} index={index} />}
                </div>
            ))}
                </div>
            )}
            <Taskbar />
        </>
    );
}


/*                        userPosts.map(post => (
                            <div key={post.post_id} className="post">
                                <h3>{post.title_text}</h3>
                                <p>{post.caption_text}</p>
                                <p>Likes: {post.like_count}</p>
                                <p>Posted on: {new Date(post.created_at).toLocaleString()}</p>
                            </div>
                        )) 
*/