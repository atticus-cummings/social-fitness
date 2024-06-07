import "./taskbarStyles.css";
import React from "react";
import {Link} from "react-router-dom"
import Login from '../webpages/login'

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
                    <li className="navItem">
                    <button onClick={handleLogout}>Logout</button>
                    </li>

                </ul>
    </nav>;
};
