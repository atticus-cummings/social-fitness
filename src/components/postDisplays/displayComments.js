import React, { useState } from 'react';
import { FaDumbbell } from "react-icons/fa";
import useSWR from 'swr';
import "./post.css";
import TimeAgo from "./displayTimestamp"

export default function DisplayLikes({session, supabase, item, index}) {
    const [comment, setComment] = useState('');
    const userId = session.user.id
   
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
        <div>
            {item.comments === null ? (<>Be the first to comment!</>) : (item.comments.map((commentItem, commentIndex) => (
                <div className="comment" key={commentIndex}>
                    <div>{commentItem[1]}: {commentItem[0]} <TimeAgo timestamp={commentItem[2]} /></div>

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