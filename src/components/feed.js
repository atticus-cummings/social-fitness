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
    const handleLike = async (likeCount, postId, liked, likedPostsArray) => {
        let updatedLikedArray;
        if(liked){
            likeCount= likeCount -1;
            updatedLikedArray = likedPostsArray.filter(id => id !== postId);
            console.log("Liked!");
        }
        else if(!liked){
            likeCount = likeCount + 1;
            updatedLikedArray =[...likedPostsArray, postId]; 
            console.log("Removed Like :(");
        }
        await supabase
            .from('posts')
            .update({ like_count: likeCount })
            .eq('post_id', postId);
        await supabase 
            .from('profiles')
            .update({liked_post_id:updatedLikedArray})
            .eq('id',userId)

        //TODO: modify so it can only be liked once. 
        //TODO: Make it so new like-count displays (semi-optional)
    }
    //Set comment value
    const handleCommentInput = (event) => {
        setComment(event.target.value);
    };

    //submit Comment to data base
    const handleCommentSubmit = async (post_id) => {
        if (comment) {
            await supabase
                .from('comments')
                .insert({ post_id: post_id, author_id: userId, comment_text: comment })
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
                .select('liked_post_id')
                .eq('id',userId)
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
                .select('post_id, file_id, user_id, caption_text, like_count, created_at')
                .in('user_id', followingUserIds);

            if (postMetadataError) throw postMetadataError;
                //   console.log("Metadata:", fileMetadata)
            // Sort metadata by creation date (latest first)
            const sortedMetadata = postMetadata.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                //  console.log("Sorted Metadata:", sortedMetadata);


/* =================    Define Array of Post ids   ================= */ 
            const ids = sortedMetadata.map(item => item.post_id);

            const postIdUserIdMap = sortedMetadata.reduce((map, item) => {
                map[item.post_id] = item.user_id;
                return map;
            }, {});

                //  console.log("fileIdtoUserId", fileIdUserIdMap);
                
            const postIdFileIdMap = sortedMetadata.reduce((map, item) => {
                map[item.post_id] = item.file_id;
                return map;
            }, {});

            const fileIds = sortedMetadata.map(item => item.file_id);
/* =================    Define Array of captions   ================= */  
            const captionsMap = sortedMetadata.reduce((map, item) => {
                map[item.post_id] = item.caption_text;
                return map;
            }, {});
            //  console.log("Captions Map:", captionsMap);

/* #####################    Fetch Usernames  ##################### */ 
            const [{ data: usernameArray, error: usernameError }] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('id, username, liked_post_id')
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
                .select('post_id, comment_text, author_id')
                .in('post_id', ids)
            const commentsMap = {};
            for (const com of commentsArray) {
                const { post_id, comment_text, author_id } = com;
                const authorName = usernamesMap[author_id];
                if (!commentsMap[post_id]) {
                    commentsMap[post_id] = [];
                }
                commentsMap[post_id].push([comment_text, authorName]);
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
                    likes: item.like_count,
                    liked: likedPosts.includes(item.post_id),
                    comments: commentsMap[item.post_id] || [],
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
                    <button className="likeButton" onClick={() => handleLike(item.likes, item.post_id, item.liked, item.likedPosts)} ><FaDumbbell /> &nbsp; {item.likes}</button>
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
                        <button className="postComment" onClick={() => handleCommentSubmit(item.post_id)}>Post Comment</button>
                    </div>
                  
                </div>
            ))}
        </div>
    );
}
//need to implement comment display option 