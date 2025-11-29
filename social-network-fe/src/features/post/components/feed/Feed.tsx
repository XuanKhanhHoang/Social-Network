import PostCreator from '@/features/post/components/create/PostCreator';
import StoriesContainer from '@/features/story/components/StoryFeed';
import HomeFeed from './HomeFeed';

function Feed() {
  return (
    <div className="bg-white w-[720px] mx-auto">
      <StoriesContainer />
      <PostCreator />
      <HomeFeed />
    </div>
  );
}

export default Feed;
