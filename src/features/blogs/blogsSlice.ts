import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Post {
  id: string;
  created_at: string;
  title: string;
  content: string;
  user_id: string;
}

interface BlogsState {
  posts: Post[];
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

const initialState: BlogsState = {
  posts: [],
  currentPage: 1,
  totalPages: 1,
  loading: false,
  error: null,
};

const blogsSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload;
    },
    setPagination: (state, action: PayloadAction<{ currentPage: number; totalPages: number }>) => {
      state.currentPage = action.payload.currentPage;
      state.totalPages = action.payload.totalPages;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    deletePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter((post) => post.id !== action.payload);
    },
  },
});

export const { setPosts, setPagination, setLoading, setError, deletePost } = blogsSlice.actions;
export default blogsSlice.reducer;
