import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="pt-14 pb-20 min-h-screen">{children}</main>
      <BottomNav />
    </>
  );
}
