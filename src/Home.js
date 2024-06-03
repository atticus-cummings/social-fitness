import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { createClient } from '@supabase/supabase-js';
import 'react-photo-view/dist/react-photo-view.css';
import Feed from './components/feed';
import {Taskbar} from "./components/taskbar";
import {Header} from "./components/header";
import "./Home.css"

import { v4 as uuidv4 } from 'uuid';

export default function Home({supabase, session}) {

    //get the current user id
    const userId = session.id
    console.log("USER ID:", userId)


    const [selectedFile, setSelectedFile] = useState(null);
/*
    //on certain events (not all), the homepage feed will update in real time 
    const {data, mutate} = useSWR(`image-${userId}`,
        async() => await fetchData()
    );
    
    //gets all the data needed for a relevant feed
    async function fetchData() {
        //gets all the uuids of all of a users following
        const {data: followingUserIds} = await supabase
            .from('followers')
            .select('following_user_id')
            .eq('user_id', userId)
//           .sort() TODO
            .throwOnError();

        followingUserIds.push(userId)
    
        console.log("followingUserIds:", followingUserIds);
        const {data:fileIdArray} = await supabase
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
        } 
        else {
            return null;
            return error;
        }
    }
*/
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
            .upload(file_id, file, {
                contentType: file.contentType
            }
            );
        
        if (error) {
            console.error('Error uploading file:', error.message);
        } else {
            console.log("File Upload Successful");
        }
        
        const variable = await supabase
            .from('file_upload_metadata')
            .insert({ id: file_id, user_id: userId})
            .throwOnError()
        setSelectedFile(null)
        console.log("here")
        //mutate();
    }
  //  console.log("DATA HERE", data)
    return (
        <div>
            <Header/>
            <Taskbar/>

            <Feed session={session} supabase={supabase} />

        </div>
    );
}
