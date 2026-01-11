import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { blogService } from '../../services/blogService';

export interface Post {
  id: string;
  created_at: string;
  title: string;
  content: string;
  user_id: string;
  author_name?: string;
}

interface BlogsState {
  posts: Post[];
  currentPost: Post | null;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

const initialState: BlogsState = {
  posts: [],
  currentPost: null,
  currentPage: 1,
  totalPages: 1,
  loading: false,
  error: null,
};

// Async Thunks

export const fetchPosts = createAsyncThunk(
  'blogs/fetchPosts',
  async (params: { page: number; pageSize: number; query?: string; sortDesc?: boolean }, { rejectWithValue }) => {
    try {
      return await blogService.getPosts(params);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPostById = createAsyncThunk(
  'blogs/fetchPostById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await blogService.getPostById(id);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPost = createAsyncThunk(
  'blogs/createPost',
  async (post: { title: string; content: string; user_id: string; author_name: string }, { rejectWithValue }) => {
    try {
      return await blogService.createPost(post);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePost = createAsyncThunk(
  'blogs/updatePost',
  async ({ id, updates }: { id: string; updates: { title: string; content: string } }, { rejectWithValue }) => {
    try {
      return await blogService.updatePost(id, updates);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePost = createAsyncThunk(
  'blogs/deletePost',
  async (id: string, { rejectWithValue }) => {
    try {
      await blogService.deletePost(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const blogsSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {
    clearCurrentPost: (state) => {
        state.currentPost = null;
    },
    clearError: (state) => {
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.data;
        const total = action.payload.count;
        // Assuming pageSize is available in meta or state, but here we can't easily access the passed pageSize unless we store it.
        // Simplified calculation or relying on component to pass it.
        // Actually, we can just store the total count if needed, but the original slice stored totalPages.
        // Let's approximate or update how pagination works. 
        // Ideally the component calculates pages, or we calculate it here if we pass pageSize in the action meta, which we do.
        const pageSize = action.meta.arg.pageSize || 6;
        state.currentPage = action.meta.arg.page;
        state.totalPages = Math.max(1, Math.ceil(total / pageSize));
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Post By Id
      .addCase(fetchPostById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload);
        state.currentPost = action.payload;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Post
      .addCase(updatePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload;
        const index = state.posts.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Post
      .addCase(deletePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = state.posts.filter((post) => post.id !== action.payload);
        if (state.currentPost?.id === action.payload) {
            state.currentPost = null;
        }
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentPost, clearError } = blogsSlice.actions;
export default blogsSlice.reducer;
