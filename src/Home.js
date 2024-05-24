import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { createClient } from '@supabase/supabase-js';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import PhotoViewer from './PhotoViewer';

const supabase = createClient('https://lrklhdizqhzzuqntsdnn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxya2xoZGl6cWh6enVxbnRzZG5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU0ODI3MTUsImV4cCI6MjAzMTA1ODcxNX0.KZNvqVyxzqePjb9OTlQUIKwf5922oCLXSHDc_YqA87M')

export default function Home() {
    //console.log(JSON.stringify(supabase))
    
    const [signedURL, setSignedURL] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [images, setImages] = useState([]);

    const user = supabase.auth.getUser()

    const userId = user.id

    const {data} = useSWR(`image-${userId}`,
        async() => await fetchSignedURL()
    );

    async function fetchSignedURL() {
        const { data, error } = await supabase
            .storage
            .from('media')
            .createSignedUrl('test-image.jpeg', 60); // Adjust file name and expiry time as needed
        if (data) {
            setSignedURL(data.signedUrl);
            setImages([JSON.stringify(data.signedUrl)]);
            return data;
        } else {
            return error;
        }
    }
    const handleFileUpload = async (event) => {
        const file = event.target.files[0]; 
        if (!file) return; 
        setSelectedFile(file);
    }

    const handleSubmit = async () => {
        if (!selectedFile) return;
        await uploadFile(selectedFile);
    }
    
    async function uploadFile(file) {
        const { data, error } = await supabase.storage.from('media').upload(file.name, file);
        if (error) {
            console.error('Error uploading file:', error.message);
        } else {
            console.log("File Upload Successful");
        }
    }
    console.log("data:", data)
    return (
        <div>
            <label>
                File Upload: <input type="file" name="fileUpload" onChange={handleFileUpload} />
            </label>
            <br></br>
            <button onClick={handleSubmit}>Submit</button>
            <PhotoProvider>
                <PhotoView src={signedURL} />
                <br></br>
                <img src={signedURL} alt="Uploaded Image" width="468" />
            </PhotoProvider>
        </div>
    );
}
