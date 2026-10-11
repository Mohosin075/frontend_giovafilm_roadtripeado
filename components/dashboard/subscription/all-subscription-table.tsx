type Props = {
  data: any[];
};

export function SubscriptionTable({ data }: Props) {
  return (
    <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-900/60 border-b border-gray-200 dark:border-slate-800">
              {[
                "Transaction ID",
                "Plan",
                "Amount",
                "Date",
                "Next Billing",
                "Status",
              ].map((head) => (
                <th
                  key={head}
                  className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
            {data.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-6 py-5 font-bold uppercase text-gray-900 dark:text-slate-100">{sub.id}</td>
                <td className="px-6 py-5 text-gray-800 dark:text-slate-200">{sub.plan}</td>
                <td className="px-6 py-5 font-black text-gray-900 dark:text-slate-100">{sub.amount}</td>
                <td className="px-6 py-5 text-gray-500 dark:text-slate-400">{sub.date}</td>
                <td className="px-6 py-5 text-gray-500 dark:text-slate-400">{sub.nextBilling}</td>
                <td className="px-6 py-5">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      sub.status === "Active"
                        ? "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300"
                    }`}
                  >
                    {sub.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
