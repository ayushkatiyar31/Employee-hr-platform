import { useState, useCallback } from 'react';

export const useOptimisticUpdate = (initialData, updateFn) => {
    const [data, setData] = useState(initialData);
    const [isLoading, setIsLoading] = useState(false);

    const optimisticUpdate = useCallback(async (optimisticData, apiCall) => {
        const previousData = data;
        setData(optimisticData);
        setIsLoading(true);

        try {
            const result = await apiCall();
            setData(result);
            return result;
        } catch (error) {
            setData(previousData);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [data]);

    return [data, optimisticUpdate, isLoading, setData];
};