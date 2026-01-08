import "./globals.css";

export const metadata = {
  title: "Task 2 - AI Feedback System",
  description: "Two-dashboard AI feedback system"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
