import React, { useState } from 'react';

function Profile({ session, supabase }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

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
    }
  };

  return (
    <div className="profile">
      <h2>Update Email Address</h2>

      <div>
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="Enter new email"
        />
        <button onClick={updateEmail}>Update Email</button>
      </div>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Profile;
