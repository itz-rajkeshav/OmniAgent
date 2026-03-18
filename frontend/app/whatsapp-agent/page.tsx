import { MessageCircle, Activity, Users, Settings } from "lucide-react";

export default function WhatsappAgentPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl p-8 border border-[#E9EDEF] shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-[#111B21] mb-2 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-[#667781] text-lg">
            Monitor your WhatsApp agent&apos;s active status and quick metrics.
          </p>
        </div>
        <div className="w-16 h-16 bg-[#25D366]/10 rounded-2xl flex items-center justify-center shadow-inner">
          <MessageCircle
            className="w-8 h-8 text-[#25D366]"
            fill="#25D366"
            stroke="white"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-white p-6 rounded-2xl border border-[#E9EDEF] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-[#54656F]">Messages Sent</h3>
          </div>
          <p className="text-3xl font-bold text-[#111B21]">0</p>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white p-6 rounded-2xl border border-[#E9EDEF] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-[#54656F]">
              Active Conversations
            </h3>
          </div>
          <p className="text-3xl font-bold text-[#111B21]">0</p>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white p-6 rounded-2xl border border-[#E9EDEF] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
              <Settings className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-[#54656F]">Agent Handled</h3>
          </div>
          <p className="text-3xl font-bold text-[#111B21]">0%</p>
        </div>
      </div>

      {/* Quick Action */}
      <div className="bg-white rounded-2xl p-8 border border-[#E9EDEF] shadow-sm text-center">
        <h2 className="text-2xl font-bold text-[#111B21] mb-4">
          Ready to configure your Agent?
        </h2>
        <p className="text-[#667781] mb-8 max-w-lg mx-auto">
          Your agent is currently securely connected. Customize its knowledge
          base, working time, and tone from the menu on the left.
        </p>
        <button className="bg-[#128C7E] hover:bg-[#075E54] text-white px-8 py-3 rounded-full font-bold shadow-lg transition-colors duration-300">
          Get Started
        </button>
      </div>
    </div>
  );
}
