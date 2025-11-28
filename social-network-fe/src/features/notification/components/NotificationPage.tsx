import { NotificationHeader } from './NotificationHeader';
import { NotificationList } from './NotificationList';

export const NotificationPage = () => {
  return (
    <div className="max-w-[720px] mx-auto py-6 px-4 w-full border-x">
      <NotificationHeader />
      <NotificationList />
    </div>
  );
};
