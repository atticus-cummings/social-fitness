import "./taskbarStyles.css";
import React from "react";
import {Link} from "react-router-dom"
// 

export const Taskbar = () => {
    return <nav>
                <ul>
                    <li>
                    <Link to ="/">Home</Link>
                    </li>
                    <li>
                    <Link to ="./webpages/profile">Profile</Link>
                    </li>
                    <li>
                    <Link to ="./webpages/followers">Followers</Link>
                    </li>
                    <li>
                    <Link to ="./webpages/upload">Upload</Link>
                    </li>
                </ul>
    </nav>;
};
