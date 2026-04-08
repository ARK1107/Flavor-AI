"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChefHat, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordStrength = (() => {
    if (password.length === 0) return null;
    if (password.length < 6) return "weak";
    if (password.length < 10) return "medium";
    return "strong";
  })();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        if (error.message.includes("User already registered")) {
          toast.error("An account with this email already exists. Please sign in.");
        } else if (error.message.includes("Password should be")) {
          toast.error("Password too weak. Please use at least 6 characters.");
        } else {
          toast.error(error.message);
        }
        return;
      }
      setSuccess(true);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md glass rounded-3xl p-10 text-center space-y-5"
        >
          <div className="flex justify-center">
            <div className="bg-green-500/10 p-4 rounded-full">
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Check your inbox!</h2>
          <p className="text-foreground/60 text-sm leading-relaxed">
            We&apos;ve sent a confirmation link to <strong className="text-foreground">{email}</strong>.
            Click the link to activate your account, then sign in.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 py-3 px-8 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            Go to Sign In <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-20 right-10 w-80 h-80 bg-accent/20 rounded-full blur-3xl opacity-40 -z-10" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-40 -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8 sm:p-10 space-y-8">
          {/* Logo + Heading */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-2xl shadow-lg">
                <ChefHat size={32} className="text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Create your account
            </h1>
            <p className="text-foreground/60 text-sm">
              Join Flavor AI and defeat dinner fatigue forever
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="signup-email" className="text-sm font-semibold text-foreground/80">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-foreground/5 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-foreground/30"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="signup-password" className="text-sm font-semibold text-foreground/80">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-foreground/5 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-foreground/30"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/80 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Password strength bar */}
              {passwordStrength && (
                <div className="pt-1 space-y-1">
                  <div className="flex gap-1">
                    {["weak", "medium", "strong"].map((level, i) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          ["weak", "medium", "strong"].indexOf(passwordStrength) >= i
                            ? passwordStrength === "weak"
                              ? "bg-red-500"
                              : passwordStrength === "medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                            : "bg-foreground/10"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    passwordStrength === "weak" ? "text-red-500" :
                    passwordStrength === "medium" ? "text-yellow-500" :
                    "text-green-500"
                  }`}>
                    {passwordStrength === "weak" ? "Too short" : passwordStrength === "medium" ? "Medium strength" : "Strong password"}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className="text-sm font-semibold text-foreground/80">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-foreground/5 border focus:outline-none focus:ring-2 transition-all text-sm placeholder:text-foreground/30 ${
                    confirmPassword && confirmPassword !== password
                      ? "border-red-500/60 focus:ring-red-500/30 focus:border-red-500"
                      : "border-border focus:ring-primary/50 focus:border-primary"
                  }`}
                  required
                />
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-xs text-red-500 font-medium">Passwords do not match</p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-foreground/60">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
