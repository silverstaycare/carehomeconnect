
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function debugAuthState(user: any, isOwner: boolean, context: string) {
  console.log(`[${context}] Auth State:`, {
    isLoggedIn: !!user,
    userId: user?.id,
    userRole: user?.user_metadata?.role,
    isOwner,
  });
}
