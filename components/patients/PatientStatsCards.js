import { Users, UserCheck, Calendar, Users2 } from "lucide-react";

export default function PatientStatsCards({ stats }) {
  const cards = [
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: Users,
      iconBg: "bg-white/20",
      iconColor: "text-white",
    },
    {
      title: "Active Patients",
      value: stats.activePatients,
      icon: UserCheck,
      iconBg: "bg-white/20",
      iconColor: "text-white",
    },
    {
      title: "New This Month",
      value: stats.newThisMonth,
      icon: Calendar,
      iconBg: "bg-white/20",
      iconColor: "text-white",
    },
    {
      title: "Age Groups",
      value: stats.ageGroups,
      icon: Users2,
      iconBg: "bg-white/20",
      iconColor: "text-white",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            style={{
              background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">
                  {card.title}
                </p>
                <p className="text-4xl font-bold text-white">
                  {card.value}
                </p>
              </div>
              <div className={`${card.iconBg} p-3 rounded-lg backdrop-blur-sm`}>
                <Icon className={`w-7 h-7 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}