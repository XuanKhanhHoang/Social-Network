import PostCreatorManager from '../Post/create/Manager';
import PostList from '../Post/list/List';
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
