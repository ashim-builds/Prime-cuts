import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useUser } from "../context/UserContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useUser();

  useEffect(() => {
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError(errorParam.replace(/_/g, " "));
    }
  }, [searchParams]);

  // ================================
  // NORMAL EMAIL/PASSWORD LOGIN
  // ================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        await refreshUser();

        const from = searchParams.get("from");

        navigate(from || "/");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // GOOGLE OAUTH LOGIN
  // ================================
  const handleGoogleSuccess = async (credentialResponse: {
    credential?: string;
  }) => {
    setError("");
    setGoogleLoading(true);

    try {
      if (!credentialResponse.credential) {
        setError("Google authentication failed. No credential received.");
        return;
      }

      /*
       * Send Google's credential to your backend.
       *
       * Your backend should:
       * 1. Verify the Google credential
       * 2. Get the user's Google profile
       * 3. Find/create the user in your database
       * 4. Create your normal login session/cookie
       */
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const contentType = res.headers.get("content-type");
      let data: any = {};
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }

      if (!res.ok) {
        setError(data.error || "Google login failed. Please try again.");
        return;
      }

      // Refresh your application's logged-in user
      await refreshUser();

      // Redirect to the page the user originally wanted
      const from = searchParams.get("from");

      navigate(from || "/");
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err?.message || "An unexpected error occurred during Google login.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setGoogleLoading(false);
    setError("Google login failed. Please try again.");
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto bg-white p-8 rounded-xl shadow-sm border border-stone-100">
        <h2 className="text-center text-3xl font-black text-black mb-6">
          Welcome Back
        </h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* ERROR MESSAGE */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium">
              {error}
            </div>
          )}

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value.replace(/\s/g, ""))
              }
              className="w-full px-4 py-3 rounded-md border border-stone-200 focus:outline-none focus:border-primary text-black"
              placeholder="your@email.com"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">
              Password
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-stone-200 focus:outline-none focus:border-primary text-black"
              placeholder="••••••••"
            />
          </div>

          {/* NORMAL LOGIN */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-primary text-black font-black uppercase text-sm tracking-wide py-3 rounded-md hover:bg-primary/90 transition-colors mt-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* DIVIDER */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200"></div>
            </div>

            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-stone-500 font-medium">
                Or continue with
              </span>
            </div>
          </div>

          {/* GOOGLE LOGIN */}
          <div className="w-full flex justify-center">
            {googleLoading ? (
              <div className="w-full border border-stone-200 rounded-md py-3 text-center text-stone-600 font-bold">
                Signing in with Google...
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
              />
            )}
          </div>
        </form>

        {/* REGISTER */}
        <div className="mt-6 text-center text-sm text-stone-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-bold text-primary hover:underline cursor-pointer"
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}