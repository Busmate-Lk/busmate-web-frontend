import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import ClientSWBootstrap from '../components/shared/ClientSWBootstrap';

export const metadata: Metadata = {
  title: "BUSMATE LK - Transportation Management",
  description: "Transportation management dashboard for BUSMATE LK",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <AuthProvider>
          <ClientSWBootstrap />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
