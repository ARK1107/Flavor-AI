"use client";

import Link from "next/link";
import { ChefHat, Heart, User, Sun, Moon, LogIn, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err: any) {
      console.error("Sign out error:", err);
    }
  };

  if (!mounted) {
    return null; 
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-xl text-white group-hover:scale-105 transition-transform">
            <ChefHat size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight text-gradient">
            Flavor AI
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/discover" className="p-2 flex items-center gap-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-foreground/80 hover:text-primary font-medium text-sm">
            Discover
          </Link>
          {user ? (
            <>
              <Link href="/favorites" className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-foreground/80 hover:text-primary" title="Favorites">
                <Heart size={20} />
              </Link>
              <Link href="/profile" className="p-2 flex items-center gap-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-foreground/80 hover:text-primary">
                <div className="bg-primary/20 p-1 rounded-full text-primary">
                  <User size={16} />
                </div>
                <span className="text-sm font-medium hidden sm:inline-block">Profile</span>
              </Link>
              <button 
                onClick={handleSignOut}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-foreground/80 hover:text-red-500"
                title="Log out"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="p-2 px-3 flex items-center gap-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-foreground/80 hover:text-primary text-sm font-medium"
              >
                <LogIn size={16} />
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-orange-500 text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-md shadow-primary/20"
              >
                Sign Up
              </Link>
            </div>
          )}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-foreground/80 hover:text-primary"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </nav>
      </div>
    </header>
  );
}
