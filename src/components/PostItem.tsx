import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { deletePost, type Post } from '../features/blogs/blogsSlice';
import { Calendar, Edit2, Trash2, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { blogService } from '../services/blogService';

interface PostItemProps {
  post: Post;
  priority?: boolean;
}

const PostItem: React.FC<PostItemProps> = ({ post, priority = false }) => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthor = user?.id === post.user_id;

  // Helper to extract first image and strip markdown
  const processContent = (content: string) => {
    // Extract first image
    const imageMatch = content.match(/!\[.*?\]\((.*?)\)/);
    const coverImage = imageMatch ? imageMatch[1] : null;

    // Strip markdown for preview text
    const plainText = content
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links but keep text
      .replace(/#{1,6}\s?/g, '') // Remove headers
      .replace(/(\*\*|__)(.*?)\1/g, '$2') // Remove bold
      .replace(/(\*|_)(.*?)\1/g, '$2') // Remove italic
      .replace(/`{3}[\s\S]*?`{3}/g, '') // Remove code blocks
      .replace(/`(.+?)`/g, '$1') // Remove inline code
      .replace(/>\s?/g, '') // Remove blockquotes
      .trim();

    return { coverImage, plainText };
  };

  const { coverImage, plainText } = useMemo(() => processContent(post.content || ''), [post.content]);

  const handleDelete = () => {
    toast(
      ({ closeToast }) => (
        <div className="min-w-[200px]">
          <p className="mb-3 text-sm font-medium text-gray-800">
            Are you sure you want to delete this post?
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={closeToast}
              className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                closeToast();
                setIsDeleting(true);
                try {
                  await blogService.deletePost(post.id);

                  dispatch(deletePost(post.id));
                  toast.success('Post deleted successfully');
                } catch (error) {
                  console.error('Error deleting post:', error);
                  toast.error('Failed to delete post');
                } finally {
                  setIsDeleting(false);
                }
              }}
              className="px-3 py-1.5 text-xs rounded bg-red-600 text-white hover:bg-red-700 transition shadow-sm"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        hideProgressBar: true,
      }
    );
  };

  const handleEdit = () => {
    navigate(`/edit-post/${post.id}`);
  };

  return (
    <article 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col h-full hover:-translate-y-1"
    >
      {coverImage && (
        <div className="h-48 w-full border-b border-gray-200 dark:border-gray-700 overflow-hidden relative bg-gray-100 dark:bg-gray-700">
          <img 
            src={coverImage} 
            alt={post.title}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            width={600}
            height={400} 
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500 cursor-pointer"
            onClick={() => navigate(`/post/${post.id}`)}
          />
        </div>
      )}

      <div className="p-6 flex-1 cursor-pointer" onClick={() => navigate(`/post/${post.id}`)}>
        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          {post.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 leading-relaxed whitespace-pre-wrap">
          {plainText}
        </p>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <time dateTime={post.created_at}>
              {new Date(post.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </time>
          </div>
          {post.author_name && (
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {post.author_name}
              </span>
            </div>
          )}
        </div>

        {isAuthor && (
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={handleEdit}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
              title="Edit Post"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors disabled:opacity-50"
              title="Delete Post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default PostItem;
