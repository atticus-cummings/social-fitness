import React, { useState, useEffect } from "react";
import 'react-photo-view/dist/react-photo-view.css';
import "./textPost.css";
import { v4 as uuidv4 } from 'uuid';


export default function WorkoutPost({ supabase, session }) {
    const userId = session.id;
    const [userData, setUserData] = useState(null);
    const [index, setIndex] = useState(0);

    const statOptions = ['bench','deadlift','mile_time','pullups','pushups','weight','height'];
    const [selectedFile, setSelectedFile] = useState(null);
    const [caption, setCaption] = useState('Write a caption...');
    //const { data, mutate } = useSWR(`image-${userId}`, async () => await fetchData());
    const [errorMessage, setErrorMessage] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [rpeValue, setRpeValue] = useState(null);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 10000000) {
                setErrorMessage('Try a smaller file! (limit 10 MB)');
                setSelectedFile(null);
                return
            }
            setSelectedFile(file);
            setErrorMessage(''); // Clear any previous error messages

            const fileUrl = URL.createObjectURL(file);
            setPreviewUrl(fileUrl);
        }
    };
    const handleRpeInput = (event) =>{
        setRpeValue(event.target.value);
    }

    const triggerFileInput = () => {
        document.getElementById('fileInput').click();
    };

    const handleCaptionInput = (event) => {
        setCaption(event.target.value);
    };

    const handleSubmit = async () => {
            await uploadPost(selectedFile, caption);

    };

  function getStats(){
    console.log("here?")
    //const statOptions = ['bench','deadlift','mile_time','pullups','pushups','weight','height'];
    const stat_Names = [];
    const stat_Vals=[];
    for (const stat of statOptions) {
        var checkbox = document.getElementById(stat);
        if (checkbox && checkbox.checked) {
            stat_Vals.push(userData[stat][index]);
            stat_Names.push(stat);
        }
    }
    console.log("stat vals",stat_Vals)
    return [stat_Vals,stat_Names];
    }

    async function uploadPost(file, caption) {
        const post_id = uuidv4();
        const [statVals, statNames] = getStats();
        console.log("hello");
        if(selectedFile !== null){
        const file_id = uuidv4();
        const { data, error } = await supabase.storage
            .from('media')
            .upload(file_id, file, {
                contentType: file.type
            });

        if (error) {
            console.error('Error uploading file:', error.message);
            return;
        }
        console.log("File Upload Successful");
        await supabase
            .from('file_upload_metadata')
            .insert({ id: file_id, post_id: post_id, user_id: userId, caption_text: caption})
            .throwOnError();
        await supabase
            .from('posts')
            .insert({ post_id: post_id, file_id: file_id, user_id: userId, post_type:3, caption_text: caption, rpe_value:rpeValue,  stat_value:statVals, stat_name:statNames })
            .throwOnError();
        setSelectedFile(null);
        setCaption('');
    } else{
        await supabase
            .from('posts')
            .insert({ post_id: post_id, user_id: userId, post_type:3, caption_text: caption, rpe_value:rpeValue, stat_value:statVals, stat_name:statNames })
            .throwOnError();
        setSelectedFile(null);
        setCaption('');
    }
    for (const stat of statOptions) {
        const checkbox = document.getElementById(stat);
        if (checkbox) {
            checkbox.checked = false;
        }
    }
 
    setPreviewUrl(null);
    setSelectedFile(null);
    setCaption('');
}



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
        <div className="inside">
        <div className="uploadContent">
            <button onClick={triggerFileInput}>
                Choose images to upload (PNG, JPG)
            </button>
            <input
                id="fileInput"
                hidden
                type="file"
                accept="image/*"
                name="fileUpload"
                onChange={handleFileUpload}
            />
            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
            {selectedFile && <div>Selected file: {selectedFile.name}</div>}
        </div>
        <div className="rpeInput">
            <input type="range" id="rpe" name="rpe" min="0" max="11" onChange={handleRpeInput} />
            <label for="rpe">RPE Value: {rpeValue}</label>
        </div>
        <br />
        <div className="imagePreview">
            {previewUrl && <img src={previewUrl} alt="Image Preview" style={{ maxHeight:"200px", marginTop: '10px' }} />}
        </div>
   
        <div >
            <textarea className="captionInput"
                type="text"
                id="textInput"
                name="caption"
                value={caption}
                onChange={handleCaptionInput}
            />
        </div>
        <div className="submitButton">
            <button onClick={handleSubmit}>Post</button>
        </div>
    </div>

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
