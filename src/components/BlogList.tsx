import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import supabase from '../supabaseClient';
import { setPosts, setLoading, setError, setPagination } from '../features/blogs/blogsSlice';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const PAGE_SIZE = 6;

const BlogList = () => {
  const dispatch = useAppDispatch();
  const { posts, loading, error,totalPages } = useAppSelector((state) => state.blogs);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchPosts = async () => {
      dispatch(setLoading(true));
      
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) {
        dispatch(setError(error.message));
      } else {
        dispatch(setPosts(data || []));
        if (count !== null) {
          dispatch(setPagination({
            currentPage: page,
            totalPages: Math.ceil(count / PAGE_SIZE)
          }));
        }
      }
      dispatch(setLoading(false));
    };

    fetchPosts();
  }, [dispatch, page]);

  const handlePrevious = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {posts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-300 text-lg">No posts found.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article 
              key={post.id} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col"
            >
              <div className="p-6 flex-1">
                <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 leading-relaxed">
                  {post.content}
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4 mr-2" />
                <time dateTime={post.created_at}>
                  {new Date(post.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 pt-8">
          <button
            onClick={handlePrevious}
            disabled={page === 1}
            className={`
              flex items-center px-4 py-2 rounded-lg border font-medium transition-all duration-200
              ${page === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300 hover:border-gray-400 shadow-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
              }
            `}
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Previous
          </button>
          
          <span className="text-gray-600 dark:text-gray-300 font-medium">
            Page {page} of {totalPages}
          </span>
          
          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className={`
              flex items-center px-4 py-2 rounded-lg border font-medium transition-all duration-200
              ${page === totalPages 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300 hover:border-gray-400 shadow-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
              }
            `}
          >
            Next
            <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogList;
