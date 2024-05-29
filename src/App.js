import './input.css'
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import Home from './Home'
import {ProfilePage} from './webpages/profilePage';
import {Followers} from './webpages/followersPage';
import Upload from './webpages/uploadPage';
import Feed from './components/feed';
import Login from './login'
import Register from './register'

const supabase = createClient('https://lrklhdizqhzzuqntsdnn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxya2xoZGl6cWh6enVxbnRzZG5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU0ODI3MTUsImV4cCI6MjAzMTA1ODcxNX0.KZNvqVyxzqePjb9OTlQUIKwf5922oCLXSHDc_YqA87M')

export default function App() {
  const [session, setSession] = useState(null)
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // if (!session) {
  //   //return (<Login />)
  // }
  if (1===1) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={session ? <Home session={session} supabase={supabase} /> : <Login/>} />
          <Route path="/webpages/profile" element={<ProfilePage session={session} supabase={supabase} />} />
          <Route path="/webpages/upload" element={<Upload session={session} supabase={supabase} />} />
          <Route path="/webpages/followers" element={<Followers session={session} supabase={supabase} />} />
          <Route path="/components/feed" element={<Feed session={session} supabase={supabase} />} />
          <Route path="/register" element={<Register/>}/>
          <Route path="/login" element={<Login/>}/>
        </Routes>
      </Router>
    );
  }
}