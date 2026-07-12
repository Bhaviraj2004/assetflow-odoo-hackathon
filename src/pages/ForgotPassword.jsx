import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, KeyRound, CheckCircle2 } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-blue-600">
          <div className="bg-blue-100 p-3 rounded-2xl">
            <KeyRound size={40} className="text-blue-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 px-4">
          Enter your email address and we'll send you a secure link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-slate-200">
          {!success ? (
            <form className="space-y-6" onSubmit={handleReset}>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-3 bg-slate-50 border text-slate-900 transition-colors"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">Check your inbox</h3>
              <p className="text-slate-600 text-sm">
                We've sent a password reset link to <span className="font-medium text-slate-800">{email}</span>. 
                Please check your email and click the link to reset your password.
              </p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
