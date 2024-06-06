import "./taskbarStyles.css";
import React from "react";
import {Link} from "react-router-dom"
import Login from '../login'

export const Taskbar = () => {

    const handleLogout = () =>{
        localStorage.setItem("sessionData", '')
        window.location.reload();
    }
    return <nav>
                <ul className="navList">
                    <li className="navItem">
                    <Link to ="/">Home</Link>
                    </li>
                    <li className ="navItem">
                    <Link to ="/webpages/profile">Profile</Link>
                    </li>
                    <li className ="navItem">
                    <Link to ="/webpages/followers">Followers</Link>
                    </li>
                    <li className ="navItem">
                    <Link to ="/webpages/leaderboard">Leaderboard</Link>
                    </li>
                    <li className="navItem">
                    <Link to ="/webpages/upload">Upload</Link>
                    </li>
                    <li>
                        <button id="navItem" className="navItem" onClick={handleLogout}>Logout</button>
                    </li>

                </ul>
    </nav>;
};
