import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { fetchPosts } from '../features/blogs/blogsSlice';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PostItem from './PostItem';

const DEFAULT_PAGE_SIZE = 6;

const BlogList = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Select specific fields to minimize re-renders
  const posts = useAppSelector((s) => s.blogs.posts);
  const loading = useAppSelector((s) => s.blogs.loading);
  const totalPages = useAppSelector((s) => s.blogs.totalPages);

  const page = parseInt(searchParams.get('page') || '1');
  const query = searchParams.get('q') || '';
  const sortDesc = searchParams.get('sort') !== 'asc'; // default to true (desc) unless 'asc'

  // Local state for pageSize, or simple param? Let's keep simpler local for now or param
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    dispatch(fetchPosts({ page, pageSize, query, sortDesc }));
  }, [dispatch, page, pageSize, query, sortDesc]);

  const updateParams = (updates: Partial<{ page: string; q: string; sort: string }>) => {
      const newParams = new URLSearchParams(searchParams);
      if (updates.page) newParams.set('page', updates.page);
      if (updates.q !== undefined) {
          if (updates.q) newParams.set('q', updates.q);
          else newParams.delete('q');
          // Reset page on new query
          newParams.set('page', '1');
      }
      if (updates.sort) newParams.set('sort', updates.sort);
      setSearchParams(newParams);
  };

  const handlePrevious = () => {
      const newPage = Math.max(1, page - 1);
      updateParams({ page: newPage.toString() });
  };
  const handleNext = () => {
      const newPage = Math.min(totalPages, page + 1);
      updateParams({ page: newPage.toString() });
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3">
          <label htmlFor="search" className="sr-only">Search posts</label>
          <input
            id="search"
            value={query}
            onChange={(e) => updateParams({ q: e.target.value })}
            placeholder="Search by title or content..."
            className="w-full sm:w-80 px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />

          <select
            aria-label="Sort order"
            value={sortDesc ? 'desc' : 'asc'}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="desc">Newest</option>
            <option value="asc">Oldest</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">Showing</div>
          <select
            aria-label="Items per page"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              updateParams({ page: '1' });
            }}
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
            {posts.map((post, index) => (
              <PostItem key={post.id} post={post} priority={index === 0} />
            ))}
          </div>
        )}
      </div>

      <footer className="flex flex-col items-center justify-between gap-6 py-6 border-t border-gray-100 dark:border-gray-800 mt-8">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, (totalPages || 1) * pageSize)} of {(totalPages || 1) * pageSize}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => updateParams({ page: '1' })}
            disabled={page === 1}
            aria-label="First page"
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            First
          </button>

          <button
            onClick={handlePrevious}
            disabled={page === 1}
            aria-label="Previous page"
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-all shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 px-4 min-w-[70px] text-center">
             Page {page} of {totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={page === totalPages}
            aria-label="Next page"
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-all shadow-sm"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => updateParams({ page: totalPages.toString() })}
            disabled={page === totalPages}
            aria-label="Last page"
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Last
          </button>
        </div>
      </footer>
    </section>
  );
};

export default BlogList;
