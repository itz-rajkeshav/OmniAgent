"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { BACKEND_URL } from "@/lib/constants";
import { BookOpen, FileText, Globe, UploadCloud, Link as LinkIcon, Trash2, CheckCircle2, AlertCircle, RefreshCw, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function KnowledgeBasePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"sources" | "add-pdf" | "add-website">("sources");
  
  type SourceItem = {
    id: string;
    source_id: string;
    name: string;
    type: "pdf" | "website";
    date: string;
  };

  const [sources, setSources] = useState<SourceItem[]>([]);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isCrawlingSubpages, setIsCrawlingSubpages] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSources, setIsFetchingSources] = useState(false);
  const [bannerMsg, setBannerMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showBanner = (type: 'success' | 'error', text: string) => {
    setBannerMsg({ type, text });
    setTimeout(() => setBannerMsg(null), 5000);
  };

  const fetchSources = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsFetchingSources(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}/supabase/get-userSource?user_id=${encodeURIComponent(session.user.id)}`
      );
      const data = await res.json();
      if (!res.ok || data.status === "error") {
        throw new Error(data.message || data.detail || "Failed to fetch sources");
      }
      const formatted: SourceItem[] = (data.sources || []).map((source: any) => ({
        id: String(source.id ?? source.source_id),
        source_id: String(source.source_id),
        name: source.source_title,
        type: source.source_type === "website" ? "website" : "pdf",
        date: source.created_at ? new Date(source.created_at).toLocaleDateString() : "-",
      }));
      setSources(formatted);
    } catch (err: any) {
      showBanner("error", err.message || "Could not load sources");
    } finally {
      setIsFetchingSources(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const removeSource = async (source: SourceItem) => {
    if (!session?.user?.id) {
      showBanner("error", "Session user ID not found. Are you logged in?");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/supabase/delete-userSource`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: session.user.id,
          source_id: source.source_id,
          source_title: source.name,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.status === "error") {
        throw new Error(data.message || data.detail || "Failed to delete source");
      }
      setSources((prev) => prev.filter((s) => s.id !== source.id));
      showBanner("success", "Source removed successfully.");
    } catch (err: any) {
      showBanner("error", err.message || "Failed to delete source");
    }
  };

  const handlePdfUpload = async () => {
    if (!pdfFile) {
      showBanner("error", "Please select a PDF file first.");
      return;
    }
    if (!session?.user?.id) {
      showBanner("error", "Session user ID not found. Are you logged in?");
      return;
    }

    setIsLoading(true);
    setBannerMsg(null);

    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append("user_id", session.user.id);

    try {
      const res = await fetch(`${BACKEND_URL}/pdf/embedding/upsert`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (!res.ok || data.status === "error") {
        throw new Error(data.message || data.detail || "Upload failed");
      }

      showBanner("success", "PDF successfully uploaded and embedded.");
      await fetchSources();
      
      setPdfFile(null);
      setActiveTab("sources");
    } catch (err: any) {
      console.error(err);
      showBanner("error", err.message || "Failed to upload PDF");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebsiteCrawl = async () => {
    if (!websiteUrl) {
      showBanner("error", "Please enter a valid Website URL.");
      return;
    }
    if (!session?.user?.id) {
      showBanner("error", "Session user ID not found. Are you logged in?");
      return;
    }

    setIsLoading(true);
    setBannerMsg(null);

    try {
      const res = await fetch(`${BACKEND_URL}/website/embedding/upsert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The backend expects url and user_id. 
        // Max pages or crawling depth config logic can be added later if backend supports it.
        body: JSON.stringify({ 
          url: websiteUrl, 
          user_id: session.user.id 
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok || data.status === "error") {
        throw new Error(data.message || data.detail || "Crawl failed");
      }

      showBanner("success", "Website successfully crawled and embedded.");
      await fetchSources();
      
      setWebsiteUrl("");
      setActiveTab("sources");
    } catch (err: any) {
      console.error(err);
      showBanner("error", err.message || "Failed to crawl website");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Banner Messages */}
      <AnimatePresence>
        {bannerMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "p-4 rounded-xl flex items-center gap-3 font-semibold text-sm shadow-sm",
              bannerMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            )}
          >
            {bannerMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {bannerMsg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info */}
      <div className="bg-white rounded-3xl p-8 border border-[#E9EDEF] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-blue-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#111B21] tracking-tight">Knowledge Base</h1>
            <p className="text-[#667781] mt-1.5 text-base font-medium">Train your WhatsApp Agent with custom documents and web URLs.</p>
          </div>
        </div>
        
        {activeTab === "sources" && (
          <div className="flex gap-3">
            <button 
              onClick={() => setActiveTab("add-pdf")}
              className="flex items-center gap-2 bg-white border-2 border-[#E9EDEF] text-[#111B21] px-5 py-2.5 rounded-xl font-bold hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
            >
              <FileText className="w-5 h-5" />
              Upload PDF
            </button>
            <button 
              onClick={() => setActiveTab("add-website")}
              className="flex items-center gap-2 bg-gradient-to-r from-[#111B21] to-gray-800 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Globe className="w-5 h-5" />
              Add Website
            </button>
          </div>
        )}
      </div>

      {/* Main Content Interface Segment */}
      <div className="bg-white rounded-3xl border border-[#E9EDEF] shadow-sm overflow-hidden">
        
        {/* Navigation Tabs - back affordance */}
        {activeTab !== "sources" && (
          <div className="px-6 py-5 border-b border-[#E9EDEF] flex items-center gap-4 bg-gray-50/80">
            <button 
              onClick={() => setActiveTab("sources")}
              className="text-[#667781] hover:text-[#111B21] font-bold text-sm transition-colors py-1 px-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 shadow-sm"
            >
              ← Back to Overview
            </button>
            <div className="h-5 w-px bg-gray-300"></div>
            <span className="text-[#111B21] font-bold">
              {activeTab === "add-pdf" ? "Upload PDF Document" : "Crawl Website URL"}
            </span>
          </div>
        )}

        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {activeTab === "sources" && (
              <motion.div
                key="sources"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-6"
              >
                {(isLoading || isFetchingSources) && (
                  <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-700 font-semibold text-sm">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing source data...
                  </div>
                )}
                {sources.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-[#E9EDEF] rounded-[2rem] bg-gray-50/50">
                    <div className="w-20 h-20 bg-white border border-[#E9EDEF] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <BookOpen className="w-10 h-10 text-[#8696A0]" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-[#111B21] mb-3">No data sources yet</h3>
                    <p className="text-[#667781] mb-8 max-w-md mx-auto text-lg">
                      Add PDF files or text snippets so the agent can learn about your business and answer customer queries accurately.
                    </p>
                    <div className="flex justify-center gap-4">
                      <button 
                        onClick={() => setActiveTab("add-pdf")}
                        className="flex items-center gap-2 bg-white border-2 border-[#E9EDEF] text-[#111B21] px-6 py-3 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                      >
                        <FileText className="w-5 h-5" />
                        Upload PDF
                      </button>
                      <button 
                        onClick={() => setActiveTab("add-website")}
                        className="flex items-center gap-2 bg-[#111B21] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                      >
                        <Globe className="w-5 h-5" />
                        Add Website
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b-2 border-gray-100 text-xs uppercase font-extrabold tracking-wider text-[#8696A0]">
                          <th className="pb-4 pl-4 w-[40%]">Source Detail</th>
                          <th className="pb-4">Type</th>
                          <th className="pb-4">Date Added</th>
                          <th className="pb-4 text-right pr-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {sources.map((source, idx) => (
                          <motion.tr 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            transition={{ delay: idx * 0.05 }}
                            key={source.id} 
                            className="border-b border-[#E9EDEF] last:border-0 hover:bg-gray-50/80 transition-all group"
                          >
                            <td className="py-4 pl-4">
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border flex-shrink-0",
                                  source.type === 'pdf' ? "bg-rose-50 text-rose-500 border-rose-100" : "bg-indigo-50 text-indigo-500 border-indigo-100"
                                )}>
                                  {source.type === 'pdf' ? <FileText className="w-6 h-6" /> : <LinkIcon className="w-6 h-6" />}
                                </div>
                                <span className="font-bold text-[#111B21] text-base truncate max-w-[200px] sm:max-w-[260px] block" title={source.name}>
                                  {source.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className={cn(
                                "uppercase text-xs font-black tracking-widest px-2.5 py-1 rounded-md",
                                source.type === 'pdf' ? "bg-rose-100 text-rose-700" : "bg-indigo-100 text-indigo-700"
                              )}>
                                {source.type}
                              </span>
                            </td>
                            <td className="py-4 font-medium text-[#667781]">{source.date}</td>
                            <td className="py-4 text-right pr-4">
                              <button 
                                onClick={() => removeSource(source)}
                                className="p-2.5 text-[#8696A0] hover:text-white hover:bg-rose-500 rounded-xl transition-all shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 focus:ring-2 ring-rose-300"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "add-pdf" && (
              <motion.div
                key="add-pdf"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="max-w-2xl mx-auto py-10"
              >
                <div className="border-2 border-dashed border-gray-300 hover:border-indigo-400 bg-gray-50/50 hover:bg-indigo-50/30 rounded-[2.5rem] p-16 text-center transition-all cursor-pointer group shadow-sm">
                  <div className="w-24 h-24 bg-white shadow-md border border-gray-100 rounded-[2rem] rotate-3 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ease-out">
                    <UploadCloud className="w-12 h-12 text-indigo-500" />
                  </div>
                  
                  {pdfFile ? (
                    <div>
                      <h3 className="text-xl font-bold text-[#111B21] mb-2">{pdfFile.name}</h3>
                      <p className="text-[#667781] mb-6 text-sm font-medium">
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <div className="flex items-center justify-center gap-4">
                         <label className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all cursor-pointer">
                           Change File
                           <input 
                             type="file" 
                             className="hidden" 
                             accept=".pdf,.doc,.docx,.txt" 
                             onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                           />
                         </label>
                         <button 
                           onClick={handlePdfUpload}
                           disabled={isLoading}
                           className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                         >
                           {isLoading && <RefreshCw className="w-5 h-5 animate-spin" />}
                           {isLoading ? "Uploading..." : "Process Document"}
                         </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-2xl font-extrabold text-[#111B21] mb-3">Drop your PDF file here</h3>
                      <p className="text-[#667781] mb-10 text-lg font-medium">
                        PDF, DOCX, or TXT formats supported (up to 20MB)
                      </p>
                      <label className="bg-gradient-to-br from-[#111B21] to-gray-800 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer inline-flex items-center gap-3">
                        <Plus className="w-6 h-6" />
                        Browse Files
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".pdf,.doc,.docx,.txt" 
                          onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "add-website" && (
              <motion.div
                key="add-website"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="max-w-2xl mx-auto py-10"
              >
                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <div className="mb-8">
                    <label className="block text-base font-bold text-[#111B21] mb-3">Enter Website URL</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Globe className="h-6 w-6 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      </div>
                      <input 
                        type="url" 
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://your-domain.com/docs" 
                        className="block w-full pl-14 pr-5 py-4 border-2 border-gray-100 rounded-2xl text-[#111B21] font-medium text-lg placeholder-gray-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none bg-gray-50 focus:bg-white"
                      />
                    </div>
                    <p className="mt-3 text-sm font-medium text-gray-500 pl-1">
                      Our scraper will extract written content to enrich your agent's knowledge base.
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-4 mb-10 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                    <div className="mt-1">
                      <input 
                        type="checkbox" 
                        id="crawl-subpages" 
                        checked={isCrawlingSubpages}
                        onChange={(e) => setIsCrawlingSubpages(e.target.checked)}
                        className="w-6 h-6 text-indigo-600 border-indigo-300 rounded-lg focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label htmlFor="crawl-subpages" className="font-bold text-lg text-indigo-950 block cursor-pointer">
                        Crawl related sub-pages deeper
                      </label>
                      <span className="text-sm font-medium text-indigo-700/80 mt-1 block">Extracts more comprehensive data, but may take several minutes depending on the website's structure and size.</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleWebsiteCrawl}
                    disabled={isLoading || !websiteUrl}
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-3"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    ) : (
                      <RefreshCw className="w-6 h-6" />
                    )}
                    {isLoading ? "Crawling & Embedding..." : "Initiate Deep Crawl"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
