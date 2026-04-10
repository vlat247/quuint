"use client";

interface HistoryViewProps {
  historyItems: any[];
  onSelectHistory: (item: any) => void;
}

export function HistoryView({ historyItems, onSelectHistory }: HistoryViewProps) {
  return (
    <div className="animate-in fade-in duration-300 pt-4">
      <h2 className="text-[22px] font-bold text-zinc-900 mb-4 px-1">Recent</h2>
      <div className="space-y-3">
        {historyItems.length === 0 ? (
          <div className="p-10 text-center rounded-[24px] border border-dashed border-zinc-300 bg-zinc-50">
            <p className="text-zinc-500 text-[14px]">No history yet.</p>
          </div>
        ) : (
          historyItems.map((item, i) => {
            const isDigest = item.channel.startsWith("[Digest]");
            const title = isDigest ? item.channel.replace("[Digest] ", "Folder: ") : item.title || item.channel;
            return (
              <div 
                key={i} 
                onClick={() => onSelectHistory(item)} 
                className="p-4 rounded-[16px] bg-white border border-zinc-100 active:scale-[0.98] transition-transform cursor-pointer shadow-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${isDigest ? "bg-blue-50 text-blue-600" : "bg-zinc-100 text-zinc-600"}`}>
                    {isDigest ? "Digest" : "Channel"}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    {new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
                <h4 className="font-semibold text-zinc-900 truncate text-[15px]">{title}</h4>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
