import React, { useState } from 'react';
import useSWR from 'swr';
import 'react-photo-view/dist/react-photo-view.css';
import "./defaultPost.css";
import { v4 as uuidv4 } from 'uuid';


export default function DefaultPost({ supabase, session }) {
    const userId = session.user.id;
    console.log("USER ID:", userId);

    const [selectedFile, setSelectedFile] = useState(null);
    const [caption, setCaption] = useState('Write a caption...');
    //const { data, mutate } = useSWR(`image-${userId}`, async () => await fetchData());
    const [errorMessage, setErrorMessage] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 10000000) {
                setErrorMessage('Try a smaller file! (limit 10 MB)');
                setSelectedFile(null);
                return
            }
            setSelectedFile(file);
            setErrorMessage(''); // Clear any previous error messages

            const fileUrl = URL.createObjectURL(file);
            setPreviewUrl(fileUrl);
        }
    };

    const triggerFileInput = () => {
        document.getElementById('fileInput').click();
    };

    const handleCaptionInput = (event) => {
        setCaption(event.target.value);
    };

    const handleSubmit = async () => {
        if (selectedFile) {
            await uploadPost(selectedFile, caption);
        }
    };

    async function uploadPost(file, caption) {
        const file_id = uuidv4();
        const post_id = uuidv4();

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
            .insert({ id: file_id, post_id: post_id, user_id: userId, caption_text: caption})
            .throwOnError();
        await supabase
            .from('posts')
            .insert({ post_id: post_id, file_id: file_id, user_id: userId, post_type:1, caption_text: caption})
            .throwOnError();

        setSelectedFile(null);
        setCaption('');
    }


    return(
        <div className="inside">
        <div className="uploadContent">
            <button onClick={triggerFileInput}>
                Choose images to upload (PNG, JPG)
            </button>
            <input
                id="fileInput"
                hidden
                type="file"
                accept="image/*"
                name="fileUpload"
                onChange={handleFileUpload}
            />
            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
            {selectedFile && <div>Selected file: {selectedFile.name}</div>}
        </div>

        <br />
        <div className="imagePreview">
            {previewUrl && <img src={previewUrl} alt="Image Preview" style={{ maxHeight:"200px", marginTop: '10px' }} />}
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
        <div className="submitButton">
            <button onClick={handleSubmit}>Post</button>
        </div>
    </div>
    )
};