import React from 'react';
import useSWR from 'swr';
import 'react-photo-view/dist/react-photo-view.css';
import "./feed.css"
import { FaDumbbell } from "react-icons/fa";
export default function Feed({ supabase, session }) {
    //get the current user id
    const userId = session.user.id
    console.log("USER ID:", userId)

    //on certain events (not all), the homepage feed will update in real time 
    const { data, mutate } = useSWR(`image-${userId}`,
        async () => await fetchData()
    );
    //gets all the data needed for a relevant feed

    const handleLike = async (likeCount, fileId) => { 
       likeCount = likeCount + 1;
        await supabase
            .from('file_upload_metadata')
            .update({ like_count: likeCount })
            .eq('id', fileId);
        //modify so it can only be liked once. 
        console.log("Liked!");
    }

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

    
            if (urlData) {
                console.log("urlData", urlData);
                const urlMap = urlData.reduce((map,item)=>{
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
                    <img src={item.signedUrl} style={{ width: '600px' } } className='center' />
                    <button className="likeButton" onClick={() => handleLike(item.likes, item.id)} ><FaDumbbell /> &nbsp; {item.likes}</button> 
                    <div className="caption">{item.caption}</div>
                </div>
            ))}
        </div>
    );
}

//'${item.id}', '${item.likes}'