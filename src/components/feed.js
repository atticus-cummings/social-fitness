import React, { useState } from 'react';
import useSWR from 'swr';
import 'react-photo-view/dist/react-photo-view.css';
import "./feed.css"

import DefaultPostDisplay from "./defaultPostDisplay";
import TextPostDisplay from "./textPostDisplay";



export default function Feed({ supabase, session }) {
    const [comment, setComment] = useState('');
    const userId = session.user.id
    //get the current user id

    console.log("USER ID:", userId)

    //on certain events (not all), the homepage feed will update in real time 
    const { data, mutate } = useSWR(`image-${userId}`,
        async () => await fetchData()
    );
    //gets all the data needed for a relevant feed

    //Increment like 



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
                .eq('id', userId)
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
                .select('post_id, comment_text, author_id, created_at')
                .in('post_id', ids)
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
                    rpe:item.rpe_value,
                    post_type: item.post_type,
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
                <div>
                    {item.post_type === 1 && <DefaultPostDisplay session={session} supabase={supabase} item={item} index={index} />}
                    {item.post_type === 2 && <TextPostDisplay session={session} supabase={supabase} item={item} index={index} />}
                </div>
            ))}
        </div>
    );
}
//need to implement comment display option 