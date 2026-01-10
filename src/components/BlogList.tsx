import { useEffect, useMemo, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import supabase from '../supabaseClient';
import { setPosts, setLoading, setError, setPagination } from '../features/blogs/blogsSlice';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PostItem from './PostItem';

const DEFAULT_PAGE_SIZE = 6;

const BlogList = () => {
  const dispatch = useAppDispatch();
  const { posts, loading,totalPages } = useAppSelector((s) => s.blogs);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [query, setQuery] = useState('');
  const [sortDesc, setSortDesc] = useState(true);

  const fromTo = useMemo(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    return { from, to };
  }, [page, pageSize]);

  useEffect(() => {
    const fetchPosts = async () => {
      dispatch(setLoading(true));

      try {
        let builder = supabase
          .from('posts')
          .select('*', { count: 'exact' })
          .range(fromTo.from, fromTo.to);

        // server-side search across title/content if query provided
        if (query.trim()) {
          const q = query.replace(/%/g, '\\%');
          builder = builder.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
        }

        builder = builder.order('created_at', { ascending: !sortDesc });

        const { data, count, error: err } = await builder;

        if (err) {
          dispatch(setError(err.message));
        } else {
          dispatch(setPosts(data || []));
          const total = count ?? (data ? data.length : 0);
          dispatch(setPagination({ currentPage: page, totalPages: Math.max(1, Math.ceil(total / pageSize)) }));
        }
      } catch (fetchErr: any) {
        dispatch(setError(fetchErr.message || 'Failed to fetch posts'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchPosts();
  }, [dispatch, page, pageSize, query, sortDesc, fromTo.from, fromTo.to]);

  // reset page when pageSize or query changes
  useEffect(() => setPage(1), [pageSize, query]);

  const handlePrevious = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <section className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label htmlFor="search" className="sr-only">Search posts</label>
          <input
            id="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or content..."
            className="w-full sm:w-80 px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />

          <select
            aria-label="Sort order"
            value={sortDesc ? 'desc' : 'asc'}
            onChange={(e) => setSortDesc(e.target.value === 'desc')}
            className="px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="desc">Newest</option>
            <option value="asc">Oldest</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">Showing</div>
          <select
            aria-label="Items per page"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
          </select>

          <div className="text-sm text-gray-600 dark:text-gray-300">
            Page {page} / {totalPages}
          </div>
        </div>
      </header>

      <div className="min-h-[200px]">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: pageSize }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-xl p-6 h-64 shadow-md border border-gray-200 dark:border-gray-700" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No posts found</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Try adjusting your search or create the first post.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostItem key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      <footer className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {/* compute visible range */}
          Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, (totalPages || 1) * pageSize)} of {(totalPages || 1) * pageSize}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            aria-label="First page"
            className="px-3 py-2 rounded-md border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-50"
          >
            First
          </button>

          <button
            onClick={handlePrevious}
            disabled={page === 1}
            aria-label="Previous page"
            className="px-3 py-2 rounded-md border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-50 flex items-center gap-2"
          >
            <ChevronLeft /> Prev
          </button>

          <div className="text-sm text-gray-700 dark:text-gray-200">Page {page} of {totalPages}</div>

          <button
            onClick={handleNext}
            disabled={page === totalPages}
            aria-label="Next page"
            className="px-3 py-2 rounded-md border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-50 flex items-center gap-2"
          >
            Next <ChevronRight />
          </button>

          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            aria-label="Last page"
            className="px-3 py-2 rounded-md border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-50"
          >
            Last
          </button>
        </div>
      </footer>
    </section>
  );
};

export default BlogList;
