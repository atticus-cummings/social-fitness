import React, { useState } from 'react';
import { FaDumbbell } from "react-icons/fa";
import { FaFire } from "react-icons/fa6";
import { FaRegFaceSadTear } from "react-icons/fa6";
import { GiSpikyExplosion } from "react-icons/gi";
import useSWR from 'swr';
import "./post.css";

export default function DisplayRPE({item}) {
    return(
    <div>
        <div className="rpeDisplay">
            {item.rpe !== null && item.rpe < 4 && <><FaRegFaceSadTear/></>}
            {item.rpe !== null && item.rpe < 9 && item.rpe > 3 && <><FaFire/></>}
            {item.rpe !== null && item.rpe > 8 && <><GiSpikyExplosion/></>}
            {item.rpe !== null && item.rpe}
            
            </div>
    </div>
    );
};