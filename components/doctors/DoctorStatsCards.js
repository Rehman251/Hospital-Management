import { Users, UserCheck, Calendar, Building2 } from "lucide-react";

export default function DoctorStatsCards({ stats }) {
  // Dummy data for demonstration
  const dummyStats = {
    totalDoctors: 42,
    activeDoctors: 38,
    newThisMonth: 5,
    departments: 8,
  };

  // Use provided stats or fallback to dummy data
  const displayStats = stats || dummyStats;

  const cards = [
    {
      title: "Total Doctors",
      value: displayStats.totalDoctors,
      icon: Users,
      gradient: "linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)",
      hoverGradient: "linear-gradient(135deg, #2d5a7b 0%, #3a6a8c 100%)",
    },
    {
      title: "Active Doctors",
      value: displayStats.activeDoctors,
      icon: UserCheck,
      gradient: "linear-gradient(135deg, #0f5132 0%, #1a7a4c 100%)",
      hoverGradient: "linear-gradient(135deg, #1a7a4c 0%, #2a8a5c 100%)",
    },
    {
      title: "New This Month",
      value: displayStats.newThisMonth,
      icon: Calendar,
      gradient: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
      hoverGradient: "linear-gradient(135deg, #8b5cf6 0%, #9b6cf6 100%)",
    },
    {
      title: "Departments",
      value: displayStats.departments,
      icon: Building2,
      gradient: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
      hoverGradient: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="relative rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer overflow-hidden"
          >
            {/* Background with gradient */}
            <div 
              className="absolute inset-0 transition-all duration-300 group-hover:opacity-90"
              style={{ background: card.gradient }}
            />
            
            {/* Hover overlay */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
              style={{ background: card.hoverGradient }}
            />
            
            {/* Content */}
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-white/90 text-sm font-medium mb-2">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-white">
                  {card.value}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm group-hover:bg-white/25 transition-all duration-300">
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-white to-transparent" />
          </div>
        );
      })}
    </div>
  );
}