import { SubUser } from 'src/schemas/sub-user.schema';

export interface CreateNotificationData {
  sender: SubUser;
  receiver: string;
  type: string;
  relatedId: string;
  relatedModel: string;
  message?: string;
}
