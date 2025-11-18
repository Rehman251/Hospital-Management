"use client";

export default function AppointmentsCalendar({ 
  appointments, 
  currentDate, 
  onPrevious, 
  onNext, 
  onToday,
  onDateClick,
  onAppointmentClick 
}) {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const calendarDays = generateCalendarDays(year, month, firstDay, daysInMonth);

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200/50 p-6">
      <CalendarHeader 
        month={month}
        year={year}
        monthNames={monthNames}
        onPrevious={onPrevious}
        onNext={onNext}
        onToday={onToday}
      />
      
      <CalendarGrid 
        dayNames={dayNames}
        calendarDays={calendarDays}
        appointments={appointments}
        currentDate={currentDate}
        onDateClick={onDateClick}
        onAppointmentClick={onAppointmentClick}
      />
    </div>
  );
}

function generateCalendarDays(year, month, firstDay, daysInMonth) {
  const calendarDays = [];
  
  // Previous month days
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({ 
      day: prevMonthDays - i, 
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevMonthDays - i)
    });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ 
      day: i, 
      isCurrentMonth: true,
      date: new Date(year, month, i)
    });
  }
  
  // Next month days
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({ 
      day: i, 
      isCurrentMonth: false,
      date: new Date(year, month + 1, i)
    });
  }

  return calendarDays;
}

function CalendarHeader({ month, year, monthNames, onPrevious, onNext, onToday }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-900">
        {monthNames[month]} {year}
      </h2>
      <div className="flex items-center gap-3">
        <button
          onClick={onPrevious}
          className="p-2 hover:bg-gray-100/80 rounded-lg transition-colors border border-gray-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={onToday}
          className="text-white px-4 py-2 rounded-lg font-medium transition-all"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}
          onMouseOver={(e) => e.target.style.background = 'linear-gradient(135deg, #2d5a7b 0%, #3d6a8b 100%)'}
          onMouseOut={(e) => e.target.style.background = 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)'}
        >
          Today
        </button>
        <button
          onClick={onNext}
          className="p-2 hover:bg-gray-100/80 rounded-lg transition-colors border border-gray-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function CalendarGrid({ dayNames, calendarDays, appointments, currentDate, onDateClick, onAppointmentClick }) {
  const getAppointmentsForDate = (date) => {
    // Simple date comparison without timezone complications
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed
    const day = date.getDate();
    
    // Format as YYYY-MM-DD to match database
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    return appointments.filter(apt => {
      return apt.appointment_date === dateStr;
    });
  };

  return (
    <div className="grid grid-cols-7 gap-2">
      {dayNames.map((day) => (
        <div 
          key={day} 
          className="text-center py-3 font-bold text-white text-sm rounded-lg"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}
        >
          {day}
        </div>
      ))}
      
      {calendarDays.map((dayObj, index) => {
        const isToday = dayObj.isCurrentMonth && 
          dayObj.date.toDateString() === new Date().toDateString();
        
        const dayAppointments = getAppointmentsForDate(dayObj.date);

        return (
          <CalendarDay 
            key={index}
            dayObj={dayObj}
            isToday={isToday}
            appointments={dayAppointments}
            onDateClick={onDateClick}
            onAppointmentClick={onAppointmentClick}
          />
        );
      })}
    </div>
  );
}

function CalendarDay({ dayObj, isToday, appointments, onDateClick, onAppointmentClick }) {
  return (
    <div
      className={`min-h-[120px] p-2 border border-gray-200/70 rounded-lg transition-all duration-200 ${
        dayObj.isCurrentMonth 
          ? "bg-white/60 hover:bg-white/80 cursor-pointer" 
          : "bg-gray-50/50"
      } ${
        isToday 
          ? "ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-sm" 
          : ""
      }`}
      onClick={() => {
        if (appointments.length > 0) {
          onDateClick?.(dayObj.date);
        }
      }}
    >
      {/* Day Number */}
      <div className={`text-sm font-semibold mb-2 ${
        dayObj.isCurrentMonth 
          ? isToday 
            ? "text-blue-700" 
            : "text-gray-900" 
          : "text-gray-400"
      }`}>
        {dayObj.day}
      </div>

      {/* Appointment Count */}
      {appointments.length > 0 && (
        <div className="mb-2">
          <div className="text-xs text-gray-600 font-medium bg-blue-50/50 px-2 py-1 rounded-full inline-block">
            {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Appointments List - Compact */}
      <div className="space-y-1">
        {appointments.slice(0, 2).map((appointment, idx) => (
          <div 
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              onAppointmentClick?.(appointment);
            }}
            className="text-xs p-2 rounded cursor-pointer bg-gradient-to-r from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 transition-all border border-blue-200/50 shadow-sm"
            title={`Click to view ${appointment.patient_name}'s appointment`}
          >
            <div className="font-semibold text-gray-900 truncate">
              {appointment.patient_name}
            </div>
            <div className="text-gray-600 text-[10px]">
              {appointment.appointment_time}
            </div>
          </div>
        ))}
        
        {appointments.length > 2 && (
          <div 
            className="text-xs text-blue-700 text-center p-2 bg-blue-100/50 rounded cursor-pointer hover:bg-blue-200/50 font-semibold transition-colors border border-blue-200/30"
            onClick={(e) => {
              e.stopPropagation();
              onDateClick?.(dayObj.date);
            }}
          >
            +{appointments.length - 2} more
          </div>
        )}
      </div>
    </div>
  );
}