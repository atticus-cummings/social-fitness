import React, { useState } from 'react';
import useSWR from 'swr';
import 'react-photo-view/dist/react-photo-view.css';
import "../feed.css";
import "./post.css";
import { v4 as uuidv4 } from 'uuid';
import TimeAgo from './displayTimestamp';
import DisplayLikes from "./displayLikes";
import DisplayComments from "./displayComments";

export default function TextPostDisplay({ supabase, session, item, index }) {
    const [comment, setComment] = useState('');
    const userId = session.user.id
    

        //TODO: modify so it can only be liked once. 
        //TODO: Make it so new like-count displays (semi-optional)
    //Set comment value


    return (
        <div className='post' key={index}>
            <div className='postHeader'>
                <div className="username">User: {item.username} <TimeAgo timestamp={item.timestamp} /></div>
                <div className="postTitle">{item.title}</div>
                <div className="rpeDisplay">{item.rpe !== null && item.rpe}</div>
            </div>


            <div className="textPostCaption">{item.caption}</div>
            <DisplayLikes session={session} supabase={supabase} item={item} index={index}/>
            <DisplayComments session={session} supabase={supabase} item={item} index={index}/>

        </div>
    )
}