"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn, isAuthenticated, isAdmin, isAuthReady } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated() && isAuthReady()) {
      router.push(isAdmin() ? "/admin" : "/home");
    }
  }, [isAuthenticated, isAdmin, isAuthReady, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error, user } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else if (user) {
        // Wait for the auth state to update and profile to be fetched
        const checkAuthReady = () => {
          if (isAuthReady()) {
            router.push(isAdmin() ? "/admin" : "/home");
          } else {
            setTimeout(checkAuthReady, 100);
          }
        };
        checkAuthReady();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-accent flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg border-2 border-accent-dark">
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl text-center text-primary font-bold">
            RRLC Scholarship Portal
          </h1>
          
          <p className="text-center text-primary-dark">
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col gap-4">
              <div className="w-full">
                <label className="block mb-2 text-sm font-medium text-primary-dark">
                  Email Address <span className="text-error">*</span>
                </label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="border-accent-dark text-primary-dark"
                />
              </div>
              
              <div className="w-full">
                <label className="block mb-2 text-sm font-medium text-primary-dark">
                  Password <span className="text-error">*</span>
                </label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="border-accent-dark text-primary-dark"
                />
              </div>
              
              {error && (
                <div className="alert alert-error">
                  {error}
                </div>
              )}
              
              <Button 
                type="submit" 
                loading={loading}
                className="w-full bg-primary text-white hover:bg-primary-light"
                size="lg"
              >
                Sign In
              </Button>
            </div>
          </form>

          <div className="text-center border-t-2 border-accent-dark pt-6">
            <p className="text-primary-dark text-sm">
              Don&apos;t have an account?
            </p>
            <Link 
              href="/register"
              className="text-primary font-medium hover:text-primary-light"
            >
              Sign up here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}