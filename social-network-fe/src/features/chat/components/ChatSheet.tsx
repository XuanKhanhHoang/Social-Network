'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ChatList } from './ChatList';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const ChatSheet = ({
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
          <SheetTitle>Tin nhắn</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          <ChatList onItemClick={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
};
