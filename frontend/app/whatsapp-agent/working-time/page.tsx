import { Clock } from "lucide-react";

export default function WorkingTimePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-8 border border-[#E9EDEF] shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#111B21]">Working Time</h1>
            <p className="text-[#667781]">Configure when the agent should automatically reply to incoming messages.</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border border-[#E9EDEF] rounded-xl">
            <div>
              <h3 className="font-semibold text-[#111B21]">Agent active 24/7</h3>
              <p className="text-sm text-[#667781]">The agent will reply to all incoming messages instantly.</p>
            </div>
            <div className="w-12 h-6 bg-[#25D366] rounded-full relative cursor-pointer">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
            </div>
          </div>
          {/* Working hours builder placeholder */}
          <div className="opacity-50 pointer-events-none p-4 border border-[#E9EDEF] rounded-xl bg-[#F7F8FA]">
             <p className="text-center text-[#667781] py-4">Custom Working Hours configuration coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
