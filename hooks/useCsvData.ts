import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { TagData } from '../types';

export const useCsvData = (filePath: string) => {
  const [allTags, setAllTags] = useState<TagData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error(`Failed to fetch CSV: ${response.statusText}`);
        }
        const csvText = await response.text();

        const parsedData: TagData[] = [];
        Papa.parse(csvText, {
          header: true,
          step: (results) => {
            const row = results.data as any;
            if (row.tag && row.count && !isNaN(parseInt(row.count, 10)) && !isNaN(parseInt(row.Rating, 10))) {
              const newTag: TagData = {
                tag: row.tag,
                trans: row.trans,
                jpTag: row.jpTag,
                count: parseInt(row.count, 10),
                tagGroup: row.tagGroup ? row.tagGroup.split(' ') : [],
                rating: parseInt(row.Rating, 10),
              };
              parsedData.push(newTag);
            }
          },
          complete: () => {
            setAllTags(parsedData);
            setIsLoading(false);
          },
          error: (err: any) => {
            console.error('CSV parsing error:', err);
            setError('Failed to parse CSV data.');
            setIsLoading(false);
          }
        });
      } catch (err: any) {
        console.error('Failed to fetch CSV:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    loadTags();
  }, [filePath]);

  return { allTags, isLoading, error };
};
