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
    const [lastIndex, setLastIndex] = useState(0);
    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch user stats
                const { data: userStats, error: userStatsError } = await supabase
                    .from('fitness_stats')
                    .select('user_id, num_entries, deadlift, bench, mile_time, pullups, pushups, weight, height, update_timestamp')
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
                    setUserData(userStats[0]); //for some reason it has t obe in this stupid form I hate this 
                    console.log("userDAta", userData)
                    if (userData.num_entries === null) {
                        setLastIndex(-1);
                    } else {

                        setLastIndex(userData.num_entries - 1);
                        console.log("this stupid fucking index", userData.num_entries);
                    }

                    if (lastIndex >= 0) {
                        if (userData.deadlift && userData.deadlift[lastIndex] !== null) setDeadlift(userData.deadlift[lastIndex]);
                        if (userData.bench && userData.bench[lastIndex] !== null) setBench(userData.bench[lastIndex]);
                        if (userData.mile_time && userData.mile_time[lastIndex] !== null) setMileTime(userData.mile_time[lastIndex]);
                        if (userData.pullups && userData.pullups[lastIndex] !== null) setPullups(userData.pullups[lastIndex]);
                        if (userData.pushups && userData.pushups[lastIndex] !== null) setPushups(userData.pushups[lastIndex]);
                        if (userData.weight && userData.weight[lastIndex] !== null) setWeight(userData.weight[lastIndex]);
                        if (userData.height && userData.height[lastIndex] !== null) setHeight(userData.height[lastIndex]);
                    } else {
                        console.log('User stats arrays are empty or not properly defined.');
                    }
                }
                //setUserData(userData); // Return fetched user stats
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
        console.log("userData", userData);
        if (lastIndex < 0) {
            deadliftArray = [deadlift];
            benchArray = [bench];
            mileTimeArray = [mileTime];
            pushupsArray = [pushups];
            pullupsArray = [pullups];
            weightArray = [weight];
            heightArray = [height];
            timestampArray = [timestamp.toISOString()];
        } else {
            benchArray = [...userData.bench, bench];
            deadliftArray = [...userData.deadlift, deadlift];
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
            .update({ num_entries: (userData.num_entries + 1), update_timestamp: timestampArray, deadlift: deadliftArray, bench: benchArray, pushups: pushupsArray, mile_time: mileTimeArray, pullups: pullupsArray, weight: weightArray, height: heightArray })
            .eq('user_id', userId)
            .throwOnError();
        console.log("submitted?");

        return;
    };
    return (
        <div className="statsPage">
            <div className="fitnessCategory">
                Deadlift
                <input className="fitnessInput" type="number" id="deadlift" name="deadlift" value={deadlift} onChange={(event) => setDeadlift(event.target.value)} />
            </div >
            <div className="fitnessCategory">
                Bench
                <input className="fitnessInput" type="number" id="bench" name="bench" value={bench} onChange={(event) => setBench(event.target.value)} />
            </div>
            <div className="fitnessCategory">
                miletime
                <input className="fitnessInput" type="text" id="mileTime" name="mileTime" value={mileTime} onChange={(event) => setMileTime(event.target.value)} />
            </div>
            <div className="fitnessCategory">
                Pushups
                <input className="fitnessInput" type="number" id="pushups" name="pushups" value={pushups} onChange={(event) => setPushups(event.target.value)} />
            </div>
            <div className="fitnessCategory">
                Pullups
                <input className="fitnessInput" type="number" id="pullups" name="pullups" value={pullups} onChange={(event) => setPullups(event.target.value)} />
            </div>
            <div className="fitnessCategory">
                Weight
                <input className="fitnessInput" type="number" id="weight" name="weight" value={weight} onChange={(event) => setWeight(event.target.value)} />
            </div>
            <div className="fitnessCategory">
                Height
                <input className="fitnessInput" type="text" id="height" name="height" value={height} onChange={(event) => setHeight(event.target.value)} />
            </div>
            <div className="submitFitnessStats">
                <button onClick={() => handleSubmit(userData)}>Post</button>
            </div>
        </div>
    )
}
