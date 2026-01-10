import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import supabase from '../supabaseClient';
import { setLoading, setError } from '../features/blogs/blogsSlice';
import { toast } from 'react-toastify';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  // We can use local loading state to avoid flickering global lists or confusing errors
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      const msg = 'You must be logged in to create a post.';
      setSubmitError(msg);
      toast.error(msg);
      return;
    }

    if (!title.trim() || !content.trim()) {
      const msg = 'Title and content are required.';
      setSubmitError(msg);
      toast.warn(msg);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      // Dispatching global loading if you prefer, but local is often better for forms
      dispatch(setLoading(true));

      const { error } = await supabase
        .from('posts')
        .insert([
          {
            title,
            content,
            user_id: user.id,
          },
        ])
        .select();

      if (error) throw error;

      toast.success('Post created successfully!');
      // Successful - navigate home
      // We don't need to manually fetch here because Home page useEffect will run on mount
      navigate('/');
      
    } catch (err: any) {
      console.error('Error creating post:', err);
      const msg = err.message || 'Failed to create post';
      setSubmitError(msg);
      dispatch(setError(err.message));
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white transition-colors">Create New Post</h1>
      
      {submitError && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 px-4 py-3 rounded">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors duration-300">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            placeholder="Enter post title"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-y"
            placeholder="Write your post content here..."
            required
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mr-4 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </form>
    </div>
  );
};


export default CreatePost;
