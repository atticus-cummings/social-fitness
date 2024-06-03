import React, { useState } from 'react';
import { FaDumbbell } from "react-icons/fa";
import useSWR from 'swr';
import "./post.css";

export default function DisplayLikes({session, supabase, item, index}) {
    const userId = session.id;
    const handleLike = async (likeCount, postId, liked, likedPostsArray) => {
        let updatedLikedArray;
        if (liked) {
            likeCount = likeCount - 1;
            updatedLikedArray = likedPostsArray.filter(id => id !== postId);
            console.log("Liked!");
        }
        else if (!liked) {
            likeCount = likeCount + 1;
            updatedLikedArray = [...likedPostsArray, postId];
            console.log("Removed Like :(");
        }
        await supabase
            .from('posts')
            .update({ like_count: likeCount })
            .eq('post_id', postId);
        await supabase
            .from('profiles')
            .update({ liked_post_id: updatedLikedArray })
            .eq('id', userId)
    }

    return(
    <div>
        <button className="likeButton" onClick={() => handleLike(item.likes, item.post_id, item.liked, item.likedPosts)}>
            <FaDumbbell style={{ fontSize: '24px'}} /> &nbsp; {item.likes === 0 ? 'Give this post a PUMP' : (item.likes > 0 && item.likes)}
        </button>
    </div>
    );
};