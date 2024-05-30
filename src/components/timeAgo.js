import React from 'react';
import { formatDistanceToNow, parseISO, isValid } from 'date-fns';
import "./feed.css";

export default function TimeAgo({ timestamp }) {

    if (!timestamp) {
        return <div>Invalid date</div>;
    }

    let relativeTime = 'Invalid date';
    try {
        const date = parseISO(timestamp);
        if (isValid(date)) {
            relativeTime = formatDistanceToNow(date, { addSuffix: true });
        }
    } catch (error) {
        console.error('Error parsing date:', error);
    }
    return (
        <div className="timestamp">
            &nbsp;{relativeTime}
        </div>
    );
};
