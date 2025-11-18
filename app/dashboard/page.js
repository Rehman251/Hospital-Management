"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";




export default function DashboardPage() {
  const router = useRouter();
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const checkUser = async () => {
  //     const { data: { user } } = await supabase.auth.getUser();

  //     if (!user) {
  //       router.push("/"); // redirect to login if not logged in
  //     } else {
  //       setLoading(false);
  //     }
  //   };

  //   checkUser();
  // }, [router]);

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center h-screen text-gray-600">
  //       Checking authentication...
  //     </div>
  //   );
  // }

  // 👇 your original dashboard code (unchanged)
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-500 text-sm">Total Patients</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-2">1,254</h3>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-500 text-sm">Appointments</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-2">84</h3>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-500 text-sm">Doctors</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-2">42</h3>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-500 text-sm">Staff</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-2">126</h3>
        </div>
      </div>
    </div>
  );
}

