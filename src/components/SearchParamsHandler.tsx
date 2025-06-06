'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const SearchParamsHandler = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Here you can handle any URL search parameters
    // For example, you might want to show a toast message if a certain parameter exists
    
    // Example: Check for success parameter
    const success = searchParams.get('success');
    if (success) {
      // You could trigger some action here
      console.log('Success parameter detected in URL');
    }
    
  }, [searchParams]);

  return null; // This component doesn't render anything
};

export default SearchParamsHandler;
