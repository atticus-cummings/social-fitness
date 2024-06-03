import './input.css'
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import Home from './Home'
import {ProfilePage} from './webpages/profilePage';
import Followers from './webpages/followersPage';
import Upload from './webpages/uploadPage';
import Feed from './components/feed';
import Login from './login'
import Register from './register'
import Leaderboard from './webpages/leaderboardPage';

const supabase = createClient('https://lrklhdizqhzzuqntsdnn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxya2xoZGl6cWh6enVxbnRzZG5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU0ODI3MTUsImV4cCI6MjAzMTA1ODcxNX0.KZNvqVyxzqePjb9OTlQUIKwf5922oCLXSHDc_YqA87M')


export default function App() {
  const [session, setSession] = useState(null)
  // const loginDetails = document.cookie;
  const sessionTemp = document.cookie;
  //setSession(sessionTemp)

  console.log("LOGIN DETAILS:", document.cookie)
  // useEffect(() => {
  //   try{
  //     setSession(JSON.parse(document.cookie))
  //   }
  //   catch (error){
  //     console.log(error)
  //   }
  //   // console.log("SESSION:", session)
  //   // console.log("TYPE", typeof(session))
  // //   //   Login({supabase}).then(setSession(document.cookie))
  // //   // console.log("LOGIN DETAILS:", document.cookie)

  // //   // const {
  // //   //   data: { subscription },
  // //   // } = supabase.auth.onAuthStateChange((_event, session) => {
  // //   //   setSession(session)
    // })

  // //   // return () => subscription.unsubscribe()
  // })
  if (sessionTemp === null) {
    return (<Login supabase={supabase} />)
  }
  else{
    return (
      <Router>
        <Routes>
          <Route path="/" element={sessionTemp.id ? <Home session={session} supabase={supabase} /> : <Login supabase={supabase} />} />
          <Route path="/webpages/profile" element={<ProfilePage session={session} supabase={supabase} />} />
          <Route path="/webpages/upload" element={<Upload session={session} supabase={supabase} />} />
          <Route path="/webpages/followers" element={<Followers session={session} supabase={supabase} />} />
          <Route path="/components/feed" element={<Feed session={session} supabase={supabase} />} />
          <Route path="/register" element={<Register supabase={supabase}/>}/>
          <Route path="/login" element={<Login supabase={supabase} />} />
          <Route path="/webpages/leaderboard" element={<Leaderboard session={session} supabase={supabase} />} />

        </Routes>
      </Router>
    );
  }
}
