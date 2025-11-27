'use client';
import { Card, CardContent } from '@/components/ui/card';
import { UserProfile } from '@/features/user/types';
import { Briefcase, MapPin, MapPinHouse } from 'lucide-react';

interface BioCardProps {
  user: UserProfile;
}

export function BioCard({ user }: BioCardProps) {
  return (
    <Card className="py-3">
      <CardContent className="pt-6 py-1">
        <div className="flex justify-between items-start ">
          {user.bio && user.bio.trim() !== '' ? (
            <p className="italic pr-4">{user.bio}</p>
          ) : (
            <p className="italic pr-4 text-muted-foreground text-center">
              Chưa có tiểu sử
            </p>
          )}
        </div>

        {(user.currentLocation || user.work) && (
          <ul className="space-y-3 mt-4">
            {user.currentLocation && (
              <li className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <span>
                  Sống tại <strong>{user.currentLocation}</strong>
                </span>
              </li>
            )}
            {user.work && (
              <li className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <span>
                  Làm việc tại <strong>{user.work}</strong>
                </span>
              </li>
            )}
            {user.province && (
              <li className="flex items-center gap-3">
                <MapPinHouse className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <span>
                  Tỉnh/Thành phố <strong>{user.province.name}</strong>
                </span>
              </li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
