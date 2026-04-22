import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "COOC",
  description: "CO-CREATION WITH OUR CHEFS",
};

// 세션에 splash를 이미 본 기록이 있으면 <html>에 클래스를 붙여 CSS로 숨긴다.
// 하이드레이션 전에 실행되어야 재방문자 깜박임이 0이 된다.
const SPLASH_INIT_SCRIPT = `try{var k='cooc.splash.v1';if(sessionStorage.getItem(k)){document.documentElement.classList.add('splash-hidden');}else{sessionStorage.setItem(k,'1');}}catch(_){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SPLASH_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <div className="splash" aria-hidden="true">
          <h1 className="splash__title">COOC</h1>
          <p className="splash__subtitle">CO-CREATION WITH OUR CHEFS</p>
        </div>
        {children}
      </body>
    </html>
  );
}
