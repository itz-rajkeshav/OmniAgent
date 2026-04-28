"use client";

import { useState, useEffect, useMemo } from "react";
import {
  UserX,
  Users,
  Search,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Contact,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GATEWAY_URL } from "@/lib/constants";

type Chat = {
  jid: string;
  isGroup: boolean;
  name: string;
  phoneNumber?: string;
  lastActivity?: number | null;
  withinLastMonth?: boolean;
};

export function BlockedContactsClient({ userId }: { userId: string }) {
  const [allContacts, setAllContacts] = useState<Chat[]>([]);
  const [groups, setGroups] = useState<Chat[]>([]);

  const [blockedJids, setBlockedJids] = useState<Set<string>>(new Set());
  const [initialBlockedJids, setInitialBlockedJids] = useState<Set<string>>(
    new Set(),
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"contacts" | "groups">("contacts");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chatsRes, blockedRes] = await Promise.all([
          fetch(`${GATEWAY_URL}/whatshapp/chats?userId=${userId}`),
          fetch(`${GATEWAY_URL}/whatshapp/blocked?userId=${userId}`),
        ]);

        const chatsData = await chatsRes.json();
        const blockedData = await blockedRes.json();

        if (chatsData.success) {
          setAllContacts(chatsData.allContacts || []);
          setGroups(chatsData.groups || []);
        }

        if (blockedData.success) {
          const blocks = new Set<string>(blockedData.blockedJids || []);
          setBlockedJids(blocks);
          setInitialBlockedJids(new Set(blocks));
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleBlock = (jid: string) => {
    setBlockedJids((prev) => {
      const next = new Set(prev);
      if (next.has(jid)) {
        next.delete(jid);
      } else {
        next.add(jid);
      }
      return next;
    });
  };

  const hasChanges = useMemo(() => {
    if (blockedJids.size !== initialBlockedJids.size) return true;
    let changed = false;
    blockedJids.forEach((jid) => {
      if (!initialBlockedJids.has(jid)) changed = true;
    });
    return changed;
  }, [blockedJids, initialBlockedJids]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const toBlock = Array.from(blockedJids).filter(
        (jid) => !initialBlockedJids.has(jid),
      );
      const toUnblock = Array.from(initialBlockedJids).filter(
        (jid) => !blockedJids.has(jid),
      );

      const reqOptions = (jid: string) => ({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, jid }),
      });

      const promises = [
        ...toBlock.map((jid) =>
          fetch(`${GATEWAY_URL}/whatshapp/block`, reqOptions(jid)),
        ),
        ...toUnblock.map((jid) =>
          fetch(`${GATEWAY_URL}/whatshapp/unblock`, reqOptions(jid)),
        ),
      ];

      await Promise.all(promises);
      setInitialBlockedJids(new Set(blockedJids));
      showToast("Changes saved successfully!");
    } catch (err) {
      console.error("Failed to save changes", err);
      showToast("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = useMemo(() => {
    let list: Chat[] = [];
    if (activeTab === "contacts") list = allContacts;
    else if (activeTab === "groups") list = groups;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      list = list.filter(
        (item) =>
          item.name?.toLowerCase().includes(lowerSearch) ||
          item.phoneNumber?.toLowerCase().includes(lowerSearch),
      );
    }

    // Keep source order stable so toggling a row never moves it to the top.
    return [...list];
  }, [activeTab, allContacts, groups, searchTerm]);

  // Merge the items with uniqueness on JID in case of overlap
  const uniqueItems = useMemo(() => {
    const map = new Map();
    filteredItems.forEach((item) => {
      // Use existing entry if already mapped, to avoid dupes across rapid renders
      if (!map.has(item.jid)) {
        map.set(item.jid, item);
      }
    });
    return Array.from(map.values());
  }, [filteredItems]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <Loader2 className="w-12 h-12 text-[#128C7E] animate-spin mb-4" />
        <p className="text-[#667781] font-medium">
          Loading contacts and groups...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-[#111B21] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5 text-[#25D366]" />
            <span className="font-medium text-sm">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-3xl p-8 border border-[#E9EDEF] shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shadow-inner">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-outfit text-[#111B21] tracking-tight">
                Access Control
              </h1>
              <p className="text-[#667781] text-lg">
                Select users or groups to prevent the agent from replying.
              </p>
            </div>
          </div>

          <AnimatePresence>
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-[#128C7E] hover:bg-[#075E54] text-white px-8 py-3 rounded-full font-bold shadow-md transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  Save Changes
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[#8696A0] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#F0F2F5] border-none rounded-xl text-[#111B21] placeholder-[#8696A0] focus:ring-2 focus:ring-[#128C7E]/50 transition-all font-medium"
            />
          </div>

          <div className="flex bg-[#F0F2F5] p-1.5 rounded-xl self-start md:self-auto overflow-x-auto max-w-full hide-scrollbar">
            <button
              onClick={() => setActiveTab("contacts")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${activeTab === "contacts" ? "bg-white text-[#111B21] shadow-sm tracking-tight" : "text-[#667781] hover:text-[#111B21] tracking-tight"}`}
            >
              <Contact className="w-4 h-4" />
              All Contacts
            </button>
            <button
              onClick={() => setActiveTab("groups")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${activeTab === "groups" ? "bg-white text-[#111B21] shadow-sm tracking-tight" : "text-[#667781] hover:text-[#111B21] tracking-tight"}`}
            >
              <Users className="w-4 h-4" />
              Groups
            </button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {uniqueItems.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-[#E9EDEF] rounded-2xl">
              <p className="text-[#8696A0] font-medium text-lg">
                No {activeTab} found
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {uniqueItems.map((item) => {
                const isBlocked = blockedJids.has(item.jid);
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={item.jid}
                    onClick={() => handleToggleBlock(item.jid)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleToggleBlock(item.jid);
                      }
                    }}
                    aria-pressed={isBlocked}
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#128C7E]/30 ${isBlocked ? "bg-red-50 border-red-200 shadow-sm" : "bg-white border-[#E9EDEF] hover:border-[#128C7E] hover:shadow-sm"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${isBlocked ? "bg-red-100 text-red-600" : "bg-[#F0F2F5] text-[#54656F]"}`}
                      >
                        {item.name
                          ? item.name.charAt(0).toUpperCase()
                          : item.isGroup
                            ? "G"
                            : "U"}
                      </div>
                      <div>
                        <h3
                          className={`font-bold ${isBlocked ? "text-red-900" : "text-[#111B21]"}`}
                        >
                          {item.name || "Unknown"}
                        </h3>
                        {item.phoneNumber && (
                          <p
                            className={`text-sm font-medium ${isBlocked ? "text-red-700/70" : "text-[#667781]"}`}
                          >
                            +{item.phoneNumber}
                          </p>
                        )}
                        {!item.phoneNumber && item.isGroup && (
                          <p
                            className={`text-sm font-medium ${isBlocked ? "text-red-700/70" : "text-[#667781]"}`}
                          >
                            Group
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isBlocked ? "bg-red-500 border-red-500 scale-110" : "border-[#AEB9D1]"}`}
                      >
                        {isBlocked && (
                          <UserX className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
