'use client';

import { useSearchParams, useRouter } from 'next/navigation';

import FriendRequestList from './lists/FriendRequestList';
import SentRequestList from './lists/SentRequestList';
import SuggestedFriendList from './lists/SuggestedFriendList';
import Sidebar from './sidebar/Sidebar';
import AllFriendsList from './lists/AllFriendsList';
import BlockedUserList from './lists/BlockedUserList';
import { useFriendRequests } from '@/hooks/friendship/useFriendship';
export default function FriendsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'home';
  const { data: friendRequests } = useFriendRequests();

  const navigateToTab = (tab: string) => {
    router.push(`/friends?tab=${tab}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'requests':
        return (
          <div className="space-y-8">
            <FriendRequestList />
            <SentRequestList />
          </div>
        );
      case 'suggestions':
        return <SuggestedFriendList />;
      case 'all':
        return <AllFriendsList />;
      case 'blocked':
        return <BlockedUserList />;
      case 'home':
      default:
        return (
          <div className="space-y-8">
            <FriendRequestList
              onSeeAll={() => navigateToTab('requests')}
              maxItems={4}
            />
            <SentRequestList
              onSeeAll={() => navigateToTab('requests')}
              maxItems={4}
            />
            <SuggestedFriendList
              onSeeAll={() => navigateToTab('suggestions')}
            />
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-white flex-1">
      <Sidebar requestCount={friendRequests?.data?.length} />
      <div className="flex-1 p-8 bg-white max-w-6xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
}
