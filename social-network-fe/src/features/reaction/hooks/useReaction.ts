import { useState, useRef, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { toast } from 'sonner';
import { ReactionTargetType, ReactionType } from '@/lib/constants/enums';

interface UseReactionOptions {
  entityId: string;
  entityType: ReactionTargetType;
  initialReaction: ReactionType | null;
  initialCount?: number;
  onReactionChange?: (
    newReaction: ReactionType | null,
    oldReaction: ReactionType | null
  ) => void;
  reactionFn: (
    id: string,
    reaction: ReactionType,
    reactionTargetType: ReactionTargetType
  ) => Promise<unknown>;
  unReactionFn: (
    id: string,
    reactionTargetType: ReactionTargetType
  ) => Promise<unknown>;
  debounceMs?: number;
}

interface ReactionState {
  currentReaction: ReactionType | null;
  reactionCount: number;
}

export function useReaction({
  entityId,
  entityType,
  initialReaction,
  initialCount = 0,
  onReactionChange,
  reactionFn,
  unReactionFn,
  debounceMs = 800,
}: UseReactionOptions) {
  const [state, setState] = useState<ReactionState>({
    currentReaction: initialReaction,
    reactionCount: initialCount,
  });

  const pendingReactionRef = useRef<ReactionType | null>(initialReaction);
  const lastSyncedReactionRef = useRef<ReactionType | null>(initialReaction);

  const isMountedRef = useRef(true);

  const syncMutation = useMutation({
    mutationFn: async (targetReaction: ReactionType | null) => {
      if (targetReaction === null) {
        await unReactionFn(entityId, entityType);
      } else {
        await reactionFn(entityId, targetReaction, entityType);
      }
      return targetReaction;
    },
    onSuccess: (targetReaction) => {
      if (isMountedRef.current) {
        lastSyncedReactionRef.current = targetReaction;
      }
    },
    onError: (error) => {
      if (isMountedRef.current) {
        const lastSynced = lastSyncedReactionRef.current;
        const countDiff = calculateCountChange(
          state.currentReaction,
          lastSynced
        );

        setState((prev) => ({
          currentReaction: lastSynced,
          reactionCount: Math.max(0, prev.reactionCount + countDiff),
        }));

        pendingReactionRef.current = lastSynced;

        toast.error(`Không thể cập nhật cảm xúc. Vui lòng thử lại!`);
        console.error(`${entityType} reaction error:`, error);
      }
    },
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSync = useCallback(
    debounce((reaction: ReactionType | null) => {
      if (!isMountedRef.current) return;

      if (reaction !== lastSyncedReactionRef.current) {
        syncMutation.mutate(reaction);
      }
    }, debounceMs),
    [entityId, debounceMs]
  );

  const calculateCountChange = (
    oldReaction: ReactionType | null,
    newReaction: ReactionType | null
  ): number => {
    if (!oldReaction && newReaction) return 1;
    if (oldReaction && !newReaction) return -1;
    return 0;
  };

  const handleReaction = useCallback(
    (reaction: ReactionType | null) => {
      const countChange = calculateCountChange(state.currentReaction, reaction);
      const newCount = Math.max(0, state.reactionCount + countChange);

      setState({
        currentReaction: reaction,
        reactionCount: newCount,
      });
      pendingReactionRef.current = reaction;

      debouncedSync.cancel();
      debouncedSync(reaction);

      onReactionChange?.(reaction || null, state.currentReaction || null);
    },
    [state, debouncedSync, onReactionChange]
  );

  const toggleReaction = useCallback(
    (reaction: ReactionType) => {
      const newReaction = state.currentReaction === reaction ? null : reaction;
      handleReaction(newReaction);
    },
    [state.currentReaction, handleReaction]
  );

  const quickLike = useCallback(() => {
    toggleReaction(ReactionType.LIKE);
  }, [toggleReaction]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      debouncedSync.cancel();

      const pending = pendingReactionRef.current;
      const lastSynced = lastSyncedReactionRef.current;

      if (pending !== lastSynced) {
        if (pending === null) {
          unReactionFn(entityId, entityType).catch(console.error);
        } else {
          reactionFn(entityId, pending, entityType).catch(console.error);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId, debouncedSync, reactionFn, unReactionFn]);

  useEffect(() => {
    setState({
      currentReaction: initialReaction,
      reactionCount: initialCount,
    });
    pendingReactionRef.current = initialReaction;
  }, [initialReaction, initialCount]);

  return {
    currentReaction: state.currentReaction,
    reactionCount: state.reactionCount,
    isLoading: syncMutation.isPending,

    handleReaction,
    toggleReaction,
    quickLike,

    hasReacted: state.currentReaction !== undefined,
    isReaction: (type: ReactionType) => state.currentReaction === type,
  };
}
