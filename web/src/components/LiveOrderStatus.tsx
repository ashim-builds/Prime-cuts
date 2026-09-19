interface LiveOrderStatusProps {
  status: string;
}

export default function LiveOrderStatus({ status }: LiveOrderStatusProps) {
  const isTerminalSuccess = status === "completed" || status === "delivered";
  const isTerminalFail = status === "cancelled";

  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-2.5 h-2.5 rounded-full ${
          status === "pending"
            ? "bg-orange-500 animate-pulse"
            : isTerminalFail
            ? "bg-red-500"
            : isTerminalSuccess
            ? "bg-green-500"
            : "bg-blue-500 animate-pulse"
        }`}
      />
      <span
        className={`font-black text-xs uppercase tracking-wider ${
          isTerminalFail
            ? "text-red-600"
            : isTerminalSuccess
            ? "text-green-600"
            : "text-stone-900"
        }`}
      >
        {status === "delivered" ? "Delivered ✓" : status}
      </span>
    </div>
  );
}
