'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { NotificationList } from './NotificationList';
import { useState } from 'react';
import { NotificationHeader } from './NotificationHeader';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const NotificationSheet = ({
  children,
  tooltip,
}: {
  children: React.ReactNode;
  tooltip?: string;
}) => {
  const [open, setOpen] = useState(false);

  const trigger = <SheetTrigger asChild>{children}</SheetTrigger>;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent side="right">{tooltip}</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}
      <SheetContent
        side="left"
        className="w-[400px] sm:w-[540px] p-0 flex flex-col gap-0"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Thông báo</SheetTitle>
        </SheetHeader>
        <NotificationHeader />
        <div className="flex-1 overflow-hidden">
          <NotificationList onItemClick={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
};
