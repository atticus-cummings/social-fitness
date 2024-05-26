import React, { useState } from 'react';
import useSWR from 'swr';
import 'react-photo-view/dist/react-photo-view.css';
import { Taskbar } from "../components/taskbar";
import "./uploadPage.css";
import { v4 as uuidv4 } from 'uuid';
import Home from "../Home";

export default function Upload({ supabase, session }) {
    const userId = session.user.id;
    console.log("USER ID:", userId);

    const [selectedFile, setSelectedFile] = useState(null);
    const [caption, setCaption] = useState('');

    const { data, mutate } = useSWR(`image-${userId}`, async () => await fetchData());

    async function fetchData() {
        const { data: followingUserIds } = await supabase
            .from('followers')
            .select('following_user_id')
            .eq('user_id', userId)
            .throwOnError();

        followingUserIds.push(userId);
        console.log("followingUserIds:", followingUserIds);

        const { data: fileIdArray } = await supabase
            .from('file_upload_metadata')
            .select('id')
            .in('user_id', followingUserIds)
            .throwOnError();

        const ids = fileIdArray.map(file => file.id);
        const { data, error } = await supabase
            .storage
            .from('media')
            .createSignedUrls(ids, 60); // Adjust file name and expiry time as needed

        if (data) {
            const signedURLs = data.map(item => item.signedUrl);
            return signedURLs;
        } else {
            return null;
        }
    }

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleCaptionInput = (event) => {
        setCaption(event.target.value);
    };

    const handleSubmit = async () => {
        if (selectedFile) {
            await uploadFile(selectedFile, caption);
        }
    };

    async function uploadFile(file, caption) {
        const file_id = uuidv4();
        const { data, error } = await supabase.storage
            .from('media')
            .upload(file_id, file, {
                contentType: file.type
            });

        if (error) {
            console.error('Error uploading file:', error.message);
            return;
        }

        console.log("File Upload Successful");

        await supabase
            .from('file_upload_metadata')
            .insert({ id: file_id, user_id: userId, caption_text: caption })
            .throwOnError();

        setSelectedFile(null);
        setCaption('');
        mutate();
    }

    console.log("DATA HERE", data);

    return (
        <div>
            <h1>Post your latest workout</h1>
            <div className="spacer"></div>
            <div className="inside">
                <div className="uploadContent">
                    <label>
                        File Upload: <input type="file" name="fileUpload" onChange={handleFileUpload} />
                    </label>
                </div>
                <div >
                    <textarea className="captionInput"
                        type="text"
                        id="textInput"
                        name="caption"
                        value={caption}
                        onChange={handleCaptionInput}
                    />
                </div>
                <br />
                <div className="submitButton">
                    <button onClick={handleSubmit}>Post</button>
                </div>
            </div>
            <Taskbar />
        </div>
    );
}
