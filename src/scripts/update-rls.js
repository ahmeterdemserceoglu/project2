const fetch = require('node-fetch');
require('dotenv').config();

async function updateRLS() {
  try {
    // Set the ADMIN_API_KEY in .env temporarily to run this script
    const adminApiKey = process.env.ADMIN_API_KEY;
    
    if (!adminApiKey) {
      console.error('Error: ADMIN_API_KEY not found in .env file');
      console.log('Add ADMIN_API_KEY=your_secure_key to your .env file');
      return;
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/admin/update-rls`;
    
    console.log(`Calling API endpoint: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminApiKey}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('RLS update response:', data);
      
      if (data.results) {
        console.log('\nDetailed results:');
        data.results.forEach((result, index) => {
          console.log(`\nStatement ${index + 1}:`);
          console.log(`SQL: ${result.sql}`);
          console.log(`Success: ${result.success}`);
          if (!result.success) {
            console.log(`Error: ${result.error}`);
          }
        });
      }
    } else {
      console.error('Failed to update RLS:', data);
    }
  } catch (error) {
    console.error('Error updating RLS:', error);
  }
}

updateRLS(); 