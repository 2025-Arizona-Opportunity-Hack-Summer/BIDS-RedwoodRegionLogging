"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  // All users are applicants by default
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  // Auto-redirect to login after successful signup
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 4000); // 4 seconds

      return () => clearTimeout(timer);
    }
  }, [success, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await signUp(email, password, fullName, 'applicant');
      if (error) {
        setError(error.message);
        setSuccess("");
      } else {
        setSuccess("Account created successfully! Please check your email to verify your account, then log in.");
        setError("");
        // Clear form
        setEmail("");
        setPassword("");
        setFullName("");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setSuccess("");
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
            Create your account
          </p>

          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col gap-4">
              <div className="w-full">
                <label className="block mb-2 text-sm font-medium text-primary-dark">
                  Full Name <span className="text-error">*</span>
                </label>
                <Input 
                  type="text" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                  className="border-accent-dark text-primary-dark"
                />
              </div>
              
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
              
              {success && (
                <div className="alert alert-success">
                  {success}
                </div>
              )}
              
              <Button 
                type="submit" 
                loading={loading}
                className="w-full bg-primary text-white hover:bg-primary-light"
                size="lg"
              >
                Create Account
              </Button>
            </div>
          </form>

          <div className="text-center border-t-2 border-accent-dark pt-6">
            <p className="text-primary-dark text-sm">
              Already have an account?
            </p>
            <Link 
              href="/login"
              className="text-primary font-medium hover:text-primary-light"
            >
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}