import supabase from '../supabaseClient';
import { type Post } from '../features/blogs/blogsSlice';

interface FetchPostsParams {
  page: number;
  pageSize: number;
  query?: string;
  sortDesc?: boolean;
}

interface FetchPostsResult {
  data: Post[];
  count: number;
}

export const blogService = {
  async getPosts({ page, pageSize, query, sortDesc = true }: FetchPostsParams): Promise<FetchPostsResult> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let builder = supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .range(from, to);

    if (query?.trim()) {
      const q = query.replace(/%/g, '\\%');
      builder = builder.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
    }

    builder = builder.order('created_at', { ascending: !sortDesc });

    const { data, count, error } = await builder;
    if (error) throw error;

    return { data: data || [], count: count || 0 };
  },

  async getPostById(id: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Post;
  },

  async createPost(post: { title: string; content: string; user_id: string; author_name: string }) {
    const { data, error } = await supabase
      .from('posts')
      .insert([post])
      .select()
      .single();

    if (error) throw error;
    return data as Post;
  },

  async updatePost(id: string, updates: { title: string; content: string }) {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Post;
  },

  async deletePost(id: string) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
