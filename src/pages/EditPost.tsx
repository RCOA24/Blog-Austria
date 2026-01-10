import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import supabase from '../supabaseClient';
import { setLoading, setError } from '../features/blogs/blogsSlice';
import { toast } from 'react-toastify';

const EditPost = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isLoadingPost, setIsLoadingPost] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;
            setIsLoadingPost(true);
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('id', id)
                .single();

            if (data) {
                // Check authorization
                if (user && data.user_id !== user.id) {
                    toast.error('You are not authorized to edit this post.');
                    navigate('/'); // Not authorized
                    return;
                }
                setTitle(data.title);
                setContent(data.content);
            }
             if (error) {
                 console.error(error);
                 toast.error('Failed to load post.');
             }

            setIsLoadingPost(false);
        };

        fetchPost();
    }, [id, user, navigate]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !id) return;

        try {
            dispatch(setLoading(true));
            const { error } = await supabase
                .from('posts')
                .update({ title, content })
                .eq('id', id);

            if (error) throw error;
            toast.success('Post updated successfully');
            navigate('/');
        } catch (err: any) {
            dispatch(setError(err.message));
            toast.error(err.message || 'Failed to update post');
        } finally {
            dispatch(setLoading(false));
        }
    };

    if (isLoadingPost) return <div className="text-center mt-10">Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Edit Post</h1>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-2 border rounded h-40 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                    />
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update Post</button>
            </form>
        </div>
    );
};

export default EditPost;
