import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { fetchPostById, updatePost, clearCurrentPost } from '../features/blogs/blogsSlice';
import { blogService } from '../services/blogService';
import { toast } from 'react-toastify';
import { Save, Eye, EyeOff, FileText, Hash, AlertCircle, CheckCircle, Image as ImageIcon, X, Trash2 } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';

const EditPost = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state: any) => state.auth);
    const post = useAppSelector((state) => state.blogs.currentPost);
    const loading = useAppSelector((state) => state.blogs.loading);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [newImage, setNewImage] = useState<File | null>(null);
    const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
    const [isImageRemoved, setIsImageRemoved] = useState(false);
    
    const [isPreview, setIsPreview] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{title?: string; content?: string}>({});
    
    // Track initialized post ID to prevent overwriting user edits on re-renders
    const initializedRef = React.useRef<string | null>(null);

    // Fetch post data
    useEffect(() => {
        if (id) {
             dispatch(fetchPostById(id));
        }
        return () => {
            dispatch(clearCurrentPost());
            initializedRef.current = null;
        };
    }, [id, dispatch]);

    // Clean up object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (newImagePreview) {
                URL.revokeObjectURL(newImagePreview);
            }
        };
    }, [newImagePreview]);

    // Populate form and Check authorization
    useEffect(() => {
        if (post && post.id !== initializedRef.current) {
            setTitle(post.title);
            setContent(post.content);
            setCurrentImageUrl(post.image_url || null);
            setNewImage(null);
            setNewImagePreview(null);
            setIsImageRemoved(false);
            
            initializedRef.current = post.id;

            if (user && post.user_id !== user.id) {
                toast.error('You are not authorized to edit this post.');
                navigate('/');
            }
        }
    }, [post, user, navigate]);

    const validateForm = () => {
        const errors: {title?: string; content?: string} = {};
    
        if (!title.trim()) {
          errors.title = 'Title is required';
        } else if (title.length < 3) {
          errors.title = 'Title must be at least 3 characters';
        } else if (title.length > 200) {
          errors.title = 'Title must be less than 200 characters';
        }
    
        if (!content.trim()) {
          errors.content = 'Content is required';
        } else if (content.length < 10) {
          errors.content = 'Content must be at least 10 characters';
        }
    
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleContentImageUpload = React.useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            toast.info('Uploading image...', { autoClose: false, toastId: 'uploading' });
            const url = await blogService.uploadImage(file);
            toast.dismiss('uploading');
            toast.success('Image uploaded!');
            setContent(prev => prev + `\n![Image](${url})\n`);
        } catch (error) {
            toast.dismiss('uploading');
            toast.error('Failed to upload image');
            console.error(error);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user || !id) return;

        if (!validateForm()) {
            toast.warn('Please fix the validation errors');
            return;
        }

        try {
            setIsSubmitting(true);
            setSubmitError(null);

            let imageUrlToUpdate = undefined; 

            if (isImageRemoved) {
                 imageUrlToUpdate = null; 
            } else if (newImage) {
                try {
                   imageUrlToUpdate = await blogService.uploadImage(newImage);
                } catch (err) {
                    toast.error('Failed to upload new image. Changes preserved without image update.');
                    console.error(err);
                    setIsSubmitting(false); 
                    return; 
                }
            }
            
            const updates: { title?: string; content?: string; image_url?: string } = {
                 title: title.trim(),
                 content: content.trim()
            };
            
            if (isImageRemoved || newImage) {
                updates.image_url = (imageUrlToUpdate as unknown) as string; 
            }

            const resultAction = await dispatch(updatePost({ id, updates }));
            
            if (updatePost.fulfilled.match(resultAction)) {
                toast.success('Post updated successfully');
                navigate('/');
            } else if (updatePost.rejected.match(resultAction)) {
                const msg = (resultAction.payload as string) || 'Failed to update post';
                setSubmitError(msg);
                toast.error(msg);
            }

        } catch (err: unknown) {
             console.error(err);
             toast.error('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    const charCount = content.length;

    if (loading && !post) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading post...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <FileText className="h-8 w-8 text-blue-600" />
                                Edit Post
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Update your content
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsPreview(!isPreview)}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
                            >
                                {isPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                {isPreview ? 'Edit' : 'Preview'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-gray-900 dark:text-white">
                            {/* Form Header */}
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <h2 className="text-lg font-semibold">
                                    {isPreview ? 'Preview Mode' : 'Edit Your Post'}
                                </h2>
                            </div>

                            {/* Form Content */}
                            <div className="p-6">
                                {submitError && (
                                    <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-3">
                                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                        {submitError}
                                    </div>
                                )}

                                {!isPreview ? (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Title Field */}
                                        <div>
                                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Post Title *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="title"
                                                    type="text"
                                                    value={title}
                                                    onChange={(e) => {
                                                        setTitle(e.target.value);
                                                        if (validationErrors.title) {
                                                            setValidationErrors(prev => ({ ...prev, title: undefined }));
                                                        }
                                                    }}
                                                    className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                                                        validationErrors.title
                                                            ? 'border-red-300 dark:border-red-600'
                                                            : 'border-gray-300 dark:border-gray-600'
                                                    }`}
                                                    placeholder="Enter an engaging title for your post..."
                                                    maxLength={200}
                                                />
                                                <div className="absolute right-3 top-3 text-sm text-gray-400 dark:text-gray-500">
                                                    {title.length}/200
                                                </div>
                                            </div>
                                            {validationErrors.title && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                    <AlertCircle className="h-4 w-4" />
                                                    {validationErrors.title}
                                                </p>
                                            )}
                                        </div>

                                        {/* Cover Image Field */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Cover Image
                                            </label>
                                            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                                                {/* Logic for displaying image area */}
                                                {(newImagePreview || (currentImageUrl && !isImageRemoved)) ? (
                                                    <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden group">
                                                        <img 
                                                            src={newImagePreview || currentImageUrl || ''} 
                                                            alt="Post cover" 
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                            <label className="cursor-pointer p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors" title="Change Image">
                                                                <ImageIcon className="h-5 w-5" />
                                                                <input 
                                                                    type="file" 
                                                                    accept="image/*"
                                                                    className="hidden"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            setNewImage(file);
                                                                            setNewImagePreview(URL.createObjectURL(file));
                                                                            setIsImageRemoved(false);
                                                                        }
                                                                    }}
                                                                />
                                                            </label>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (newImage) {
                                                                        // Cancel new image upload
                                                                        setNewImage(null);
                                                                        setNewImagePreview(null);
                                                                        // If we had an old one, restoration depends on !isImageRemoved
                                                                        // If we just selected new over old, we revert to old.
                                                                    } else {
                                                                        // Removing existing image
                                                                        setIsImageRemoved(true);
                                                                    }
                                                                }}
                                                                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                                                title="Remove Image"
                                                            >
                                                                {newImage ? <X className="h-5 w-5" /> : <Trash2 className="h-5 w-5" />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all relative">
                                                        <input 
                                                            type="file" 
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    setNewImage(file);
                                                                    setNewImagePreview(URL.createObjectURL(file));
                                                                    setIsImageRemoved(false);
                                                                }
                                                            }}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        />
                                                        <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {currentImageUrl ? 'Undo remove or upload new image' : 'Click or drag to upload cover image'}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            {isImageRemoved && currentImageUrl && (
                                                <p className="mt-2 text-sm text-orange-600 dark:text-orange-400 flex items-center gap-1">
                                                    <AlertCircle className="h-4 w-4" />
                                                    Existing image will be removed on save
                                                </p>
                                            )}
                                        </div>

                                        {/* Content Field */}
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Post Content *
                                                </label>
                                                <label className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1">
                                                    <ImageIcon className="h-4 w-4" />
                                                    <span>Insert Image</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleContentImageUpload}
                                                    />
                                                </label>
                                            </div>
                                            <div className="relative">
                                                <MDEditor
                                                    value={content}
                                                    onChange={(val) => {
                                                        setContent(val || '');
                                                        if (validationErrors.content) {
                                                            setValidationErrors(prev => ({ ...prev, content: undefined }));
                                                        }
                                                    }}
                                                    preview="edit"
                                                    hideToolbar={false}
                                                    visibleDragbar={false}
                                                    className={`w-full border rounded-lg ${
                                                        validationErrors.content
                                                            ? 'border-red-300 dark:border-red-600'
                                                            : 'border-gray-300 dark:border-gray-600'
                                                    }`}
                                                />
                                                <div className="absolute right-3 bottom-3 text-sm text-gray-400 dark:text-gray-500 flex items-center gap-4 z-10">
                                                    <span className="flex items-center gap-1">
                                                        <Hash className="h-3 w-3" />
                                                        {wordCount} words
                                                    </span>
                                                    <span>{charCount} chars</span>
                                                </div>
                                            </div>
                                            {validationErrors.content && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                    <AlertCircle className="h-4 w-4" />
                                                    {validationErrors.content}
                                                </p>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/')}
                                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        Updating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4" />
                                                        Update Post
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    /* Preview Mode */
                                    <div className="space-y-6">
                                        {(newImagePreview || (currentImageUrl && !isImageRemoved)) && (
                                            <div className="w-full h-48 sm:h-64 rounded-xl overflow-hidden mb-6">
                                                <img 
                                                    src={newImagePreview || currentImageUrl || ''} 
                                                    alt="Cover" 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        {title && (
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                                    {title}
                                                </h3>
                                            </div>
                                        )}
                                        {content ? (
                                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                                                <MDEditor.Markdown source={content} />
                                            </div>
                                        ) : (
                                            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                                                <FileText className="mx-auto h-16 w-16 mb-4 text-gray-300 dark:text-gray-600" />
                                                <p className="text-lg">No content to preview</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Writing Tips */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                Edit Tips
                            </h3>
                            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    Use Markdown for formatting (bold, italic, links, etc.)
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    Check for types and grammar
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    Preview changes before saving
                                </li>
                            </ul>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Post Statistics
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Words</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{wordCount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Characters</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{charCount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Title Length</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{title.length}/200</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Reading Time</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        ~{Math.ceil(wordCount / 200)} min
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditPost;
