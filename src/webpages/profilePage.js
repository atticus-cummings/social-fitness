import { Taskbar } from "../components/taskbar"
import FitnessStatsInput from "./fitnessStatsInput";
import "./profile.css";
import React, { useState, useEffect } from 'react';
import useSWR from 'swr';

import FetchPostData from "../fetchPostData";
import DefaultPostDisplay from "../components/postDisplays/defaultPostDisplay";
import TextPostDisplay from "../components/postDisplays/textPostDisplay";
import StatPostDisplay from "../components/postDisplays/statPostDisplay";

export const ProfilePage = ({ session, supabase }) => {
  const [email, setEmail] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(null);
  const [showPublic, setShowPublic] = useState(null);

  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const userId = session.user_id;

  useEffect(() => {
    console.log("Session data: ", session);
    if (session && session.user) {
      setCurrentEmail(session.email);
      setProfileUrl(session.user.user_metadata.avatar_url || '');
 
      // Fetch and set the current username

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


  const fetchPublicStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('public_account')
        .select('user_id')
        .eq('user_id', userId)
        .single();
      if (data) {
        setIsPublic(true);
      } else {
        setIsPublic(false);
      }
    } catch (error) {
      setIsPublic(false);
    }
  };


  const fetchShowPublicStatus = async () => {
    try {
      const { showPublicData, error } = await supabase
        .from('profiles')
        .select('see_public')
        .eq('user_id', userId)
        setShowPublic(showPublicData[0]?.see_public);
    } catch (error) {
      setShowPublic(false);
    }
  };

  const handleShowPublicChange = (event) => {
    console.log("public status change");
    event.preventDefault();
    if (session) {
      setShowPublicChange();
    } else {
      // setMessage('No user is logged in.');
    }
  };

  const setShowPublicChange = async () => {
    const newShowPublic = !showPublic;
    console.log("public post display change");

      const { error } = await supabase
        .from('profiles')
        .update({see_public: newShowPublic})
        .eq('user_id', userId);
      
        setShowPublic(newShowPublic);
    console.log("public show set to:", showPublic);
  };



  const handlePublicStatusChange = (event) => {
    console.log("public status change");
    event.preventDefault();
    if (session) {
      setPublicStatusChange();
    } else {
      // setMessage('No user is logged in.');
    }
  };

  const setPublicStatusChange = async () => {
    console.log("public status change");
    if (isPublic) {
      const { error } = await supabase
        .from('public_account')
        .delete()
        .eq('user_id', userId);
      if (error) {
        setMessage('Failed to set private: ' + error.message);
      } else {

        setIsPublic(false);
      }
    } else {
      const { error } = await supabase
        .from('public_account')
        .insert({ user_id: userId });
      if (error) {
        setMessage('Failed to set public: ' + error.message);
      } else {
        setIsPublic(true);

      }
    }
    console.log("public stat set to:", isPublic);
  };



  const updateEmail = async () => {
    const { user, error } = await supabase.auth.updateUser({
      email: email
    });
    if (error) {
      // setMessage('Failed to update email: ' + error.message);
    } else {
      // setMessage('Email updated successfully. Please check your inbox to verify your new email.');
      setCurrentEmail(email);
    }
  };

  const updateUsername = async () => {
    setLoading(true);
    // setMessage('');

    const { data, error } = await supabase
      .from('profiles')
      .update({ username: username })
      .match({ id: userId });
    if (error) {

    } else {
      // setMessage('Username updated successfully!');
      setCurrentUsername(username);
    }
    setLoading(false);
  };
  async function getUserName() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', userId)
        .single();
      if (error) {
        console.error('Error fetching username:', error.message);
        setCurrentUsername('No username set');
      } else {
        setCurrentUsername(data.username || 'No username set');
        console.log("Username set to state: ", data.username);
      }
    } catch (error) {
      console.error('Unexpected error fetching username:', error.message);
      setCurrentUsername('No username set');
    }
  }
  async function getEmail() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('user_id', userId)
        .single();
      if (error) {
        setCurrentUsername('No username set');
      } else {
        setCurrentEmail(data.email || 'No username set');

      }
    } catch (error) {
      setCurrentUsername('No username set');
    }
  }


  const handleSubmit = (event) => {
    event.preventDefault();
    if (session) {
      updateUsername();
    } else {
      // setMessage('No user is logged in.');
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
      // setMessage('Failed to get image URL: ' + urlError.message);
      return;
    }

    setProfileUrl(publicURL);
    setMessage('Profile image updated successfully.');


    const { data, error: fileNameError } = await supabase
      .from('avatars')
      .upsert({ user_id: userId, file_name: fileName })
      .throwOnError()
  };
  async function fetchData() {
    await getEmail();
    await getUserName();
    await fetchFitnessStats();
    await fetchPublicStatus();
    await fetchShowPublicStatus();


    const { data: file_name, error: fileError } = await supabase
      .from('avatars')
      .select('file_name')
      .eq('user_id', userId)
      .throwOnError()
    if (file_name) {
      const { data, error } = await supabase
        .storage
        .from('media')
        .createSignedUrl(`/avatars/${file_name[0].file_name}`, 60)
      setProfileUrl(data.signedUrl)
    }

  }

  async function fetchFitnessStats() {
    try {
      const { data: followingUserIdsData, error: followingError } = await supabase //this puts it in the format necessary for the FetchPostData function.
        //--is a bit of a pain. Might want to change later 
        .from('followers')
        .select('user_id')
        .eq('user_id', userId);
      if (followingError) throw followingError;

      const followingUserIds = followingUserIdsData.map(user => user.user_id);
      followingUserIds.push(userId);

      /*              From feed.js                */
      // Fetch all the UUIDs of users the current user is following
      /* #####################    Fetch User's Following List  ##################### */

      // Fetch file metadata
      /* #####################    Fetch User's Liked Post list  ##################### */
      const combinedData = await FetchPostData(session, supabase, followingUserIds)
      setShowProfile(true);
      setProfileData(combinedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  }

  return (

    <div className="top-cont">
      <h1>PROFILE</h1>
      <div className="profile-container">



        <div className="profile-content">
          <div className="profile-info-section">
            <div className="profile-update-email">
              <p className="profile-info">Current Email: {currentEmail}</p>
              <div className="input-group">
                <input
                  type="email"
                  value={email}
                  className="input-field"
                  onChange={handleEmailChange}
                  placeholder="Enter new email"
                />
                <button className="btn-update" onClick={updateEmail}>Update</button>
              </div>
            </div>

          </div>
          <div className="profile-info-section">
            {isPublic !== null &&
              <div className="profile-public-status">
                <p>Account Status: {isPublic ? "Public" : "Private"}</p>
                <label className="switch">
                  <button className="public-button" onClick={handlePublicStatusChange}
                  >Click to set {isPublic ? "private" : "public"}</button>
                  <span className="slider round"></span>
                </label>
              </div>
            }
            {showPublic !== null &&
              <div className="profile-public-status">
                <p>Currently {showPublic ? "not displaying public accounts" : "displaying public accounts"}</p>
                <label className="switch">
                  <button className="public-button" onClick={handleShowPublicChange}
                  >Click to set: {showPublic ? "show public accounts" : "don't show public accounts"}</button>
                  <span className="slider round"></span>
                </label>
              </div>
            }
          </div>
          <div className="profile-info-section">

            <div className="profile-update-username">

              <p>Current Username: {currentUsername}</p>
              <form className="form-update" onSubmit={handleSubmit}>
                <input
                  type="text"
                  id="username"
                  value={username}
                  className="input-field"
                  onChange={handleUsernameChange}
                  placeholder="Enter new username"
                />
                <button type="submit" className="btn-update" >
                  Update
                </button>
              </form>
            </div>
          </div>
          <div className="profile-update-image">
            {profileUrl && (
              <div className="image-preview">
                <img src={profileUrl} alt="Profile" />
              </div>
            )}
            <input type="file" onChange={handleFileChange} className="input-file" />
            {message && <p>{message}</p>}
          </div>
        </div>

      </div>


      <center><FitnessStatsInput session={session} supabase={supabase} /></center>
      <div className="profilePostPage">
        {profileData === null ? <>You have no data to show!</> : profileData?.map((item, index) => (
          <div className="profilePost">
            {item.post_type === 1 && <DefaultPostDisplay session={session} supabase={supabase} item={item} index={index} size={'600px'} />}
            {item.post_type === 2 && <TextPostDisplay session={session} supabase={supabase} item={item} index={index} size={'600px'} />}
            {item.post_type === 3 && <StatPostDisplay session={session} supabase={supabase} item={item} index={index} size={'600px'} />}
          </div>
        ))}
        <Taskbar></Taskbar>
      </div>
    </div>


  );
}
