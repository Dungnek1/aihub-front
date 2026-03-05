/**
 * Hook for real-time tool rating updates
 */

import { useEffect, useCallback } from 'react';
import { socketService } from '@/services/socket.service';

interface UseToolRatingUpdatesProps {
    onRatingUpdate?: (data: {
        toolId: string;
        newAvgRating: number;
        newRatingsCount: number;
        lastRating: {
            userId: string;
            userName: string;
            stars: number;
            createdAt: Date;
        };
    }) => void;
}

export function useToolRatingUpdates({ onRatingUpdate }: UseToolRatingUpdatesProps = {}) {
    useEffect(() => {
        if (!onRatingUpdate) return;

        // Listen for tool rating updates
        const handleRatingUpdate = (data: any) => {
            console.log('Tool rating update received:', data);
            onRatingUpdate(data);
        };

        socketService.onToolRatingUpdate(handleRatingUpdate);

        // Cleanup
        return () => {
            socketService.offToolRatingUpdate();
        };
    }, [onRatingUpdate]);

    // Function to manually trigger rating update (for testing)
    const triggerRatingUpdate = useCallback((data: any) => {
        if (onRatingUpdate) {
            onRatingUpdate(data);
        }
    }, [onRatingUpdate]);

    return { triggerRatingUpdate };
}