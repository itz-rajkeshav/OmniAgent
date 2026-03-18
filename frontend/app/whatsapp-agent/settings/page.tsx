import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-8 border border-[#E9EDEF] shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gray-100 text-[#54656F] rounded-xl flex items-center justify-center">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#111B21]">Settings</h1>
            <p className="text-[#667781]">General configuration for your WhatsApp integration.</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border border-[#E9EDEF] rounded-xl">
             <div>
                <h3 className="font-semibold text-[#111B21] text-sm">Agent Name</h3>
                <p className="text-sm text-[#667781]">Internal name for your agent</p>
             </div>
             <p className="text-[#111B21] font-medium">OmniQ Bot</p>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-red-100 bg-red-50 rounded-xl">
             <div>
                <h3 className="font-semibold text-red-700 text-sm">Disconnect Agent</h3>
                <p className="text-sm text-red-600/80">Revoke access and stop all automated replies.</p>
             </div>
             <button className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-red-50 transition-colors">
                Disconnect
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
