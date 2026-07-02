// ─── StatsPanel ─────────────────────────────────────────────────────────────
// Mini metrics panel showing summary stats on the search page.

import { memo } from "react";
import { Award, Eye, BarChart } from "lucide-react";
import { motion } from "framer-motion";

interface StatsPanelProps {
  totalViews: number;
  totalProfiles: number;
}

export const StatsPanel = memo(function StatsPanel({
  totalViews,
  totalProfiles,
}: StatsPanelProps) {
  const stats = [
    {
      label: "Verified Creators",
      value: "100%",
      icon: <Award className="w-4 h-4 text-brand-primary" aria-hidden="true" />,
    },
    {
      label: "Profile Views",
      value: totalViews,
      icon: <Eye className="w-4 h-4 text-brand-primary" aria-hidden="true" />,
    },
    {
      label: "Total Pool Size",
      value: totalProfiles,
      icon: <BarChart className="w-4 h-4 text-brand-primary" aria-hidden="true" />,
    },
  ];

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: 0.08 }
        }
      }}
      className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-10 text-center"
      role="group"
      aria-label="Discovery statistics"
    >
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          variants={{
            hidden: { 
              opacity: 0, 
              scale: 0.6, 
              y: 40,
              rotate: idx === 0 ? -6 : idx === 2 ? 6 : 0 
            },
            show: { 
              opacity: 1, 
              scale: 1, 
              y: 0,
              rotate: 0,
              transition: { type: "spring", stiffness: 140, damping: 10 } 
            }
          }}
          className="bg-card neo-border p-4 rounded-lg flex flex-col justify-center shadow-hard-sm hover:-translate-y-0.5 hover:shadow-hard transition-all duration-200"
        >
          <div className="flex items-center justify-center gap-1.5 text-txt-muted text-[10px] font-mono font-semibold uppercase tracking-wider mb-2">
            {stat.icon}
            {stat.label}
          </div>
          <div className="text-xl sm:text-2xl font-serif font-normal text-txt-primary">{stat.value}</div>
        </motion.div>
      ))}
    </motion.div>
  );
});
