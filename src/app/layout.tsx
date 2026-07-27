import type { Metadata } from 'next';
import './globals.css';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export const metadata: Metadata = {
  title: 'Arc Ecosystem Radar',
  description: 'Comprehensive dashboard tracking the Arc blockchain ecosystem - projects, network stats, and builder activity.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-[#e2e2e2] antialiased">
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}
