import PostCreatorManager from '../post/create/Manager';
import StoriesContainer from '../story/StoryFeed';
import HomeFeed from './HomeFeed';

function Feed() {
  return (
    <div className="bg-white w-[720px] mx-auto">
      <StoriesContainer />
      <PostCreatorManager />
      <HomeFeed />
    </div>
  );
}

export default Feed;
