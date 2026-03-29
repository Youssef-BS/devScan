"use client"
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setStatus("error");
        setMessage("No session ID found");
        return;
      }

      try {
        console.log("🔄 Verifying payment with session:", sessionId);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/subscription/verify-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();
        console.log("✅ Verification response:", data);

        if (response.ok && data.status === 'verified') {
          setStatus("success");
          setMessage("Your subscription has been activated successfully!");
        } else if (data.status === 'unpaid') {
          setStatus("error");
          setMessage("Payment is still processing. Please wait a moment and refresh.");
        } else {
          setStatus("error");
          setMessage(data.message || "Failed to verify payment");
        }
      } catch (error) {
        console.error("❌ Verification error:", error);
        setStatus("error");
        setMessage("Unable to verify payment. Please contact support.");
      }
    };

    // Add a small delay to ensure Stripe has processed the payment
    const timer = setTimeout(verifyPayment, 1000);

    return () => clearTimeout(timer);
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-blue-50">
        <div className="text-center space-y-6">
          <Loader className="w-16 h-16 text-blue-600 mx-auto animate-spin" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Processing your payment
            </h1>
            <p className="text-gray-600 mt-2">
              Please wait while we confirm your subscription...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-blue-50">
        <div className="text-center space-y-6 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {message || "Something went wrong"}
            </h1>
            <p className="text-gray-600 mt-2">
              {message ? "Please try again or contact support." : "We couldn't process your subscription. Please try again."}
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/pricing")}
              className="flex-1"
            >
              Back to Pricing
            </Button>
            <Button
              onClick={() => router.push("/dashboard")}
              className="flex-1"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-green-50">
      <div className="text-center space-y-8 max-w-md">
        <div className="flex justify-center">
          <CheckCircle className="w-20 h-20 text-green-600 animate-bounce" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to DevScan!
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Your subscription is now active
          </p>
          <p className="text-gray-500">
            You can now start auditing your code with all premium features
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 text-left space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-gray-700">Code analysis enabled</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-gray-700">GitHub integration active</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-gray-700">AI-powered suggestions</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-gray-700">24/7 support</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg font-semibold"
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="w-full"
          >
            Back to Home
          </Button>
        </div>

        <div className="text-sm text-gray-600 pt-4">
          <p>
            Need help? Contact us at{" "}
            <a href="mailto:support@devscan.com" className="text-blue-600 hover:underline">
              support@devscan.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
