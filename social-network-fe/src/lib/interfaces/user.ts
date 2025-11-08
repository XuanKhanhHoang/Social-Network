export function transformToUserSummary(
  user: unknown & {
    _id: string;
    username: string;
    avatar?: string;
    firstName: string;
    lastName: string;
  }
): UserSummary {
  return {
    id: user._id,
    username: user.username,
    avatar: user.avatar,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}
export function transformToUserSummaryWithEmail(
  user: unknown & {
    _id: string;
    username: string;
    avatar?: string;
    firstName: string;
    lastName: string;
    email: string;
  }
): UserSummaryWithEmail {
  return {
    ...transformToUserSummary(user),
    email: user.email,
  };
}
export interface UserSummary {
  id: string;
  username: string;
  avatar?: string;
  firstName: string;
  lastName: string;
}
export interface UserSummaryWithEmail extends UserSummary {
  email: string;
}
