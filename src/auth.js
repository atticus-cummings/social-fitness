import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://lrklhdizqhzzuqntsdnn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxya2xoZGl6cWh6enVxbnRzZG5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU0ODI3MTUsImV4cCI6MjAzMTA1ODcxNX0.KZNvqVyxzqePjb9OTlQUIKwf5922oCLXSHDc_YqA87M';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log(supabase)
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);

	useEffect(() => {
    	const checkUser = async () => {
        	const currentSession = supabase.auth.session;
        	setUser(currentSession ? currentSession.user : null);
    	};

    	checkUser();

    	const listener = supabase.auth.onAuthStateChange((_event, session) => {
        	setUser(session ? session.user : null);
    	});

    	return () => {
        	//if (listener.data) listener.data.unsubscribe();
    	};
	}, []);

	const login = async (email, password) => {
    	const { error, session } = await supabase.auth.signIn({
        	email,
        	password
    	});

    	if (error) throw error;
    	setUser(session.user);
	};

	const logout = async () => {
    	await supabase.auth.signOut();
    	setUser(null);
	};

	return (
    	<AuthContext.Provider value={{ user, login, logout }}>
        	{children}
    	</AuthContext.Provider>
	);
};
