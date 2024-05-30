import React, { useState } from 'react';
import useSWR from 'swr';
import 'react-photo-view/dist/react-photo-view.css';
import "../feed.css";
import "./post.css";
import { v4 as uuidv4 } from 'uuid';

import TimeAgo from "./displayTimestamp";
import DisplayLikes from "./displayLikes";
import DisplayComments from "./displayComments"
export default function DefaultPostDisplay({ session,supabase, item, index }) {
    
    return (
        <div className='post' key={index}>
            <div className="postHeader">
            <div className="username">User: {item.username} <TimeAgo timestamp={item.timestamp} /></div>
            <div className="rpeDisplay">{item.rpe !== null && item.rpe}</div>
            </div>
            <img src={item.signedUrl} style={{ width: '600px' }} className='image' />
            <DisplayLikes session={session} supabase={supabase} item={item} index={index}/>
            <div className="caption">{item.caption}</div>
            <DisplayComments session={session} supabase={supabase} item={item} index={index}/>
        </div>
    )
}