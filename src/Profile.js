import React, { useState, useEffect } from 'react';
import useSWR from 'swr';

function Profile({ session, supabase }) {
  const [email, setEmail] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('')
  
  const userId = session.user.id;

  useEffect(() => {
    if (session && session.user) {
      setCurrentEmail(session.user.email);
      setProfileUrl(session.user.user_metadata.avatar_url || '');
    }
  }, [session]);

  const {data, mutate} = useSWR(`image-${userId}`,
        async() => await fetchData()
  );

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
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
    let { error: uploadError, data: uploadData } = await supabase.storage.from('media').upload(filePath, file);

    if (uploadError) {
      setMessage('Failed to upload image: ' + uploadError.message);
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
      .insert({user_id: userId, file_name: fileName})
      .throwOnError()

  };

  async function fetchData(){
    const { data: file_name, error: fileError } = await supabase
      .from('avatars')
      .select('file_name') 
      .throwOnError()
    //console.log("FILE NAME:", file_name[0].file_name)

    if (file_name){
      const { data, error } = await supabase
        .storage
        .from('media')
        .createSignedUrl(`/avatars/${file_name[0].file_name}`, 60) // Adjust file name and expiry time as needed
        //.throwOnError();
        setProfileUrl(data.signedUrl)
        //console.log(data)
    }
  }
  console.log(profileUrl)
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
    </div>
  );
}

export default Profile;
