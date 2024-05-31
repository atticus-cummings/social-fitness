import React, { useState, useEffect } from 'react';
import { Taskbar } from "../components/taskbar";

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

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const { data: fitnessStats, error } = await supabase
                    .from('fitness_stats')
                    .select('user_id, deadlift, bench, mile_time, pushups, pullups, weight, height');
                
                if (error) {
                    throw error;
                }

                const latestValues = {
                    deadlift: { user: '', value: 0 },
                    bench: { user: '', value: 0 },
                    mileTime: { user: '', value: 0 },
                    pushups: { user: '', value: 0 },
                    pullups: { user: '', value: 0 },
                    weight: { user: '', value: 0 },
                    height: { user: '', value: 0 }
                };

                fitnessStats.forEach(stat => {
                    const userId = stat.user_id;

                    if (stat.deadlift && stat.deadlift.length > 0) {
                        const deadliftValue = stat.deadlift[stat.deadlift.length - 1];
                        if (deadliftValue > latestValues.deadlift.value) {
                            latestValues.deadlift = { user: userId, value: deadliftValue };
                        }
                    }

                    if (stat.bench && stat.bench.length > 0) {
                        const benchValue = stat.bench[stat.bench.length - 1];
                        if (benchValue > latestValues.bench.value) {
                            latestValues.bench = { user: userId, value: benchValue };
                        }
                    }

                    if (stat.mile_time && stat.mile_time.length > 0) {
                        const mileTimeValue = stat.mile_time[stat.mile_time.length - 1];
                        if (mileTimeValue < latestValues.mileTime.value || latestValues.mileTime.value === 0) {
                            latestValues.mileTime = { user: userId, value: mileTimeValue };
                        }
                    }

                    if (stat.pushups && stat.pushups.length > 0) {
                        const pushupsValue = stat.pushups[stat.pushups.length - 1];
                        if (pushupsValue > latestValues.pushups.value) {
                            latestValues.pushups = { user: userId, value: pushupsValue };
                        }
                    }

                    if (stat.pullups && stat.pullups.length > 0) {
                        const pullupsValue = stat.pullups[stat.pullups.length - 1];
                        if (pullupsValue > latestValues.pullups.value) {
                            latestValues.pullups = { user: userId, value: pullupsValue };
                        }
                    }

                    if (stat.weight && stat.weight.length > 0) {
                        const weightValue = stat.weight[stat.weight.length - 1];
                        if (weightValue > latestValues.weight.value) {
                            latestValues.weight = { user: userId, value: weightValue };
                        }
                    }

                    if (stat.height && stat.height.length > 0) {
                        const heightValue = stat.height[stat.height.length - 1];
                        if (heightValue > latestValues.height.value) {
                            latestValues.height = { user: userId, value: heightValue };
                        }
                    }
                });

                setLeaderboard(latestValues);
            } catch (error) {
                console.error('Error fetching leaderboard data:', error);
            }
        }

        fetchLeaderboard();
    }, [supabase]);

    return (
        <div>
            <h1>Leaderboard</h1>
            <div>
                <h2>Deadlift</h2>
                <p>User: {leaderboard.deadlift.user} - Value: {leaderboard.deadlift.value}</p>
            </div>
            <div>
                <h2>Bench</h2>
                <p>User: {leaderboard.bench.user} - Value: {leaderboard.bench.value}</p>
            </div>
            <div>
                <h2>Mile Time</h2>
                <p>User: {leaderboard.mileTime.user} - Value: {leaderboard.mileTime.value}</p>
            </div>
            <div>
                <h2>Pushups</h2>
                <p>User: {leaderboard.pushups.user} - Value: {leaderboard.pushups.value}</p>
            </div>
            <div>
                <h2>Pullups</h2>
                <p>User: {leaderboard.pullups.user} - Value: {leaderboard.pullups.value}</p>
            </div>
            <div>
                <h2>Weight</h2>
                <p>User: {leaderboard.weight.user} - Value: {leaderboard.weight.value}</p>
            </div>
            <div>
                <h2>Height</h2>
                <p>User: {leaderboard.height.user} - Value: {leaderboard.height.value}</p>
            </div>
        <Taskbar/>
        </div>
    );
}
