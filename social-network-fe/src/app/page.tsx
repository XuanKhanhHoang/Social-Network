import LeftSidebar from '@/components/features/layout/LeftSideBar';
import RightSidebar from '@/components/features/layout/RightSideBar';
import Feed from '@/components/features/feed/Feed';
import { FeedProvider } from '@/components/features/feed/FeedContext';

const SocialMediaUI = async () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-screen mx-auto flex">
        <FeedProvider>
          <LeftSidebar />
          <Feed />
        </FeedProvider>
        <RightSidebar />
      </div>
    </div>
  );
};

export default SocialMediaUI;
