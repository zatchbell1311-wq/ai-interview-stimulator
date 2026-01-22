import type { Metadata } from "next";
import "./globals.css";
import { InterviewProvider } from "@/lib/interview-context";

export const metadata: Metadata = {
  title: "AI Interview Simulator",
  description: "Anti-Gravity Behavioral Interview Trainer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <InterviewProvider>
          {children}
        </InterviewProvider>
      </body>
    </html>
  );
}
