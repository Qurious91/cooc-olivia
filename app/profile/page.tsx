import BottomNav from "../bottom-nav";
import SiteHeader from "../site-header";

export default function Profile() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader />

      <main className="flex-1 px-4 pt-6 pb-24 md:pb-8 max-w-2xl w-full mx-auto">
        <div className="flex justify-end mb-2">
          <button className="text-xs px-3 py-1.5 rounded-full border border-black/15 text-text-1 hover:bg-[#999f54]/10">
            수정하기
          </button>
        </div>

        <section className="flex items-center gap-4 rounded-xl border border-black/10 bg-white shadow-sm p-5">
          <div className="w-20 h-20 rounded-full bg-[#999f54] text-[#F2F0DC] flex items-center justify-center text-2xl font-bold">
            박
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-text-1">박셰프</h1>
            <p className="text-sm text-text-5">F&B 크리에이터 · 서울</p>
            <p className="text-xs text-text-6 mt-1">함께 만드는 시즈널 다이닝</p>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-black/10 bg-white shadow-sm p-5">
          <h2 className="text-sm font-semibold text-text-1 mb-3">현재 직책</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between gap-3">
              <div>
                <div className="text-text-1">Head Chef</div>
                <div className="text-xs text-text-5">Restaurant ONUL · 서울 한남동</div>
              </div>
              <span className="text-xs text-text-6 shrink-0">2023 – 현재</span>
            </li>
            <li className="flex justify-between gap-3">
              <div>
                <div className="text-text-1">Menu Consultant</div>
                <div className="text-xs text-text-5">COOC Studio</div>
              </div>
              <span className="text-xs text-text-6 shrink-0">2024 – 현재</span>
            </li>
            <li className="flex justify-between gap-3">
              <div>
                <div className="text-text-1">Pop-up Director</div>
                <div className="text-xs text-text-5">Seasonal Tasting Series</div>
              </div>
              <span className="text-xs text-text-6 shrink-0">2025 – 현재</span>
            </li>
          </ul>
        </section>

      </main>

      <BottomNav />
    </div>
  );
}
