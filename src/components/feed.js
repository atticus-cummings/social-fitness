import React, { useState } from 'react';
import useSWR from 'swr';
import 'react-photo-view/dist/react-photo-view.css';
import "./feed.css"
import { FaDumbbell } from "react-icons/fa";



export default function Feed({ supabase, session }) {
    const [comment, setComment] = useState('');

    //get the current user id
    const userId = session.user.id
    console.log("USER ID:", userId)

    //on certain events (not all), the homepage feed will update in real time 
    const { data, mutate } = useSWR(`image-${userId}`,
        async () => await fetchData()
    );
    //gets all the data needed for a relevant feed

    //Increment like 
    const handleLike = async (likeCount, fileId) => {
        likeCount = likeCount + 1;
        await supabase
            .from('file_upload_metadata')
            .update({ like_count: likeCount })
            .eq('id', fileId);
        //TODO: modify so it can only be liked once. 
        //TODO: Make it so new like-count displays (semi-optional)
        console.log("Liked!");
    }
    //Set comment value
    const handleCommentInput = (event) => {
        setComment(event.target.value);
    };

    //submit Comment to data base
    const handleCommentSubmit = async (fileId) => {
        if (comment) {
            await supabase
                .from('comments')
                .insert({ file_id: fileId, author_id: userId, comment_text: comment })
                .throwOnError();
        }
        setComment(null);
    };


    async function fetchData() {
        try {
            // Fetch all the UUIDs of users the current user is following
            const { data: followingUserIdsData, error: followingError } = await supabase
                .from('followers')
                .select('following_user_id')
                .eq('user_id', userId);

            if (followingError) throw followingError;

            const followingUserIds = followingUserIdsData.map(user => user.following_user_id);
            followingUserIds.push(userId); // Include the current user
            // console.log("followingUserIds:", followingUserIds);

            // Fetch file metadata
            const { data: fileMetadata, error: fileIdError } = await supabase
                .from('file_upload_metadata')
                .select('id, user_id, caption_text, like_count, created_at')
                .in('user_id', followingUserIds);

            if (fileIdError) throw fileIdError;
                //   console.log("Metadata:", fileMetadata);

            // Sort metadata by creation date (latest first)
            const sortedMetadata = fileMetadata.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                //  console.log("Sorted Metadata:", sortedMetadata);

            const ids = sortedMetadata.map(item => item.id);
                // console.log("Ids:", ids);

            const fileIdUserIdMap = sortedMetadata.reduce((map, item) => {
                map[item.id] = item.user_id;
                return map;
            }, {});
                //  console.log("fileIdtoUserId", fileIdUserIdMap);

            const captionsMap = sortedMetadata.reduce((map, item) => {
                map[item.id] = item.caption_text;
                return map;
            }, {});
            //  console.log("Captions Map:", captionsMap);

            // Fetch usernames
            const [{ data: usernameArray, error: usernameError }] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('id, username')
                    .in('id', followingUserIds)
            ]);

            if (usernameError) throw usernameError;

            const usernamesMap = usernameArray.reduce((map, item) => {
                map[item.id] = item.username;
                return map;
            }, {});
            //  console.log("Usernames:", usernamesMap);

            // Fetch signed URLs
            const { data: urlData, error: urlError } = await supabase
                .storage
                .from('media')
                .createSignedUrls(ids, 60);

            if (urlError) throw urlError;

            //format url data into map 
            if (urlData) {
                console.log("urlData", urlData);
                const urlMap = urlData.reduce((map, item) => {
                    map[item.path] = item.signedUrl;
                    return map;
                })
                //  console.log("urlMap", urlMap);

                const combinedData = sortedMetadata.map((item, index) => ({
                    id: item.id,
                    signedUrl: urlMap[item.id],
                    username: usernamesMap[item.user_id] || '',
                    caption: item.caption_text,
                    likes: item.like_count,
                }));
                // console.log("Combined Data:", combinedData);

                return combinedData;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    }

    // console.log("DATA HERE", data)
    return (
        <div className='socialFeed'>
            {data === null ? <>You have no data to show!</> : data?.map((item, index) => (
                <div className='post' key={index}>
                    <div className="username">User: {item.username}</div>
                    <img src={item.signedUrl} style={{ width: '600px' }} className='center' />
                    <button className="likeButton" onClick={() => handleLike(item.likes, item.id)} ><FaDumbbell /> &nbsp; {item.likes}</button>
                    <div className="caption">{item.caption}</div>
                    <div className='commentSubmission'>Comment: &nbsp;
                        <input className="commentInput"
                            type="text"
                            id="textInput"
                            name="comment"
                            value={comment}
                            onChange={handleCommentInput}
                        />
                          <button className="postComment" onClick={() => handleCommentSubmit(item.id)}>Post Comment</button>
                    </div>
                  
                </div>
            ))}
        </div>
    );
}
//need to implement comment display option 