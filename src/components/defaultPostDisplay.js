import React, { useState } from 'react';
import useSWR from 'swr';
import 'react-photo-view/dist/react-photo-view.css';
import "./feed.css";
import { v4 as uuidv4 } from 'uuid';
import { FaDumbbell } from "react-icons/fa";

export default function DefaultPostDisplay({ supabase, session, item, index}) {
    const [comment, setComment] = useState('');
    const userId = session.user.id
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

    return(
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
    )
}