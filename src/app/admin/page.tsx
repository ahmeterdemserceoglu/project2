import { redirect } from 'next/navigation';
 
export default function AdminPage() {
  // Redirect to the dashboard page
  redirect('/admin/dashboard');
} 