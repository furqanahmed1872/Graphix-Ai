import Footer from "@/components/landing/Footer";
import NavBar from "@/components/NavBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="bg-[#111212] border-b border-x border-white/20">
      <NavBar />
      {children}
      <Footer />
    </main>
  );
}
