import BlogList from '../components/BlogList';

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">Latest Blog Posts</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Discover stories, thinking, and expertise from writers on any topic.</p>
      </div>
      <BlogList />
    </div>
  );
};

export default Home;
