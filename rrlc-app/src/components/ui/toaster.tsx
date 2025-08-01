"use client"

// Simple toaster implementation without Chakra UI
export const toaster = {
  create: (options: { title: string; description?: string; status?: string }) => {
    console.log('Toast:', options);
    // For now, just log to console
    // In production, you'd implement a proper toast system
  }
}

export const Toaster = () => {
  // Return null for now - can implement a custom toast component later
  return null;
}
