
export default async function FetchPostData(session, supabase, postUserIds) {
    try {
        const userId = session.id
        // Fetch Post Metadata
        const { data: likedPostsArray, error: likedPostsError } = await supabase
            .from('profiles')
            .select('liked_post_id')
            .eq('id', userId);

        if (likedPostsError) throw likedPostsError;

        const likedPosts = likedPostsArray.reduce((acc, item) => {
            if (item.liked_post_id) {
                return acc.concat(item.liked_post_id);
            }
            return acc;
        }, []);


        const { data: postMetadata, error: postMetadataError } = await supabase
            .from('posts')
            .select()
            .in('user_id', postUserIds);

        if (postMetadataError) throw postMetadataError;

        // Sort metadata by creation date (latest first)
        const sortedMetadata = postMetadata.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Define Array of Post ids
        const ids = sortedMetadata.map(item => item.post_id);
        const fileIds = sortedMetadata.map(item => item.file_id);

        // Fetch Usernames
        const { data: usernameArray, error: usernameError } = await supabase
            .from('profiles')
            .select('id, username, liked_post_id')

        if (usernameError) throw usernameError;

        const usernamesMap = usernameArray.reduce((map, item) => {
            map[item.id] = item.username;
            return map;
        }, {});

        // Fetch Comments
        const { data: commentsArray, error: commentsError } = await supabase
            .from('comments')
            .select('post_id, comment_text, author_id, created_at')
            .in('post_id', ids);

        if (commentsError) throw commentsError;

        const commentsMap = {};
        for (const com of commentsArray) {
            const { post_id, comment_text, author_id, created_at } = com;
            const authorName = usernamesMap[author_id];
            if (!commentsMap[post_id]) {
                commentsMap[post_id] = [];
            }
            commentsMap[post_id].push([comment_text, authorName, created_at]);
        }

        // Fetch Signed URLs
        const { data: urlData, error: urlError } = await supabase
            .storage
            .from('media')
            .createSignedUrls(fileIds, 60);

        if (urlError) throw urlError;

        const { data: pfpArray, error: ppFileError } = await supabase
            .from('avatars')
            .select('user_id, file_name')
            .throwOnError();
        console.log("pfparray",pfpArray)
        const pfpMap = new Map();

        if (pfpArray) {
             pfpArray.forEach(async item => { //(item.user_id, item.file_name)
                const { data: signedUrl, error: signedUrlError } = await supabase
                    .storage
                    .from('media')
                    .createSignedUrl(`/avatars/${item.file_name}`, 60);
                if (signedUrlError) {
                    console.error("Error creating signed URL:", signedUrlError);
                } else {
                    pfpMap[item.user_id] = signedUrl.signedUrl;
                }
                console.log("signedurl",signedUrl);
            })
        }
        console.log("pfpMap",pfpMap);
        const { data: defaultpfpUrl, error: signedUrlError } = await supabase
            .storage
            .from('media')
            .createSignedUrl(`/avatars/default.png`, 60);

        if (signedUrlError) {
            console.error("Error creating signed URL:", signedUrlError);
        }
        const defaultpfp = defaultpfpUrl.signedUrl;
        
        // Format url data into map 
        const urlMap = Object.fromEntries(urlData.map(item => [item.path, item.signedUrl]));
        console.log("urlmap", urlMap);

        // Combine and Send Data
        const combinedData = sortedMetadata.map((item, index) => ({
            user_id: item.user_id,
            post_id: item.post_id,
            signedUrl: urlMap[item.file_id],
            userpfp: pfpMap[item.user_id] || defaultpfp,
            username: usernamesMap[item.user_id] || '',
            caption: item.caption_text,
            timestamp: item.created_at,
            title: item.title_text,
            rpe: item.rpe_value,
            post_type: item.post_type,
            likes: item.like_count,
            stat_value: item.stat_value,
            stat_name: item.stat_name,
            liked: likedPosts.includes(item.post_id),
            comments: commentsMap[item.post_id] || [],
            likedPosts: likedPosts || [],
        }));
        console.log("combined Data", combinedData);

        return combinedData;

    } catch (error) {
        console.error('Error fetching combined data:', error);
        return null;
    }
}