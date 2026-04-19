"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const goHome = () => router.push("/home");

  return (
    <>
      <div className="min-h-screen bg-white text-text-4 flex flex-col">
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-text-1">COOC</h1>
              <p className="mt-2 text-sm text-text-5">CO-CREATION WITH OUR CHEFS</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                goHome();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-text-4 mb-1.5">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-black/15 text-base text-text-1 placeholder:text-text-6 focus:outline-none focus:border-[#999f54]"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-4 mb-1.5">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-black/15 text-base text-text-1 placeholder:text-text-6 focus:outline-none focus:border-[#999f54]"
                  placeholder="8자 이상"
                />
              </div>

              <button
                type="submit"
                onClick={goHome}
                className="w-full mt-2 py-2.5 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold hover:opacity-90"
              >
                로그인
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-text-5">
              아직 계정이 없으신가요?{" "}
              <Link href="/home" className="font-semibold text-[#999f54] hover:underline">
                회원가입
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-3 text-[11px] text-text-6">
              <span className="h-px flex-1 bg-black/10" />
              또는
              <span className="h-px flex-1 bg-black/10" />
            </div>

            <div className="mt-4 space-y-2.5">
              <button
                type="button"
                onClick={goHome}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-black/15 bg-white text-sm font-medium text-text-1 hover:bg-black/[.03]"
              >
                <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Google로 로그인
              </button>

              <button
                type="button"
                onClick={goHome}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#FEE500] text-sm font-medium text-[#191600] hover:opacity-90"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#191600" d="M12 3C6.48 3 2 6.58 2 11c0 2.86 1.87 5.37 4.7 6.78-.21.75-.76 2.75-.87 3.18-.14.54.2.53.41.39.17-.11 2.66-1.81 3.73-2.54.65.09 1.33.14 2.03.14 5.52 0 10-3.58 10-8S17.52 3 12 3z"/>
                </svg>
                카카오로 로그인
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
