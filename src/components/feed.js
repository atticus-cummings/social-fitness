import React, { useState, useEfect } from 'react';
import useSWR from 'swr';
import 'react-photo-view/dist/react-photo-view.css';
import "./feed.css"
import FetchPostData from "../fetchPostData";
import DefaultPostDisplay from "./postDisplays/defaultPostDisplay";
import TextPostDisplay from "./postDisplays/textPostDisplay";
import StatPostDisplay from "./postDisplays/statPostDisplay";



export default function Feed({ supabase, session }) {
    const [comment, setComment] = useState('');
    const userId = session.id
    //get the current user id

    console.log("USER ID:", userId)

    //on certain events (not all), the homepage feed will update in real time 
    const { data, mutate } = useSWR(`image-${userId}`,
        async () => await fetchData()
    );
    //gets all the data needed for a relevant feed

    //Increment like 



    async function fetchData() {
        try {
            // Fetch all the UUIDs of users the current user is following
            const { data: followingUserIdsData, error: followingError } = await supabase
                .from('followers')
                .select('following_user_id')
                .eq('user_id', userId);
            console.log("following users", followingUserIdsData)
            if (followingError) throw followingError;

            const followingUserIds = followingUserIdsData.map(user => user.following_user_id);
            followingUserIds.push(userId);

            const {data: showPublicData} = await supabase
                .from('profiles')
                .select('see_public')
                .eq('id', userId);
            console.log("showpublic", showPublicData);
            const showPublic = showPublicData[0]?.see_public;

            const { data: publicUsersData, error: publicError } = await supabase
                .from('public_account')
                .select('user_id');
            if (publicError) throw publicError;
            console.log("public users", publicUsersData);
            if(showPublic){
            publicUsersData.forEach(pubUser => {
                if (!followingUserIds.includes(pubUser.user_id)) {
                    followingUserIds.push(pubUser.user_id);
                }
            }
        );
        }

            // Fetch User's Liked Post list


            // Call the helper function
            const combinedData = await FetchPostData(session, supabase, followingUserIds);
            return combinedData;

        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    }

    // console.log("DATA HERE", data)
    return (
        <div className='socialFeed'>
            {data === null ? <>You have no data to show!</> : data?.map((item, index) => (
                <div>
                    {item.post_type === 1 && <DefaultPostDisplay session={session} supabase={supabase} item={item} index={index} size={'700px'} />}
                    {item.post_type === 2 && <TextPostDisplay session={session} supabase={supabase} item={item} index={index} size={'700px'} />}
                    {item.post_type === 3 && <StatPostDisplay session={session} supabase={supabase} item={item} index={index} size={'700px'} />}
                </div>
            ))}
        </div>
    );
}
//need to implement comment display option 