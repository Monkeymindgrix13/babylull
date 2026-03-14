import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PlayerProvider from "@/components/PlayerProvider";
import PlayerBar from "@/components/PlayerBar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlayerProvider>
      <Header />
      <main className="pt-14 pb-20 min-h-screen">{children}</main>
      <PlayerBar />
      <BottomNav />
    </PlayerProvider>
  );
}
