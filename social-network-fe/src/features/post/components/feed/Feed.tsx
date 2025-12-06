import PostCreator from '@/features/post/components/create/PostCreator';
import HomeFeed from './HomeFeed';

function Feed() {
  return (
    <div className="bg-white w-[720px] mx-auto pt-2">
      {/* <StoriesContainer /> */}
      <PostCreator />
      <HomeFeed />
    </div>
  );
}

export default Feed;
