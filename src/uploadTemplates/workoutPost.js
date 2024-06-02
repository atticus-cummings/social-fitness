import React, { useState, useEffect } from "react";

export default function WorkoutPost({ supabase, session }) {
    const userId = session.user.id;
    const [userData, setUserData] = useState(null);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        async function fetchData() {
            try {
                const { data: userImport, error: userStatsError } = await supabase
                    .from('fitness_stats')
                    .select()
                    .eq('user_id', userId)

                console.log('existing stats:', userImport);

                if (!userImport || userImport.length === 0) {
                    console.log("null?");
                    await supabase
                        .from('fitness_stats')
                        .insert([{ user_id: userId }])
                        .throwOnError();
                    console.log('New record inserted for user:', userId);
                } else {
                    console.log('User stats already exist for user:', userId);
                    setUserData(userImport[0]);
                }
            } catch (error) {
                console.error('Error fetching or inserting data:', error.message);
                throw error; // Throw the error for the calling function to handle
            }
        }
        fetchData();
    }, [userId]);

    useEffect(() => {
        if (userData) {
            if (userData.num_entries === null) {
                setIndex(-1);
            } else {
                setIndex(userData.num_entries - 1);
            }
        }
    }, [userData]);

/*
        const js = document.querySelector('#payment');
        const bt = document.querySelector('#bt');
*/



    return (
        <div>
            <div>
                <div> Include your  Latest Workout stats: </div>
                {userData !== null ? (
                    <div>
                        {index !== -1 && (
                            <div>
                                <div>
                                    <input type="checkbox" id="bench" name="bench" />
                                    <label for="bench"> Bench Press {userData.bench[index]} lbs</label>
                                </div>

                                <div>
                                    <input type="checkbox" id="deadlift" name="deadlift" />
                                    <label for="deadlift"> Deadlift {userData.deadlift[index]} lbs</label>
                                </div>

                                <div>
                                    <input type="checkbox" id="mile_time" name="mile_time" />
                                    <label for="mile_time"> Mile Time {userData.mile_time[index]}</label>
                                </div>

                                <div>
                                    <input type="checkbox" id="pullups" name="pullups" />
                                    <label for="pullups"> Pullups {userData.pullups[index]}</label>
                                </div>

                                <div>
                                    <input type="checkbox" id="pushups" name="pushups" />
                                    <label for="pushups"> Pushups {userData.pushups[index]}</label>
                                </div>

                                <div>
                                    <input type="checkbox" id="weight" name="weight" />
                                    <label for="weight"> Weight {userData.weight[index]} lbs</label>
                                </div>

                                <div>
                                    <input type="checkbox" id="height" name="height" />
                                    <label for="height"> Height {userData.height[index]} inches</label>
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
