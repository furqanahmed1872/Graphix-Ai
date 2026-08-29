import Footer from "@/components/landing/Footer";
import NavBar from "@/components/NavBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main style={{ background: "var(--gx-bg)" }}>
      <NavBar />
      {children}
      <Footer />
    </main>
  );
}
