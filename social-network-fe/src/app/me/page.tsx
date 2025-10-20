'use client';

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Heart, MapPin, MessageCircle, Send } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import PostCreatorManager from '@/components/features/Post/create/PostCreatorManager';

// ------------------------------------------------------------------
// ĐỊNH NGHĨA TYPES (Giả lập)
// ------------------------------------------------------------------
interface UserData {
  id: string;
  username: string;
  name: string;
  friendCount: number;
  avatarUrl: string;
  coverUrl: string;
  bio: string;
  details: { icon: string; text: string }[];
  hasActiveStory: boolean;
}

interface PostData {
  id: string;
  author: {
    name: string;
    avatarUrl: string;
  };
  content: string;
  imageUrl: string | null;
}

// ------------------------------------------------------------------
// ĐỊNH NGHĨA COMPONENT CON TẠI CHỖ
// ------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap: { [key: string]: any } = {
  'map-pin': MapPin,
  heart: Heart,
  briefcase: Briefcase,
};

interface UserSidebarProps {
  user: UserData;
}

const UserSidebar: React.FC<UserSidebarProps> = ({ user }) => {
  return (
    // Cột trái sticky
    <aside className="md:col-span-1 md:sticky top-4 self-start space-y-6">
      {/* Card Giới thiệu */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-4">
            <p className="italic pr-4">{user.bio}</p>
            <Button variant="link" className="p-0 h-auto text-blue-500">
              Chỉnh sửa
            </Button>
          </div>
          <ul className="space-y-3">
            {user.details.map((item) => {
              const LucideIcon = iconMap[item.icon];
              return (
                <li key={item.text} className="flex items-center gap-3">
                  {LucideIcon && (
                    <LucideIcon className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span
                    dangerouslySetInnerHTML={{
                      __html: item.text.replace(
                        /(Hà Nội|Độc thân|Công ty XYZ)/g,
                        '<strong>$1</strong>'
                      ),
                    }}
                  />
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {/* Card Ảnh (Tóm tắt) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Ảnh</CardTitle>
          <Link href="/me/photos" passHref>
            <Button variant="link" className="p-0 h-auto text-blue-500">
              Xem tất cả
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Image
                key={i}
                src={`https://picsum.photos/150/150?random=${i + 1}`}
                alt={`Ảnh ${i + 1}`}
                width={150}
                height={150}
                className="rounded-md object-cover aspect-square"
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Card Bạn bè (Tóm tắt) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Bạn bè</CardTitle>
          <Link href="/me/friends" passHref>
            <Button variant="link" className="p-0 h-auto text-blue-500">
              Xem tất cả
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {user.friendCount} người bạn
          </p>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <Avatar className="w-16 h-16 mb-1">
                  <AvatarImage
                    src={`https://picsum.photos/80/80?random=${i + 20}`}
                  />
                  <AvatarFallback>B{i}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-center truncate w-full">
                  Tên Bạn {i}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
};

const UserPost: React.FC<{ post: PostData; isFirst?: boolean }> = ({
  post,
  isFirst = false,
}) => {
  return (
    <article className={`p-6 ${!isFirst ? 'border-t' : ''}`}>
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="w-8 h-8">
          <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
          <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="font-semibold">{post.author.name}</span>
      </div>
      <div className="space-y-4">
        <p>{post.content}</p>
        {post.imageUrl && (
          <Image
            src={post.imageUrl}
            alt="Nội dung bài viết"
            width={600}
            height={400}
            className="rounded-lg border object-cover w-full"
          />
        )}
      </div>
      <div className="flex gap-4 mt-4 text-muted-foreground">
        <Button variant="ghost" size="icon">
          <Heart className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <MessageCircle className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </article>
  );
};

// ------------------------------------------------------------------
// COMPONENT TRANG "/me" (Trang con)
// ------------------------------------------------------------------
export default function MePage() {
  // Giả lập fetch data
  const [user, setUser] = useState<UserData | null>(null);
  const [samplePosts, setSamplePosts] = useState<PostData[]>([]);

  useEffect(() => {
    // Giả lập fetch data
    const fetchedUser: UserData = {
      id: '1',
      username: 'me',
      name: 'Tên Người Dùng',
      friendCount: 204,
      avatarUrl: `https://picsum.photos/seed/me/168`,
      coverUrl: `https://picsum.photos/seed/me-cover/1200/350`,
      bio: "Like a kid, I'm trying to be better.",
      details: [
        { icon: 'map-pin', text: 'Sống tại Hà Nội' },
        { icon: 'heart', text: 'Độc thân' },
        { icon: 'briefcase', text: 'Làm việc tại Công ty XYZ' },
      ],
      hasActiveStory: true,
    };
    const fetchedPosts: PostData[] = [
      {
        id: 'p1',
        author: {
          name: fetchedUser.name,
          avatarUrl: `https://picsum.photos/40/40?random=7`,
        },
        content: 'Đây là trang /me (Bài viết)',
        imageUrl: 'https://picsum.photos/600/400?random=8',
      },
      {
        id: 'p2',
        author: {
          name: fetchedUser.name,
          avatarUrl: `https://picsum.photos/40/40?random=9`,
        },
        content: 'Sidebar đang dính (sticky) ở bên trái.',
        imageUrl: null,
      },
    ];
    setUser(fetchedUser);
    setSamplePosts(fetchedPosts);
  }, []);

  if (!user) {
    return <div>Đang tải...</div>;
  }

  return (
    // Đây là layout 2 cột (V6)
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Cột Trái (Sticky) */}
      <UserSidebar user={user} />

      {/* Cột Phải (Scroll) */}
      <section className="md:col-span-2 space-y-6">
        <PostCreatorManager />
        <Card>
          {samplePosts.map((post, index) => (
            <UserPost key={post.id} post={post} isFirst={index === 0} />
          ))}
        </Card>
      </section>
    </div>
  );
}
