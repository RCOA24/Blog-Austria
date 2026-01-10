import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import supabase from '../supabaseClient';
import { setPosts, setLoading, setError } from '../features/blogs/blogsSlice';

const Home = () => {
  const dispatch = useAppDispatch();
  const { posts, loading, error } = useAppSelector((state) => state.blogs);

  useEffect(() => {
    const fetchPosts = async () => {
      dispatch(setLoading(true));
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        dispatch(setError(error.message));
      } else {
        dispatch(setPosts(data || []));
      }
      dispatch(setLoading(false));
    };

    fetchPosts();
  }, [dispatch]);

  if (loading) return <div className="text-center mt-10">Loading posts...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Latest Blog Posts</h1>
      {posts.length === 0 ? (
        <p className="text-gray-600">No posts found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="text-gray-600 line-clamp-3">{post.content}</p>
              <div className="mt-4 text-sm text-gray-500">
                {new Date(post.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
