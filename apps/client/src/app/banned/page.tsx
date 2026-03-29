"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Send } from "lucide-react";
import { motion } from "framer-motion";

export default function BannedPage() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise((res) => setTimeout(res, 1500));
      setSuccess(true);
      setMessage("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-red-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <Card className="rounded-2xl shadow-2xl border border-red-500/20 bg-black/60 backdrop-blur-xl">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 rounded-full bg-red-500/10">
                <AlertTriangle className="text-red-500 w-10 h-10" />
              </div>

              <h1 className="text-3xl font-bold text-white">
                Your Account Has Been Banned
              </h1>

              <p className="text-gray-400 max-w-md">
                If you believe this was a mistake, you can submit a reclamation
                request below. Our team will review your case.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-8 flex flex-col gap-4"
            >
              <Input
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-black/50 border-gray-700 text-white"
              />

              <Textarea
                placeholder="Explain your situation..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                className="bg-black/50 border-gray-700 text-white"
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl"
              >
                {loading ? (
                  "Sending..."
                ) : (
                  <span className="flex items-center gap-2">
                    <Send size={16} /> Send Reclamation
                  </span>
                )}
              </Button>

              {success && (
                <p className="text-green-400 text-sm text-center">
                  Your request has been sent successfully.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
