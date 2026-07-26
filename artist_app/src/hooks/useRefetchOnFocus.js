import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/**
 * A custom hook that triggers an RTK Query refetch whenever the React Navigation screen comes into focus.
 * 
 * @param {Function} refetch - The refetch function returned by an RTK Query hook.
 */
export const useRefetchOnFocus = (refetch) => {
  useFocusEffect(
    useCallback(() => {
      if (refetch) {
        try {
          refetch();
        } catch (error) {
          // Ignore error if refetching a query that hasn't started yet (e.g. skipped queries)
        }
      }
    }, [refetch])
  );
};
