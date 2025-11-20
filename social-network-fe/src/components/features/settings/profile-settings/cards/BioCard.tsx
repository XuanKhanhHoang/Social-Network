import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BioCardProps {
  bio: string;
  setBio: (val: string) => void;
  work: string;
  setWork: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
}

export function BioCard({
  bio,
  setBio,
  work,
  setWork,
  location,
  setLocation,
}: BioCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin chi tiết</CardTitle>
        <CardDescription>
          Thông tin này sẽ được hiển thị công khai trên trang cá nhân của bạn
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="bio">Tiểu sử</Label>
          <Textarea
            id="bio"
            placeholder="Nói gì đó về bạn..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-sm text-muted-foreground">
            {bio.length}/500 ký tự
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="work">Nơi làm việc</Label>
            <Input
              id="work"
              placeholder="Làm việc tại..."
              value={work}
              onChange={(e) => setWork(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Nơi sống</Label>
            <Input
              id="location"
              placeholder="Sống tại..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
