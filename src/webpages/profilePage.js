import {Taskbar} from "../components/taskbar"
import FitnessStatsInput from "./fitnessStatsInput";
import "./profile.css";
import React, { useState, useEffect } from 'react';
import useSWR from 'swr';

import FetchPostData from "../fetchPostData";
import DefaultPostDisplay from "../components/postDisplays/defaultPostDisplay";
import TextPostDisplay from "../components/postDisplays/textPostDisplay";

export const ProfilePage = ( {session, supabase} ) => {
  const [email, setEmail] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const userId = session.user.id;

  useEffect(() => {
    if (session && session.user) {
      setCurrentEmail(session.user.email);
      setProfileUrl(session.user.user_metadata.avatar_url || '');
      // Fetch and set the current username
      getUserName();
    }
  }, [session]);

  const { data, mutate } = useSWR(`image-${userId}`,
    async () => await fetchData()
  );

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const updateEmail = async () => {
    const { user, error } = await supabase.auth.updateUser({
      email: email
    });
    if (error) {
      setMessage('Failed to update email: ' + error.message);
    } else {
      setMessage('Email updated successfully. Please check your inbox to verify your new email.');
      setCurrentEmail(email);
    }
  };

  const updateUsername = async () => {
    setLoading(true);
    setMessage('');

    const { data, error } = await supabase
      .from('profiles')
      .update({ username: username })
      .match({ id: userId });
    console.log("USERNAME:", username)
    if (error) {
      setMessage(`Failed to update username: ${error.message}`);
    } else {
      setMessage('Username updated successfully!');
      setCurrentUsername(username);
    }
    setLoading(false);
  };

  async function getUserName() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();
      if (error) {
        console.error('Error fetching username:', error.message);
        setCurrentUsername('No username set');
      } else {
        setCurrentUsername(data.username || 'No username set');
      }
    } catch (error) {
      console.error('Error fetching username:', error.message);
      setCurrentUsername('No username set');
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    if (session) {
      updateUsername();
    } else {
      setMessage('No user is logged in.');
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    setMessage('Uploading image...');
    let { error: uploadError, data: uploadData } = await supabase
      .storage
      .from('media')
      .upload(filePath, file, { upsert: true, });

    if (uploadError) {
      setMessage('Failed to upload image: ' + uploadError.message);
      console.error(uploadError)
      return;
    }

    const { publicURL, error: urlError } = await supabase.storage.from('media').getPublicUrl(filePath);

    if (urlError) {
      setMessage('Failed to get image URL: ' + urlError.message);
      return;
    }

    setProfileUrl(publicURL);
    setMessage('Profile image updated successfully.');

    await supabase.auth.updateUser({
      data: { avatar_url: publicURL }
    });
    await supabase.auth.refreshSession();

    const {data, error: fileNameError} = await supabase
      .from('avatars')
      .upsert({user_id: userId, file_name: fileName})
      .throwOnError()
  };

  async function fetchData() {
    const { data: file_name, error: fileError } = await supabase
      .from('avatars')
      .select('file_name') 
      .throwOnError()
    if (file_name){
      const { data, error } = await supabase
        .storage
        .from('media')
        .createSignedUrl(`/avatars/${file_name[0].file_name}`, 60) 
        setProfileUrl(data.signedUrl)
    }
    fetchFitnessStats();
  }

  async function fetchFitnessStats() {
    try {
        const { data: followingUserIdsData, error: followingError } = await supabase //this puts it in the format necessary for the FetchPostData function.
        //--is a bit of a pain. Might want to change later 
            .from('followers')
            .select('user_id')
            .eq('user_id', userId);
        console.log("following users", followingUserIdsData)
        if (followingError) throw followingError;

        const followingUserIds = followingUserIdsData.map(user => user.user_id);
        followingUserIds.push(userId);

        /*              From feed.js                */
        // Fetch all the UUIDs of users the current user is following
        /* #####################    Fetch User's Following List  ##################### */

        // Fetch file metadata
        /* #####################    Fetch User's Liked Post list  ##################### */
            const combinedData = await FetchPostData(session,supabase,followingUserIds)
            console.log("Combined Data:", combinedData);
            setShowProfile(true);
            setProfileData(combinedData);
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

  return (
    <div className="profile">
      <h2>Update Profile</h2>
      <p>Current Email: {currentEmail}</p>
      <div>
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="Enter new email"
        />
        <button onClick={updateEmail}>Update Email</button>
      </div>
      <h2>Update Username</h2>
      <p>Current Username: {currentUsername}</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={handleUsernameChange}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !username.trim()}>
          Update Username
        </button>
      </form>
      {profileUrl && (
        <div>
          <img src={profileUrl} alt="Profile" style={{ width: '100px', height: '100px' }} />
          <p>Profile image uploaded successfully!</p>
        </div>
      )}
      <div>
        <input type="file" onChange={handleFileChange} />
        {previewUrl && (
          <div>
            <img src={previewUrl} alt="Preview" style={{ width: '100px', height: '100px' }} />
            <p>Preview image selected!</p>
          </div>
        )}
      </div>
      {message && <p>{message}</p>}
      <FitnessStatsInput session={session} supabase={supabase}/>

      {profileData === null ? <>You have no data to show!</> : profileData?.map((item, index) => (
                <div>
                    <>posts</>
                    {item.post_type === 1 && <DefaultPostDisplay session={session} supabase={supabase} item={item} index={index} />}
                    {item.post_type === 2 && <TextPostDisplay session={session} supabase={supabase} item={item} index={index} />}
                </div>
            ))}
      <Taskbar></Taskbar>
      
    </div>
  );
}




/*export const ProfilePage = ( {session, supabase} ) => {
    return(
        <>
        <div>
            <h1>PROFILE PAGE</h1>
        </div>
        <div className="profileLayout">
        <Profile session={session} supabase={supabase}/>

        <FitnessStatsInput session={session} supabase={supabase}/>
        </div>
        <Taskbar></Taskbar>

        </>

    )
}*/
