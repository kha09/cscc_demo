import { User } from '@prisma/client';
import { NextRequest } from 'next/server';

export async function getCurrentUser(req: NextRequest): Promise<User | null | undefined> {
  try {
    // Get the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return null;

    // Parse the stored user from the Authorization header
    // The header should be in format: "Bearer {user JSON}"
    const token = authHeader.split(' ')[1];
    if (!token) return null;

    // Decode and parse the user data
    const decodedToken = decodeURIComponent(token);
    const user = JSON.parse(decodedToken);
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
