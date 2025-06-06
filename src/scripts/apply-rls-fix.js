const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Supabase client with service role key for admin access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials. Check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: {
    schema: 'public'
  }
});

async function applySqlFix() {
  try {
    console.log('Reading SQL file...');
    const sqlPath = path.join(__dirname, '../../sql/rls_fix.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split into separate statements and execute them
    const statements = sqlContent
      .split(';')
      .filter(stmt => stmt.trim())
      .map(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (!statement) continue;
      
      console.log('Executing statement:', statement);
      
      try {
        // Try direct SQL query first
        const { error } = await supabase.rpc('execute_sql', { query: statement });
        
        if (error) {
          console.log('RPC method failed, trying raw query...');
          const { error: directError } = await supabase.from('_raw_query').select('*').eq('query', statement);
          
          if (directError) {
            throw directError;
          }
        }
      } catch (err) {
        console.error('Error executing statement:', err.message);
        console.log('Continuing with next statement...');
      }
    }
    
    console.log('SQL fix attempt completed. If there were no critical errors, check your application.');
    console.log('If you still have issues, you may need to run these statements directly in the Supabase SQL editor:');
    console.log(sqlContent);
  } catch (error) {
    console.error('Failed to apply SQL fix:', error);
    console.log('Please run these SQL statements directly in the Supabase dashboard:');
    console.log(sqlContent);
  }
}

applySqlFix(); 