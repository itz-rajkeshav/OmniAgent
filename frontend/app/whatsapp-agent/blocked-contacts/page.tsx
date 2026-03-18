import { UserX } from "lucide-react";

export default function BlockedContactsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-8 border border-[#E9EDEF] shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#111B21]">Blocked Contacts</h1>
            <p className="text-[#667781]">Manage the users who are blocked from interacting with the agent.</p>
          </div>
        </div>
        
        <div className="text-center py-16 border-2 border-dashed border-[#E9EDEF] rounded-xl text-[#8696A0]">
          <p className="text-lg font-medium mb-2">No blocked contacts yet</p>
          <p>Contacts you block will appear here.</p>
        </div>
      </div>
    </div>
  );
}
