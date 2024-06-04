import React, { useState, useEffect } from 'react';
import { Taskbar } from "../components/taskbar";
import "./leaderboard.css";

export default function LeaderBoard({ supabase, session }) {
    const [leaderboard, setLeaderboard] = useState({
        deadlift: { user: '', value: 0 },
        bench: { user: '', value: 0 },
        mileTime: { user: '', value: 0 },
        pushups: { user: '', value: 0 },
        pullups: { user: '', value: 0 },
        weight: { user: '', value: 0 },
        height: { user: '', value: 0 }

    });
    const [usernames, setUsernames] = useState([]);

    async function fetchUsernames() {

    }


    useEffect(() => {

        async function fetchLeaderboard() {
            try {
                const { data: fitnessStats, error } = await supabase
                    .from('fitness_stats')
                    .select('user_id, deadlift, bench, mile_time, pushups, pullups, weight, height, update_timestamp');

                if (error) {
                    throw error;
                }

                const latestValues = {
                    deadlift: { user: '', value: 0 ,date:'' },
                    bench: { user: '', value: 0, date:'' },
                    mileTime: { user: '', value: 0, date:'' },
                    pushups: { user: '', value: 0, date:'' },
                    pullups: { user: '', value: 0, date:'' },
                    weight: { user: '', value: 0, date:'' },
                    height: { user: '', value: 0, date:'' }
                };

                const { data: usernameArray, error: usernameError } = await supabase
                    .from('profiles')
                    .select('id, username')

                if (usernameError) throw usernameError;
                const usernamesMap = usernameArray.reduce((map, item) => {
                    map[item.id] = item.username;
                    return map;
                }, {});
                console.log(usernamesMap);

                fitnessStats.forEach(stat => {
                    const userId = stat.user_id;

                    const date = new Date(stat.update_timestamp[stat.update_timestamp.length - 1]);
                    const formattedDate = (date.toLocaleDateString('en-CA')).replace(/-/g, '/');

                    if (stat.deadlift && stat.deadlift.length > 0) {
                        const deadliftValue = stat.deadlift[stat.deadlift.length - 1];
                        if (deadliftValue > latestValues.deadlift.value) {
                            latestValues.deadlift = { user: usernamesMap[userId], value: deadliftValue, date: formattedDate };
                        }
                    }

                    if (stat.bench && stat.bench.length > 0) {
                        const benchValue = stat.bench[stat.bench.length - 1];
                        if (benchValue > latestValues.bench.value) {
                            latestValues.bench = { user: usernamesMap[userId], value: benchValue , date: formattedDate};
                        }
                    }

                    if (stat.mile_time && stat.mile_time.length > 0) {
                        const mileTimeValue = stat.mile_time[stat.mile_time.length - 1];
                        if (mileTimeValue < latestValues.mileTime.value || latestValues.mileTime.value === 0) {
                            latestValues.mileTime = { user: usernamesMap[userId], value: mileTimeValue, date: formattedDate };
                        }
                    }

                    if (stat.pushups && stat.pushups.length > 0) {
                        const pushupsValue = stat.pushups[stat.pushups.length - 1];
                        if (pushupsValue > latestValues.pushups.value) {
                            latestValues.pushups = { user: usernamesMap[userId], value: pushupsValue , date: formattedDate};
                        }
                    }

                    if (stat.pullups && stat.pullups.length > 0) {
                        const pullupsValue = stat.pullups[stat.pullups.length - 1];
                        if (pullupsValue > latestValues.pullups.value) {
                            latestValues.pullups = { user: usernamesMap[userId], value: pullupsValue , date: formattedDate};
                        }
                    }

                    if (stat.weight && stat.weight.length > 0) {
                        const weightValue = stat.weight[stat.weight.length - 1];
                        if (weightValue > latestValues.weight.value) {
                            latestValues.weight = { user: usernamesMap[userId], value: weightValue , date: formattedDate};
                        }
                    }

                    if (stat.height && stat.height.length > 0) {
                        const heightValue = stat.height[stat.height.length - 1];
                        if (heightValue > latestValues.height.value) {
                            latestValues.height = { user: usernamesMap[userId], value: heightValue, date: formattedDate };
                        }
                    }
                });

                setLeaderboard(latestValues);
                //  setUsernames(fetchUsernames());
                console.log("usernames", usernames);

            } catch (error) {
                console.error('Error fetching leaderboard data:', error);
            }
        }

        fetchLeaderboard();
    }, [supabase]);

    return (
        <div>

            <div className='leaderboard'>
                <h1>Leaderboard</h1>
                <div className="spacer"></div>
                <div className="leaderStat">
                    <div className="category">Deadlift</div>
                    <div className="userdisplay">User: {leaderboard.deadlift.user} </div>
                    <div className='displayValue'>Value: {leaderboard.deadlift.value}</div>
                    <div className="date"> Set date: &nbsp;{leaderboard.deadlift.date} </div>
                </div>
                <br></br>
                <div className="leaderStat">
                    <div className="category">Bench</div>
                    <div className="userdisplay">User: {leaderboard.bench.user} </div>
                    <div className='displayValue'> Value: {leaderboard.bench.value}</div>
                    <div className="date"> Set date: &nbsp;{leaderboard.bench.date}</div>
                </div>
                <br></br>
                <div className="leaderStat">
                    <div className="category">Mile Time</div>
                    <div className="userdisplay">User: {leaderboard.mileTime.user} </div> 
                    <div className='displayValue'> Value: {leaderboard.mileTime.value}</div>
                    <div className="date"> Set date: &nbsp;{leaderboard.bench.date} </div>
                </div>
                <br></br>
                <div className="leaderStat">
                    <div className="category">Pushups</div>
                    <div className="userdisplay">User: {leaderboard.pushups.user} </div>
                   <div className='displayValue'> Value: {leaderboard.pushups.value}</div>
                    <div className="date"> Set date: &nbsp;{leaderboard.bench.date} </div>
                </div>
                <br></br>
                <div className="leaderStat">
                    <div className="category">Pullups</div>
                    <div className="userdisplay">User: {leaderboard.pullups.user}</div>
                    <div className='displayValue'> Value: {leaderboard.pullups.value}</div>
                    <div className="date"> Set date: &nbsp;{leaderboard.bench.date} </div>
                </div>
                <br></br>
                <div className="leaderStat">
                    <div className="category">Weight</div>
                    <div className="userdisplay">User: {leaderboard.weight.user} </div>
                    <div className='displayValue'> Value: {leaderboard.weight.value}</div>
                    <div className="date"> Set date: &nbsp;{leaderboard.bench.date} </div>
                </div>
                <br></br>
                <div className="leaderStat">
                    <div className="category">Height</div>
                    <div className="userdisplay">User: {leaderboard.height.user}</div> 
                    <div className='displayValue'> Value: {leaderboard.height.value}</div>
                    <div className="date"> Set date: &nbsp;{leaderboard.bench.date} </div>
                </div>
                <Taskbar />
            </div>
        </div>
    );
}
