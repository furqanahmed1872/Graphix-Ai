import "./globals.css";
import AppBootstrapper from "@/components/AppBootstrapper";

export const metadata = {
  title: "Graphix — AI Data Visualization",
  description: "Turn your data into beautiful charts with AI",
  icon:"/logo.png",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#111212",
          overflowX: "hidden",
        }}
      >
        <AppBootstrapper>{children}</AppBootstrapper>
      </body>
    </html>
  );
}
