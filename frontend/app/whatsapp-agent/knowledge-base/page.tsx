import { BookOpen } from "lucide-react";

export default function KnowledgeBasePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-8 border border-[#E9EDEF] shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#111B21]">Knowledge Base</h1>
            <p className="text-[#667781]">Upload documents and text to train your WhatsApp Agent.</p>
          </div>
        </div>
        
        <div className="text-center py-16 border-2 border-dashed border-[#E9EDEF] rounded-xl text-[#8696A0]">
          <p className="text-lg font-medium mb-2">No data sources added</p>
          <p>Add PDF files or text snippets so the agent can learn about your business.</p>
          <button className="mt-6 bg-[#111B21] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#111B21]/90 transition-colors">
            Upload Document
          </button>
        </div>
      </div>
    </div>
  );
}
