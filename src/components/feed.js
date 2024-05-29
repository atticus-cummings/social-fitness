import React from 'react';
import useSWR from 'swr';
import 'react-photo-view/dist/react-photo-view.css';
import "./feed.css"

export default function Feed({ supabase, session }) {
    //get the current user id
    const userId = session.user.id
    console.log("USER ID:", userId)

    //on certain events (not all), the homepage feed will update in real time 
    const { data, mutate } = useSWR(`image-${userId}`,
        async () => await fetchData()
    );
    //gets all the data needed for a relevant feed
    async function fetchData() {
        //gets all the uuids of all of a users following
        const { data: followingUserIdsData, error: followingError } = await supabase
            .from('followers')
            .select('following_user_id')
            .eq('user_id', userId)
        //           .sort() TODO
        if (followingError) throw followingError;


        const followingUserIds = followingUserIdsData.map(user => user.following_user_id);
        followingUserIds.push(userId);

        console.log("followingUserIds:", followingUserIds);
       
        //get file IDS
        const { data: fileIdArray, error: fileIdError} = await supabase
            .from('file_upload_metadata')
            .select('id')
            .in('user_id', followingUserIds)
    
        if(fileIdError) throw fileIdError;
         const ids = fileIdArray.map(file => file.id);

// get captions
        const { data: captionArray, error: captionError } = await supabase
            .from('file_upload_metadata')
            .select('id, caption_text')
            .in('id', ids)
   

        if (captionError) throw captionError;

        console.log("captions array: ", captionArray)

        const captionsMap = captionArray.reduce((map, item) => {
            map[item.id] = item.caption_text;
            return map;
        }, {});

        //get urls
        const { data, error: urlError } = await supabase
            .storage
            .from('media')
            .createSignedUrls(ids, 60); // Adjust file name and expiry time as needed

            if(urlError) throw urlError;

        console.log("Captions Map:", captionsMap);

        if (data) {
            const combinedData = data.map((file,index) => ({
                id: file.id,
                signedUrl: file.signedUrl,
                caption: captionsMap[[ids[index]]] || '',
            }));
            console.log("Combined Data:",combinedData);

            return combinedData;
        }
        else {
            return null;
        }
    }
    console.log("DATA HERE", data)
    return (
        <div className='socialFeed'>
            {data === null ? <>You have no data to show!</> : data?.map((item, index) => (
                <div className='post' key={index}>
                    <img src={item.signedUrl} style={{ width: '600px' } } className='center' />
                    <div className="caption">{item.caption}</div>
                </div>
            ))}
        </div>
    );
}