import PostCreatorManager from '../Post/create/PostCreatorManager';
import PostList from '../Post/list/PostList';
import StoriesContainer from '../story/StoryFeed';

function Feed() {
  return (
    <div className="bg-white w-[720px] mx-auto">
      <StoriesContainer />
      <PostCreatorManager />
      <PostList />
    </div>
  );
}

export default Feed;
