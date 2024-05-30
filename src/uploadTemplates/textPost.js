import React, { useState } from 'react';
import useSWR from 'swr';
import 'react-photo-view/dist/react-photo-view.css';
import "./textPost.css";
import { v4 as uuidv4 } from 'uuid';


export default function TextPost({ supabase, session }) {
    const userId = session.user.id;
    console.log("USER ID:", userId);

    const [selectedFile, setSelectedFile] = useState(null);
    const [caption, setCaption] = useState('Write your post...');
    const [title, setTitle] = useState('Choose a title... ');
    //const { data, mutate } = useSWR(`image-${userId}`, async () => await fetchData());




    const triggerFileInput = () => {
        document.getElementById('fileInput').click();
    };

    const handleCaptionInput = (event) => {
        setCaption(event.target.value);
    };
    const handleTitleInput = (event) => {
        setTitle(event.target.value);
    };

    const handleSubmit = async () => {
        if (caption || title) {
            await uploadPost(title, caption);
        }
    };

    async function uploadPost(title, caption) {
        const post_id = uuidv4();
        await supabase
            .from('posts')
            .insert({ post_id: post_id, user_id: userId, post_type:2, caption_text: caption, title_text:title})
            .throwOnError();

        setSelectedFile(null);
        setCaption('');
        setTitle('')
    }


    return(
        <div className="inside">
        <div >
            <input
                className="textPostTitleInput"
                type="text"
                id="textInput"
                name="title"
                value={title}
                onChange={handleTitleInput}
            />
        </div>
        <div >
            <textarea className="textPostTextInput"
                type="text"
                id="textInput"
                name="caption"
                value={caption}
                onChange={handleCaptionInput}
            />
        </div>
        <div className="submitButton">
            <button onClick={handleSubmit}>Post</button>
        </div>
    </div>
    )
};