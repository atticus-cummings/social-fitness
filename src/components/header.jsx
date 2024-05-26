
import "./headerStyles.css";
import logo from '../images/social-fitness-logo.jpg';
import React from "react"
export const Header = () => {
    return (
        <>
            <div className="Spacing"></div>
            <div classname="logo">
                <a href="#">
                    <img src={logo} alt="logo" className="logoImage" />
                </a>
            </div>
            <div className="Spacing"></div>
        </>
    )
}
