import React, { useState, useEffect, useCallback } from "react";
import './fitnessStats.css'

export default function FitnessStats({ supabase, session }) {
    const userId = session.id;
    const [userData, setUserData] = useState(0);
    const [deadlift, setDeadlift] = useState(0);
    const [bench, setBench] = useState(0);
    const [mileTime, setMileTime] = useState(0);
    const [pushups, setPushups] = useState(0);
    const [pullups, setPullups] = useState(0);
    const [weight, setWeight] = useState(0);
    const [height, setHeight] = useState(0);
    const [lastIndex, setLastIndex] = useState(-1);
    const [submitted, setSubmitted] = useState(false);
    const [entries, setEntries] = useState(0);
    const fetchData = useCallback(async () => {
        try {
            // Fetch user stats
            const { data: userStats, error: userStatsError } = await supabase
                .from('fitness_stats')
                .select('user_id, num_entries, deadlift, bench, mile_time, pullups, pushups, weight, height, update_timestamp')
                .eq('user_id', userId)

            console.log('existing stats:', userStats);
            if (userStatsError) throw userStatsError
            if (!userStats || userStats.length === 0) {
                console.log("null?");
                await supabase
                    .from('fitness_stats')
                    .insert([{ user_id: userId }])
                    .throwOnError();
                //  console.log('New record inserted for user:', userId);
            } else {
                // console.log('User stats already exist for user:', userId);
                const stats = userStats[0]
                setUserData(stats); //for some reason it has t obe in this stupid form I hate this 
                // console.log("userDAta", userData
                const index = stats.num_entries - 1;
                setLastIndex(index);

                if (index >= 0) {
                    console.log("index", index);
                    if (stats.deadlift && stats.deadlift[index] !== null) setDeadlift(stats.deadlift[index]);
                    console.log("flag", deadlift);
                    if (stats.bench && stats.bench[index] !== null) setBench(stats.bench[index]);
                    if (stats.mile_time && stats.mile_time[index] !== null) setMileTime(stats.mile_time[index]);
                    if (stats.pullups && stats.pullups[index] !== null) setPullups(stats.pullups[index]);
                    if (stats.pushups && stats.pushups[index] !== null) setPushups(stats.pushups[index]);
                    if (stats.weight && stats.weight[index] !== null) setWeight(stats.weight[index]);
                    if (stats.height && stats.height[index] !== null) setHeight(stats.height[index]);
                } else {
                    console.log('User stats arrays are empty or not properly defined.');
                }
            }
            //setUserData(userData); // Return fetched user stats
        } catch (error) {
            console.error('Error fetching or inserting data:', error.message);
            throw error; // Throw the error for the calling function to handle
        }

    }, [userId, supabase]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


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
        let entries = 1;
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
            entries = userData.num_entries + 1;
        }
        console.log("timestamp", timestampArray);
        console.log("deadlift", deadliftArray);
        await supabase
            .from('fitness_stats')
            .update({ num_entries: entries, update_timestamp: timestampArray, deadlift: deadliftArray, bench: benchArray, pushups: pushupsArray, mile_time: mileTimeArray, pullups: pullupsArray, weight: weightArray, height: heightArray })
            .eq('user_id', userId)
            .throwOnError();
        console.log("submitted?");
        setSubmitted(true);
        return;
    };
    return (
        <div className="statsPage">
            <button onClick={() => fetchData()}>Click here to refresh!</button>
                <div>
                    <div className="fitnessCategory">
                        Deadlift<br></br> 
                        <input className="fitnessInput" type="number" id="deadlift" name="deadlift" value={deadlift} onChange={(event) => {setDeadlift(event.target.value); setSubmitted(false)}} />
                    </div >
                    <div className="fitnessCategory">
                        Bench<br></br> 
                        <input className="fitnessInput" type="number" id="bench" name="bench" value={bench} onChange={(event) => {setBench(event.target.value); setSubmitted(false)}} />
                    </div>
                    <div className="fitnessCategory">
                        miletime<br></br> 
                        <input className="fitnessInput" type="text" id="mileTime" name="mileTime" value={mileTime} onChange={(event) => {setMileTime(event.target.value); setSubmitted(false)}} />
                    </div>
                    <div className="fitnessCategory">
                        Pushups<br></br> 
                        <input className="fitnessInput" type="number" id="pushups" name="pushups" value={pushups} onChange={(event) => {setPushups(event.target.value); setSubmitted(false)}} />
                    </div>
                    <div className="fitnessCategory">
                        Pullups<br></br> 
                        <input className="fitnessInput" type="number" id="pullups" name="pullups" value={pullups} onChange={(event) => {setPullups(event.target.value); setSubmitted(false)}} />
                    </div>
                    <div className="fitnessCategory">
                        Weight<br></br> 
                        <input className="fitnessInput" type="number" id="weight" name="weight" value={weight} onChange={(event) => {setWeight(event.target.value); setSubmitted(false)}} />
                    </div>
                    <div className="fitnessCategory">
                        Height<br></br> 
                        <input className="fitnessInput" type="text" id="height" name="height" value={height} onChange={(event) => {setHeight(event.target.value); setSubmitted(false)}} />
                    </div>
                    <div className="submitFitnessStats">
                        <button onClick={() => handleSubmit(userData)}>Post</button>
                    </div>
                </div>
            {submitted ? <>Data Saved!</> : <>Unsaved Data.</>}
            

            


        </div>

    )
}
