import { MessageSquareText } from "lucide-react";

export default function TonePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-8 border border-[#E9EDEF] shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
            <MessageSquareText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#111B21]">Agent Tone</h1>
            <p className="text-[#667781]">Customize how your agent interacts with customers.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-[#E9EDEF] p-4 rounded-xl cursor-pointer hover:border-[#128C7E] transition-colors relative">
            <h3 className="font-bold text-[#111B21] mb-2">Professional</h3>
            <p className="text-[#667781] text-sm">Formal, polite, and strictly business. Best for B2B or conservative industries.</p>
          </div>
          <div className="border-2 border-[#128C7E] bg-[#25D366]/5 p-4 rounded-xl cursor-pointer transition-colors relative">
            <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-[#128C7E] flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            <h3 className="font-bold text-[#111B21] mb-2">Friendly & Casual</h3>
            <p className="text-[#667781] text-sm">Approachable, enthusiastic, and conversational. Great for most B2C businesses.</p>
          </div>
          {/* Add more tones here */}
        </div>

        <div className="mt-8 pt-8 border-t border-[#E9EDEF]">
            <h3 className="font-bold text-[#111B21] mb-4">Custom Instructions</h3>
            <textarea 
              className="w-full p-4 border border-[#E9EDEF] rounded-xl focus:outline-none focus:border-[#128C7E] resize-none" 
              rows={4} 
              placeholder="E.g., Always address the user by their first name if known, and never mention competitor products..."
            ></textarea>
            <button className="mt-4 bg-[#128C7E] hover:bg-[#075E54] text-white px-6 py-2 rounded-lg font-bold shadow-sm transition-colors duration-300">
              Save Preferences
            </button>
        </div>
      </div>
    </div>
  );
}
