import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth'; // Assuming you have a function to get the user

export async function redirectIfAuthenticated() {
  const user = await getAuthenticatedUser();
  if (user) {
    redirect('/dashboard'); // Or any other authenticated route
  }
}