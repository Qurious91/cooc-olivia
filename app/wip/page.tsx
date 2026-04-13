import BottomNav from "../bottom-nav";
import SiteHeader from "../site-header";

export default function WIP() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader />
      <div className="flex-1 flex items-center justify-center text-text-4 pb-24 md:pb-0">
        제작중
      </div>
      <BottomNav />
    </div>
  );
}
