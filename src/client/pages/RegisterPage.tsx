import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useUser } from "../context/UserContext";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
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

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const NAME_REGEX = /^[a-zA-Z\s]{2,60}$/;
  const PHONE_REGEX = /^9\d{9}$/;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let cleanValue = value;

    if (name === "name") {
      cleanValue = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (name === "phone") {
      cleanValue = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "email") {
      cleanValue = value.replace(/\s/g, "");
    }

    setFormData(prev => ({ ...prev, [name]: cleanValue }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!NAME_REGEX.test(formData.name.trim())) {
      errors.name = "Name must only contain letters and spaces (2–60 characters, no numbers).";
    }
    if (formData.phone && !PHONE_REGEX.test(formData.phone.replace(/[\s\-]/g, ""))) {
      errors.phone = "Phone number must be exactly 10 digits and start with 9 (e.g. 9812345678).";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        await refreshUser();
        navigate("/shop");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    setError("");
    setGoogleLoading(true);

    try {
      if (!credentialResponse.credential) {
        setError("Google authentication failed. No credential received.");
        return;
      }

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

      await refreshUser();
      const from = searchParams.get("from");
      navigate(from || "/");
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err?.message || "An unexpected error occurred during Google registration.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setGoogleLoading(false);
    setError("Google registration failed. Please try again.");
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto bg-white p-8 rounded-xl shadow-sm border border-stone-100">
        <h2 className="text-center text-3xl font-black text-black mb-6">Create Account</h2>
        
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium">{error}</div>}
          
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-md border focus:outline-none focus:border-primary text-black ${fieldErrors.name ? "border-red-400 bg-red-50" : "border-stone-200"}`}
              placeholder="Ram Bahadur"
            />
            {fieldErrors.name ? (
              <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.name}</p>
            ) : (
              <p className="text-xs text-stone-400 mt-1">Letters and spaces only (no numbers)</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md border border-stone-200 focus:outline-none focus:border-primary text-black"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">Phone Number (Optional)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              maxLength={10}
              className={`w-full px-4 py-3 rounded-md border focus:outline-none focus:border-primary text-black ${fieldErrors.phone ? "border-red-400 bg-red-50" : "border-stone-200"}`}
              placeholder="9812345678"
            />
            {fieldErrors.phone ? (
              <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.phone}</p>
            ) : (
              <p className="text-xs text-stone-400 mt-1">10 digits, starting with 9 (e.g. 9812345678)</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md border border-stone-200 focus:outline-none focus:border-primary text-black"
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-primary text-black font-black uppercase text-sm tracking-wide py-3 rounded-md hover:bg-primary/90 transition-colors mt-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-stone-500 font-medium">Or continue with</span>
            </div>
          </div>

          <div className="w-full flex justify-center">
            {googleLoading ? (
              <div className="w-full border border-stone-200 rounded-md py-3 text-center text-stone-600 font-bold">
                Connecting with Google...
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

        <div className="mt-6 text-center text-sm text-stone-600">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-primary hover:underline cursor-pointer">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
