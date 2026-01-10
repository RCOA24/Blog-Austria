import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { blogService } from '../services/blogService';
import type { Post } from '../features/blogs/blogsSlice';
import { Calendar, User, ArrowLeft, Edit2, Share2 } from 'lucide-react';
import { toast } from 'react-toastify';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';

const PostDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;
            try {
                const data = await blogService.getPostById(id);
                if (data) {
                    setPost(data);
                } else {
                    toast.error('Post not found');
                    navigate('/');
                }
            } catch (error) {
                console.error('Error fetching post:', error);
                toast.error('Failed to load post');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id, navigate]);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: post?.title,
                text: 'Check out this post on Simply Stated!',
                url: window.location.href,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.info('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!post) return null;

    const isAuthor = user?.id === post.user_id;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Navigation Back */}
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to posts
                </button>

                {/* Article Header */}
                <header className="mb-8">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <Calendar className="w-4 h-4 mr-2" />
                                <time dateTime={post.created_at}>
                                    {new Date(post.created_at).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </time>
                            </div>
                            {post.author_name && (
                                <div className="flex items-center text-gray-600 dark:text-gray-400">
                                    <User className="w-4 h-4 mr-2" />
                                    <span className="font-medium">{post.author_name}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleShare}
                                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
                                title="Share"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                            
                            {isAuthor && (
                                <Link
                                    to={`/edit-post/${post.id}`}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </Link>
                            )}
                        </div>
                    </div>
                </header>

                {/* Article Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none">
                    <MDEditor.Markdown source={post.content} />
                </div>

                {/* Article Footer */}
                <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Thanks for reading!
                        </p>
                    </div>
                </footer>
            </article>
        </div>
    );
};

export default PostDetail;
