"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MessageCircle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { GATEWAY_URL } from "@/lib/constants";

export default function WhatsappConnectView({
  userId,
  isConnected = false,
}: {
  userId: string;
  isConnected?: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<string>(
    isConnected ? "connected" : "connecting",
  );
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected) {
      setTimeout(() => {
        router.push("/whatsapp-agent");
      }, 2500);
      return;
    }

    let pollingInterval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `${GATEWAY_URL}/whatshapp/status?userId=${userId}`,
        );
        const data = await res.json();

        if (data.status === "connected") {
          setStatus("connected");
          setTimeout(() => {
            router.push("/whatsapp-agent");
          }, 2500);
          return;
        }

        if (
          data.status === "disconnected" ||
          data.status === "connecting" ||
          data.status === "qr_ready"
        ) {
          const qrRes = await fetch(
            `${GATEWAY_URL}/whatshapp/qr?userId=${userId}`,
          );
          const qrData = await qrRes.json();

          if (qrData.status === "connected") {
            setStatus("connected");
            setTimeout(() => {
              router.push("/whatsapp-agent");
            }, 2500);
            return;
          }

          if (qrData.qr) {
            setQrCode(qrData.qr);
            setStatus("qr_ready");
          } else {
            setStatus("connecting");
          }
        }
      } catch (err) {
        console.error("Failed to poll", err);
      }
    };

    checkStatus();
    pollingInterval = setInterval(checkStatus, 3000);

    return () => clearInterval(pollingInterval);
  }, [userId, router]);

  // Framer motion variants
  const botState =
    status === "connected"
      ? "connected"
      : status === "qr_ready"
        ? "scanning"
        : "idle";

  const botVariants: Variants = {
    idle: {
      y: [0, -10, 0],
      rotate: [-1, 1, -1],
      transition: { repeat: Infinity, duration: 4, ease: "easeInOut" },
    },
    scanning: {
      y: [0, -5, 0],
      x: [-5, 5, -5],
      transition: { repeat: Infinity, duration: 3, ease: "easeInOut" },
    },
    connected: {
      y: [0, -30, 0, -10, 0, -15, 0],
      scale: [1, 1.05, 1, 1.02, 1, 1.03, 1],
      rotate: [0, -5, 5, 0, -2, 2, 0],
      transition: { duration: 1.5, ease: "easeOut" },
    },
  };

  const eyeVariants: Variants = {
    idle: {
      scaleY: [1, 1, 0.1, 1, 1],
      transition: {
        repeat: Infinity,
        duration: 3,
        times: [0, 0.45, 0.5, 0.55, 1],
      },
    },
    scanning: {
      scaleY: [1, 1, 0.1, 1, 1],
      x: [0, 8, 0, -8, 0],
      transition: {
        repeat: Infinity,
        duration: 2.5,
        times: [0, 0.45, 0.5, 0.55, 1],
      },
    },
    connected: {
      scaleY: [1, 1.4, 1.2, 1.3],
      scaleX: [1, 1.2, 1.1, 1.15],
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  const mouthVariants: Variants = {
    idle: {
      scaleX: [1, 1.1, 1],
      transition: { repeat: Infinity, duration: 4, ease: "easeInOut" },
    },
    scanning: {
      scale: [1, 1.3, 1],
      transition: { repeat: Infinity, duration: 1.2, ease: "easeInOut" },
    },
    connected: {
      scaleX: [1, 1.5, 0.8, 1.2, 1],
      scaleY: [1, 1.8, 0.7, 1.4, 1],
      y: [0, -5, 8, -3, 0],
      transition: { duration: 1.5, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E9EDEF] sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-[#667781] hover:text-[#111B21] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back</span>
        </Link>
        <div className="flex items-center gap-2">
          <MessageCircle
            className="w-6 h-6 text-[#25D366]"
            fill="#25D366"
            stroke="white"
          />
          <span className="font-bold text-[#111B21] text-lg">
            WhatsApp Integration
          </span>
        </div>
        <div className="w-16"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          {/* Left side: Instructions & Bot */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="relative mb-10 w-full flex justify-center md:justify-start">
              {/* Confetti effect for connected */}
              {status === "connected" && (
                <div className="absolute inset-0 pointer-events-none z-0 overflow-visible flex items-center justify-center">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
                      animate={{
                        opacity: [1, 1, 0],
                        x: (Math.random() - 0.5) * 250,
                        y: (Math.random() - 0.5) * -250 - 50,
                        scale: [0, 1.5, 0.5],
                        rotate: Math.random() * 360,
                      }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={`absolute w-3 h-3 rounded-sm ${
                        [
                          "bg-blue-500",
                          "bg-green-500",
                          "bg-yellow-500",
                          "bg-rose-500",
                        ][i % 4]
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* The Bot Animation */}
              <motion.div
                variants={botVariants}
                animate={botState}
                className="w-48 h-48 relative z-10"
              >
                {/* Robot Ears */}
                <div className="absolute top-1/2 -left-3 w-4 h-12 bg-[#AEB9D1] rounded-l-2xl -translate-y-1/2"></div>
                <div className="absolute top-1/2 -right-3 w-4 h-12 bg-[#AEB9D1] rounded-r-2xl -translate-y-1/2"></div>

                {/* A detailed, playful robot */}
                <div
                  className={`w-full h-full rounded-[2.5rem] border-[6px] border-[#91A2FA] bg-[#F4F6FF] shadow-2xl flex flex-col items-center justify-center transition-colors duration-500 overflow-hidden relative group`}
                >
                  {/* Top Bump */}
                  <div className="absolute top-0 w-10 h-2.5 bg-[#AEB9D1] rounded-b-md"></div>

                  {/* Eyes Container */}
                  <div className="flex gap-6 mt-4 px-6 w-full justify-center">
                    <div className="bg-[#1C2833] w-12 h-14 rounded-full flex items-center justify-center shadow-inner overflow-hidden relative">
                      <motion.div
                        variants={eyeVariants}
                        animate={botState}
                        className={`absolute w-8 h-10 rounded-full bg-[#00C2FF] translate-x-[-2px] translate-y-[-2px] shadow-[0_0_12px_#00C2FF]`}
                      />
                    </div>
                    <div className="bg-[#1C2833] w-12 h-14 rounded-full flex items-center justify-center shadow-inner overflow-hidden relative">
                      <motion.div
                        variants={eyeVariants}
                        animate={botState}
                        className={`absolute w-8 h-10 rounded-full bg-[#00C2FF] translate-x-[-2px] translate-y-[-2px] shadow-[0_0_12px_#00C2FF]`}
                      />
                    </div>
                  </div>

                  {/* Cheeks */}
                  <div className="absolute left-6 top-28 w-6 h-3 rounded-full bg-[#FF8DA1] opacity-90 block"></div>
                  <div className="absolute right-6 top-28 w-6 h-3 rounded-full bg-[#FF8DA1] opacity-90 block"></div>

                  {/* Mouth */}
                  <motion.div
                    variants={mouthVariants}
                    animate={botState}
                    className={`mt-4 z-10 transition-all duration-300 ${status === "connected" ? "w-14 h-6 border-b-[6px] border-[#1C2833] rounded-full translate-y-[-5px]" : status === "qr_ready" ? "w-6 h-6 border-[5px] border-[#1C2833] rounded-full bg-transparent" : "w-8 h-2 bg-[#1C2833] rounded-full"}`}
                  ></motion.div>
                </div>
              </motion.div>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-[#111B21] mb-4 tracking-tight">
              {status === "connected"
                ? "Yay! We're connected! 🚀"
                : "Connect your WhatsApp"}
            </h1>
            <p className="text-[#667781] text-lg mb-8 max-w-md leading-relaxed">
              {status === "connected"
                ? "Your robot is ready. Heading over to the control panel..."
                : "Bring the power of OmniAgent directly into your WhatsApp conversations in three simple steps."}
            </p>

            {status !== "connected" && (
              <div className="w-full max-w-md space-y-4">
                <div className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-[#128C7E] text-white flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-md">
                    1
                  </span>
                  <p className="text-[#111B21] text-lg font-medium">
                    Open WhatsApp on your phone
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-[#128C7E] text-white flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-md">
                    2
                  </span>
                  <p className="text-[#111B21] text-lg font-medium">
                    Tap <strong>Menu</strong> or <strong>Settings</strong> and
                    select <strong>Linked Devices</strong>
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-[#128C7E] text-white flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-md">
                    3
                  </span>
                  <p className="text-[#111B21] text-lg font-medium">
                    Point your phone to this screen to capture the code
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right side: QR Code Card */}
          <div className="flex-1 w-full max-w-md">
            <div className="bg-white p-8 rounded-[2rem] border border-[#E9EDEF] shadow-xl relative aspect-square flex flex-col items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                {status === "connected" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center w-full"
                  >
                    <div className="w-32 h-32 bg-[#25D366]/10 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-16 h-16 text-[#25D366]" />
                    </div>
                    <h3 className="font-bold text-3xl text-[#111B21] mb-2">
                      Linked Successfully
                    </h3>
                    <p className="text-[#667781] font-medium">
                      Redirecting automatically...
                    </p>
                  </motion.div>
                ) : status === "qr_ready" && qrCode ? (
                  <motion.div
                    key="qr"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center w-full h-full"
                  >
                    <h3 className="font-semibold text-[#111B21] text-xl mb-6">
                      Scan to link device
                    </h3>

                    {/* Base64 image from backend */}
                    <div className="bg-white p-2 rounded-2xl w-full flex-1 flex items-center justify-center relative shadow-sm border border-zinc-100">
                      <img
                        src={qrCode}
                        alt="WhatsApp QR Code"
                        className="w-[90%] h-auto object-contain z-10"
                      />

                      {/* Scanning overlay animation effect */}
                      <div className="absolute inset-4 border-2 border-[#25D366]/30 rounded-xl z-0 overflow-hidden">
                        <motion.div
                          animate={{ y: ["-10%", "110%"] }}
                          transition={{
                            repeat: Infinity,
                            duration: 2.5,
                            ease: "linear",
                          }}
                          className="w-full h-1 bg-[#25D366]/50 shadow-[0_0_15px_rgba(37,211,102,0.6)]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[#667781] text-sm mt-6 font-medium bg-[#F7F8FA] px-4 py-2 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                      Waiting for scan...
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative w-20 h-20 mb-6">
                      <div className="absolute inset-0 border-4 border-[#F7F8FA] rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-[#25D366] rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <h3 className="font-semibold text-xl text-[#111B21] mb-2">
                      Generating Secure Code
                    </h3>
                    <p className="text-[#667781] text-sm text-center">
                      Contacting WhatsApp servers...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
