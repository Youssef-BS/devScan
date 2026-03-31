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
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <Card className="rounded-2xl shadow-xl border border-black/10 bg-white">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 rounded-full bg-black/5">
                <AlertTriangle className="text-black w-10 h-10" />
              </div>

              <h1 className="text-3xl font-bold text-black">
                Your Account Has Been Banned
              </h1>

              <p className="text-black/60 max-w-md">
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
                className="bg-white border-black/20 text-black placeholder:text-black/40 focus:border-black focus:ring-black/20"
              />

              <Textarea
                placeholder="Explain your situation..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                className="bg-white border-black/20 text-black placeholder:text-black/40 focus:border-black focus:ring-black/20"
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-black/80 text-white rounded-xl transition-all duration-200"
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
                <p className="text-black/60 text-sm text-center">
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