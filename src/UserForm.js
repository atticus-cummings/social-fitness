import React, { useState, useEffect } from 'react';

function UserForm({ session, supabase }) {
  const [username, setUsername] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (session && session.user) {
      // Assuming the 'username' is stored in user_metadata which might not be true depending on your setup
      setCurrentUsername(session.user.user_metadata.username || 'No username set');
    }
  }, [session]);

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const updateUsername = async () => {
    setLoading(true);
    setMessage('');

    const { data, error } = await supabase
      .from('profiles')
      .update({ username: username })
      .match({ id: session.user.id });  // Use session.user.id to identify the user

    if (error) {
      setMessage(`Failed to update username: ${error.message}`);
    } else {
      setMessage('Username updated successfully!');
      setCurrentUsername(username);
    }
    setLoading(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (session) {
      updateUsername();
    } else {
      setMessage('No user is logged in.');
    }
  };

  return (
    <div>
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
      {message && <p>{message}</p>}
    </div>
  );
}

export default UserForm;
