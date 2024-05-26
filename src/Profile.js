import React, { useState, useEffect } from 'react';

function Profile({ session, supabase }) {
  const [email, setEmail] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (session && session.user) {
      setCurrentEmail(session.user.email);
      setProfileUrl(session.user.user_metadata.avatar_url || '');
    }
  }, [session]);

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
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    setMessage('Uploading image...');
    let { error: uploadError, data: uploadData } = await supabase.storage.from('media').upload(filePath, file);

    if (uploadError) {
      setMessage('Failed to upload image: ' + uploadError.message);
      return;
    }

    const { publicURL, error: urlError } = supabase.storage.from('media').getPublicUrl(filePath);

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
  };

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
