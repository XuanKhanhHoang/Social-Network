import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import SvgIcon from './svg-icon';
import { ReactionTargetType, ReactionType } from '@/lib/constants/enums';
import { useReaction } from '@/hooks/queries/useReaction';
import { reactionService } from '@/services/reaction';

const REACTIONS = [
  {
    key: ReactionType.LIKE,
    src: '/emoji/thumbs-up-fill-svgrepo-com.svg',
    label: 'Thích',
  },
  {
    key: ReactionType.LOVE,
    src: '/emoji/heart-svgrepo-com.svg',
    label: 'Yêu Thích',
  },
  {
    key: ReactionType.HAHA,
    src: '/emoji/happy-smile-svgrepo-com.svg',
    label: 'Haha',
  },
  {
    key: ReactionType.WOW,
    src: '/emoji/wow-svgrepo-com.svg',
    label: 'Wow',
  },
  {
    key: ReactionType.SAD,
    src: '/emoji/sad-tear-svgrepo-com.svg',
    label: 'Buồn',
  },
  {
    key: ReactionType.ANGRY,
    src: '/emoji/angry-svgrepo-com.svg',
    label: 'Tức giận',
  },
];

interface ReactionButtonProps {
  entityId: string;
  entityType?: ReactionTargetType;
  initialReaction?: ReactionType;
  initialCount?: number;
  showLabel?: boolean;
  showCount?: boolean;
  iconSize?: number;
  className?: string;
  btnClassName?: string;
  onReactionChange?: (
    reaction: ReactionType | undefined,
    count: number
  ) => void;
}

export default function ReactionButton({
  entityId,
  entityType = ReactionTargetType.POST,
  initialReaction,
  initialCount = 0,
  showLabel = false,
  showCount = true,
  iconSize = 20,
  className,
  btnClassName,
  onReactionChange,
}: ReactionButtonProps) {
  const [open, setOpen] = useState(false);
  const openTimer = useRef<NodeJS.Timeout | null>(null);
  const closeTimer = useRef<NodeJS.Timeout | null>(null);

  const { reactionFn, unReactionFn } = {
    reactionFn: reactionService.reaction,
    unReactionFn: reactionService.unReaction,
  };
  const {
    currentReaction,
    reactionCount,
    isLoading,
    toggleReaction,
    quickLike,
  } = useReaction({
    entityId,
    entityType,
    initialReaction,
    initialCount,
    onReactionChange,
    reactionFn,
    unReactionFn,
    debounceMs: 800,
  });

  useEffect(() => {
    return () => {
      if (openTimer.current) clearTimeout(openTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const handleEnter = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    openTimer.current = setTimeout(() => {
      setOpen(true);
    }, 500);
  }, []);

  const handleLeave = useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    closeTimer.current = setTimeout(() => {
      setOpen(false);
    }, 200);
  }, []);

  const handleReactionClick = useCallback(
    (reaction: ReactionType) => {
      toggleReaction(reaction);
      setOpen(false);

      if (openTimer.current) {
        clearTimeout(openTimer.current);
        openTimer.current = null;
      }
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
    },
    [toggleReaction]
  );

  const activeReaction = REACTIONS.find((r) => r.key === currentReaction);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div
        className={`inline-block ${className || ''}`}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={`
              rounded-md text-base hover:bg-muted flex items-center gap-1 
              transition-colors hover:shadow-none
              ${
                activeReaction
                  ? 'text-blue-600 hover:text-blue-700'
                  : 'text-muted-foreground hover:text-foreground'
              }
              ${isLoading ? 'opacity-70' : ''}
              ${btnClassName || 'px-3 py-1'}
            `}
            onClick={quickLike}
            disabled={isLoading}
          >
            {activeReaction ? (
              <SvgIcon
                src={activeReaction.src}
                alt={activeReaction.label}
                height={iconSize}
                width={iconSize}
              />
            ) : (
              <SvgIcon
                src="/emoji/thumbs-up-svgrepo-com.svg"
                alt="like"
                height={iconSize}
                width={iconSize}
              />
            )}
            {showLabel && (
              <span className="mx-1 select-none">
                {activeReaction?.label || 'Thích'}
              </span>
            )}
            {showCount && reactionCount > 0 && (
              <span className="text-sm">{reactionCount}</span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="start"
          sideOffset={10}
          className="
            w-auto px-1 py-0 bg-background/95 backdrop-blur-sm shadow-lg 
            border rounded-full animate-in fade-in slide-in-from-bottom-2 duration-200
          "
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div className="flex gap-2">
            {REACTIONS.map((reaction) => (
              <button
                key={reaction.key}
                onClick={() => handleReactionClick(reaction.key)}
                className={`
                  relative p-1 transition-all duration-200 
                  hover:scale-125 hover:-translate-y-1 
                  focus:outline-none focus:ring-0 focus:ring-offset-0 focus: 
                  rounded-full
                  ${currentReaction === reaction.key ? 'scale-110' : ''}
                  ${isLoading ? 'opacity-70' : ''}
                `}
                disabled={isLoading}
                title={reaction.label}
              >
                <SvgIcon
                  src={reaction.src}
                  alt={reaction.label}
                  height={24}
                  width={24}
                />
              </button>
            ))}
          </div>
        </PopoverContent>
      </div>
    </Popover>
  );
}
