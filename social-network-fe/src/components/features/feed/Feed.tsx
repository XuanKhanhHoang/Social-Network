import PostCreator from '../post/create/PostCreator';
import StoriesContainer from '../story/StoryFeed';
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
