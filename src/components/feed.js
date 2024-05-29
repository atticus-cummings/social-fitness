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
    const handleLike = async (likeCount, fileId, liked, likedPostsArray) => {
        let updatedLikedArray;
        if(liked){
            likeCount= likeCount -1;
            updatedLikedArray = likedPostsArray.filter(id => id !== fileId);
            console.log("Liked!");
        }
        else if(!liked){
            likeCount = likeCount + 1;
            updatedLikedArray =[...likedPostsArray, fileId]; 
            console.log("Removed Like :(");
        }
        await supabase
            .from('file_upload_metadata')
            .update({ like_count: likeCount })
            .eq('id', fileId);
        await supabase 
            .from('profiles')
            .update({liked_post_file_id:updatedLikedArray})
            .eq('id',userId)

        //TODO: modify so it can only be liked once. 
        //TODO: Make it so new like-count displays (semi-optional)
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
        setComment('');

    };


    async function fetchData() {
        try {
            // Fetch all the UUIDs of users the current user is following
/* #####################    Fetch User's Following List  ##################### */
            const { data: followingUserIdsData, error: followingError } = await supabase
                .from('followers')
                .select('following_user_id')
                .eq('user_id', userId);

            if (followingError) throw followingError;

            const followingUserIds = followingUserIdsData.map(user => user.following_user_id);
            followingUserIds.push(userId); // Include the current user
            // console.log("followingUserIds:", followingUserIds);

            // Fetch file metadata
/* #####################    Fetch User's Liked Post list  ##################### */ 
            const { data: likedPostsArray, error: likedPostsError } = await supabase
                .from('profiles')
                .select('liked_post_file_id')
                .eq('id',userId)
                const likedPosts = likedPostsArray.reduce((acc, item) => {
                    if (item.liked_post_file_id) {
                        return acc.concat(item.liked_post_file_id);
                    }
                    return acc;
                }, []);
            console.log("liked posts", likedPostsArray);

/* #####################    Fetch file Metadata  ##################### */ 
            const { data: fileMetadata, error: fileIdError } = await supabase
                .from('file_upload_metadata')
                .select('id, user_id, caption_text, like_count, created_at')
                .in('user_id', followingUserIds);

            if (fileIdError) throw fileIdError;
                //   console.log("Metadata:", fileMetadata)
            // Sort metadata by creation date (latest first)
            const sortedMetadata = fileMetadata.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                //  console.log("Sorted Metadata:", sortedMetadata);
/* =================    Define Array of File ids   ================= */ 
            const ids = sortedMetadata.map(item => item.id);
                // console.log("Ids:", ids);

            const fileIdUserIdMap = sortedMetadata.reduce((map, item) => {
                map[item.id] = item.user_id;
                return map;
            }, {});
                //  console.log("fileIdtoUserId", fileIdUserIdMap);

/* =================    Define Array of captions   ================= */  
            const captionsMap = sortedMetadata.reduce((map, item) => {
                map[item.id] = item.caption_text;
                return map;
            }, {});
            //  console.log("Captions Map:", captionsMap);

/* #####################    Fetch Usernames  ##################### */ 
            const [{ data: usernameArray, error: usernameError }] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('id, username, liked_post_file_id')
                    .in('id', followingUserIds)
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
                .select('file_id, comment_text, author_id')
                .in('file_id', ids)
            const commentsMap = {};
            for (const com of commentsArray) {
                const { file_id, comment_text, author_id } = com;
                const authorName = usernamesMap[author_id];
                if (!commentsMap[file_id]) {
                    commentsMap[file_id] = [];
                }
                commentsMap[file_id].push([comment_text, authorName]);
            }
            console.log("File-->comment map", commentsMap)


/* #####################    Fetch Signed URLS  ##################### */
            const { data: urlData, error: urlError } = await supabase
                .storage
                .from('media')
                .createSignedUrls(ids, 60);

            if (urlError) throw urlError;
            //format url data into map 
            if (urlData) {
                console.log("urlData", urlData);
                const urlMap = Object.fromEntries(urlData.map(item => [item.path, item.signedUrl]));
                  console.log("urlMap", urlMap);

/* #####################    Combine and Send Data  ##################### */
                const combinedData = sortedMetadata.map((item, index) => ({
                    id: item.id,
                    signedUrl: urlMap[item.id],
                    username: usernamesMap[item.user_id] || '',
                    caption: item.caption_text,
                    likes: item.like_count,
                    liked: likedPosts.includes(item.id),
                    comments: commentsMap[item.id] || [],
                    likedPosts: likedPosts || [],
                }));
                 console.log("Combined Data:", combinedData);
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
                    <button className="likeButton" onClick={() => handleLike(item.likes, item.id, item.liked, item.likedPosts)} ><FaDumbbell /> &nbsp; {item.likes}</button>
                    <div className="caption">{item.caption}</div>

                        {item.comments === null ? ( <>Be the first to comment!</>) : (item.comments.map((commentItem, commentIndex) => (
                            <div className="comment" key={commentIndex}>
                                <div>{commentItem[1]}: {commentItem[0]}</div> 

                            </div>
                            ))
                        )}
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