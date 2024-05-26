

import React from 'react';
import useSWR from 'swr';
import 'react-photo-view/dist/react-photo-view.css';
import "./feed.css"

export default function Feed({ supabase, session }) {
    //get the current user id
    const userId = session.user.id
    console.log("USER ID:", userId)

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
    console.log("DATA HERE", data)
    return (
        <div>
            {data === null ? <>You have no data to show!</> :data?.map((item, index) => (
                    <div className='post'>
                    <img key={index}  src={item} style={{ width: '468px' }}/>
                    <p></p>
                    </div>
                ))}
        </div>
    );
}
