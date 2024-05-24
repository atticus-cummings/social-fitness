import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { createClient } from '@supabase/supabase-js';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import PhotoViewer from './PhotoViewer';
import { v4 as uuidv4 } from 'uuid';



export default function Home({supabase, session}) {
    // useEffect(() => {
    //     supabase.auth.getSession().then((session) => {
    //       console.log("HERE:", session)
    //     });
    //   }, [])
    // const supabase = createClient(
    //     'https://lrklhdizqhzzuqntsdnn.supabase.co', 
    //     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxya2xoZGl6cWh6enVxbnRzZG5uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNTQ4MjcxNSwiZXhwIjoyMDMxMDU4NzE1fQ.-ezHc7WAEJ7QGZdILEXIYwN9omfm60Lxu2nX7BWNjo',
    //     {
    //     auth: { persistSession: false },
    //     },
    //     );
    const userId = session.user.id
    console.log("USER ID:", userId)
    const [signedURL, setSignedURL] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [images, setImages] = useState([]);

    // const user = supabase.auth.getSession()
    // const userId = user.id
    // console.log("HERE!!!!!", user)
    // console.log(userId)

    console.log(JSON.stringify(supabase.auth))
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
        const file_id = uuidv4();

        const { data, error } = await supabase.storage
            .from('media')
            .upload(file_id, file);

        if (error) {
            console.error('Error uploading file:', error.message);
        } else {
            console.log("File Upload Successful");
        }
        
        const variable = await supabase
            .from('file_upload_metadata')
            .insert({ id: file_id, user_id: userId})
            .throwOnError()
        console.log(`${userId} \nvariable ${JSON.stringify(variable)}`)

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
