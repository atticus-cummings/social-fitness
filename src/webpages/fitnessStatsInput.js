import React, { useState, useEffect } from "react";
import useSWR from 'swr';
import './fitnessStats.css'

export default function FitnessStats({ supabase, session }) {
    const userId = session.user.id;
    const [userData, setUserData] = useState(0);
    const [deadlift, setDeadlift] = useState(0);
    const [bench, setBench] = useState(0);
    const [mileTime, setMileTime] = useState(0);
    const [pushups, setPushups] = useState(0);
    const [pullups, setPullups] = useState(0);
    const [weight, setWeight] = useState(0);
    const [height, setHeight] = useState(0);
    const[lastIndex, SetlastIndex] = useState(0);
    useEffect(() => {
    async function fetchData() {
        try {
          // Fetch user stats
          const { data: userStats, error: userStatsError } = await supabase
            .from('fitness_stats')
            .select('user_id, deadlift, bench, mile_time, pushups, weight, height, update_timestamp')
            .eq('user_id', userId)

        console.log('existing stats:', userStats);

          if (!userStats || userStats.length === 0) {
            console.log("null?");
            await supabase
              .from('fitness_stats')
              .insert([{ user_id: userId }])
              .throwOnError(); 
              console.log('New record inserted for user:', userId);
            } else {
              console.log('User stats already exist for user:', userId);
        
              const stats = ['deadlift', 'bench', 'mile_time', 'pushups', 'pullups', 'weight', 'height','update_timestamp'];
              SetlastIndex(userStats[stats[0]] ? userStats[stats[0]].length - 1 : -1);
        
              if (lastIndex >= 0) {
                if (userStats.deadlift && userStats.deadlift[lastIndex] !== null) setDeadlift(userStats.deadlift[lastIndex]);
                if (userStats.bench && userStats.bench[lastIndex] !== null) setBench(userStats.bench[lastIndex]);
                if (userStats.mile_time && userStats.mile_time[lastIndex] !== null) setMileTime(userStats.mile_time[lastIndex]);
                if (userStats.pullups && userStats.pullups[lastIndex] !== null) setPullups(userStats.pullups[lastIndex]);
                if (userStats.pushups && userStats.pushups[lastIndex] !== null) setPushups(userStats.pushups[lastIndex]);
                if (userStats.weight && userStats.weight[lastIndex] !== null) setWeight(userStats.weight[lastIndex]);
                if (userStats.height && userStats.height[lastIndex] !== null) setHeight(userStats.height[lastIndex]);
              } else {
                console.log('User stats arrays are empty or not properly defined.');
              }
            }
            setUserData(userStats); // Return fetched user stats
        } catch (error) {
          console.error('Error fetching or inserting data:', error.message);
          throw error; // Throw the error for the calling function to handle
        }
      }
      fetchData();
    }, [userId]);


    const handleSubmit = async (userData) => {
        let deadliftArray;
        let benchArray; //theres gotta be a better way to do this
        let mileTimeArray;
        let pushupsArray;
        let pullupsArray;
        let weightArray;
        let heightArray; 
        let timestampArray;
        let timestamp = new Date();
 //I never thought formatting a date would give me so much trouble--this is infuriating 
 //I've tried everything to get it to input into the supabase date format. I just ended up making the timestamp log a string input. 
        console.log("index", lastIndex);
        if(lastIndex < 0){
            deadliftArray = [deadlift];
            benchArray = [ bench];
            mileTimeArray = [mileTime];
            pushupsArray = [pushups];
            pullupsArray = [pullups];
            weightArray = [weight];
            heightArray = [height]; 
            timestampArray = [timestamp.toISOString()];
        } else{
            deadliftArray = [...userData.deadlift, deadlift];
            benchArray = [...userData.bench, bench];
            mileTimeArray = [...userData.mile_time, mileTime];
            pushupsArray = [...userData.pushups, pushups];
            pullupsArray = [...userData.pullups, pullups];
            weightArray = [...userData.weight, weight];
            heightArray = [...userData.height, height];
            timestampArray = [...userData.update_timestamp, timestamp.toISOString()];
        }
        console.log("timestamp", timestampArray);
        console.log("deadlift", deadliftArray);
        await supabase
            .from('fitness_stats')
            .update({ update_timestamp:timestampArray, deadlift:deadliftArray, bench:benchArray, pushups:pushupsArray, mile_time:mileTimeArray, pullups:pullupsArray, weight:weightArray, height:heightArray})
            .eq('user_id', userId)
            .throwOnError();
        console.log("submitted?");

        return;
    };
    return(
        <div className="statsPage">
        <div className="fitnessCategory">
            Deadlift
            <input className="fitnessInput" type="number" id="deadlift" name="deadlift" value={deadlift} onChange={(event) => setDeadlift(event.target.value)} />
        </div >
        <div  className="fitnessCategory">
            Bench
            <input className="fitnessInput" type="number" id="bench" name="bench" value={bench} onChange={(event) => setBench(event.target.value)} />
        </div>
        <div  className="fitnessCategory">
            miletime
            <input className="fitnessInput" type="text" id="mileTime" name="mileTime" value={mileTime} onChange={(event) => setMileTime(event.target.value)} />
        </div>
        <div  className="fitnessCategory">
            Pushups
            <input className="fitnessInput" type="number" id="pushups" name="pushups" value={pushups} onChange={(event) => setPushups(event.target.value)} />
        </div>
        <div  className="fitnessCategory">
            Pullups
            <input className="fitnessInput" type="number" id="pullups" name="pullups" value={pullups} onChange={(event) => setPullups(event.target.value)} />
        </div>
        <div  className="fitnessCategory">
            Weight
            <input className="fitnessInput" type="number" id="weight" name="weight" value={weight} onChange={(event) => setWeight(event.target.value)} />
        </div>
        <div  className="fitnessCategory">
            Height
            <input className="fitnessInput" type="text" id="height" name="height" value={height} onChange={(event) => setHeight(event.target.value)} />
        </div>
        <div className="submitButton">
            <button onClick={() => handleSubmit(userData)}>Post</button>
        </div>
        </div>
    )
}
