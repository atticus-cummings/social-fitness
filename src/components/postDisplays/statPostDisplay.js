import React, { useState } from 'react';
import useSWR from 'swr';
import 'react-photo-view/dist/react-photo-view.css';
import "../feed.css";
import "./post.css";
import { v4 as uuidv4 } from 'uuid';

import TimeAgo from "./displayTimestamp";
import DisplayLikes from "./displayLikes";
import DisplayComments from "./displayComments";
import DisplayRPE from "./displayRPE";
export default function StatPostDisplay({ session, supabase, item, index, size }) {
    const statMap = new Map();

    // Populate the map with display text for each stat
    statMap.set('bench', ['Max Bench', 'lbs']);
    statMap.set('deadlift', ['Max Deadlift', 'lbs']);
    statMap.set('mile_time', ['Mile Time', 'min']);
    statMap.set('pullups', ['Pullups', 'reps']);
    statMap.set('pushups', ['Pushups', 'reps']);
    statMap.set('weight', ['Weight', 'lbs']);
    statMap.set('height', ['Height', 'in']);

    const statsNames = item.stat_name;
    const statsValues = item.stat_value;
    const statsData = statsNames.map((name, idx) => ({
        statDisplay: statMap.get(name)[0],
        statUnit: statMap.get(name)[1],
        statVal: statsValues[idx],
    }));

    console.log("statsData", statsData);

    return (
        <div className='post' key={index} style={{ width: size }}>
            <div className="postHeader">
            <div className="username">
            <img src={item.userpfp} className='pfp'/>
                User: {item.username} 
                <TimeAgo timestamp={item.timestamp} />
            </div>
                <DisplayRPE className="rpe" item={item} />
            </div>
            <div className='fitnessStatsDisplay'>
                {statsData.map((stat, idx) => (
                    <div className='statItem' key={idx}>
                        <p>{stat.statDisplay}&nbsp;{stat.statVal}&nbsp;{stat.statUnit}</p>
                    </div>
                ))}
            </div>
            {(item.signedUrl && <img src={item.signedUrl} className='image' />)}
            <DisplayLikes session={session} supabase={supabase} item={item} index={index} />
            <div className="caption">{item.caption}</div>
            <DisplayComments session={session} supabase={supabase} item={item} index={index} />
        </div>
    )
}