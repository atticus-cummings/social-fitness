import React, { useState } from 'react';
import useSWR from 'swr';
import 'react-photo-view/dist/react-photo-view.css';
import { Taskbar } from "../components/taskbar";
import "./uploadPage.css";
import { v4 as uuidv4 } from 'uuid';
import DefaultPost from "../uploadTemplates/defaultPost";
import WorkoutPost from "../uploadTemplates/workoutPost";
import TextPost from "../uploadTemplates/textPost";
import Home from "../Home";

export default function Upload({ supabase, session }) {
    const userId = session.user_id;
    const [selectedTemplate, setSelectedTemplate] = useState('image');
    console.log("USER ID:", userId);

    const handleTemplateChange = (event) => {
        setSelectedTemplate(event.target.value);
    };

    return (
        <div>
            <h1>Post your latest workout</h1>
            <div className="pageContent">
                <div className="spacer"></div>
                <label htmlFor="templates">Choose a template &nbsp;</label>
                <select name="templates" id="templates" onChange={handleTemplateChange} value={selectedTemplate}>
                    <option value="image">Post with Image</option>
                    <option value="workout">Workout Stats</option>
                    <option value="text">Text Post</option>
                </select>
                {selectedTemplate === 'image' && <DefaultPost session={session} supabase={supabase} />}
                {selectedTemplate === 'workout' && <WorkoutPost session={session} supabase={supabase} />}
                {selectedTemplate === 'text' && <TextPost session={session} supabase={supabase} />}
                <Taskbar />
            </div>
        </div>
    );
}
