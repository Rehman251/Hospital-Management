import DashboardLayout from '@/components/layout/DashboardLayout';
import './globals.css';

export const metadata = {
  title: 'MediCare Pro',
  description: 'Hospital Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  );
}