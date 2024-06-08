import React, { useState } from 'react';
import useSWR from 'swr';
import 'react-photo-view/dist/react-photo-view.css';
import "../feed.css";
import "./post.css";
import { v4 as uuidv4 } from 'uuid';
import TimeAgo from './displayTimestamp';
import DisplayLikes from "./displayLikes";
import DisplayComments from "./displayComments";
import DisplayRPE from "./displayRPE";

export default function TextPostDisplay({ supabase, session, item, index, size }) {
    const [comment, setComment] = useState('');
    const userId = session.user_id

    //TODO: modify so it can only be liked once. 
    //TODO: Make it so new like-count displays (semi-optional)
    //Set comment value

    return (
        <div className='post' key={index} style={{width:size}}>
            <div className='postHeader'>
            <div className="username">
            <img src={item.userpfp} className='pfp'/>
                User: {item.username} 
                <TimeAgo timestamp={item.timestamp} />
            </div>
                <DisplayRPE className="rpe" item ={item}/>
            </div>
            <div className="postTitle">{item.title}</div>
            <div className="textPostCaption">{item.caption}</div>
            <DisplayLikes session={session} supabase={supabase} item={item} index={index} />
            <DisplayComments session={session} supabase={supabase} item={item} index={index} />
        </div>
    )
}