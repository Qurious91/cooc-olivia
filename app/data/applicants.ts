export type Applicant = { name: string; role: string; message: string };

export const APPLICANT_POOL: Applicant[] = [
  { name: "김도현", role: "파인다이닝 셰프 · 6년차", message: "시즈널 코스 R&D 경험 있습니다. 함께 하고 싶어요." },
  { name: "박유나", role: "파티시에 · 5년차", message: "디저트 파트로 합류 가능합니다. 포트폴리오 보내드릴게요." },
  { name: "이준혁", role: "바리스타 · 4년차", message: "음료 페어링 파트에 관심 있습니다." },
  { name: "최은서", role: "푸드 스타일리스트", message: "비주얼/플레이팅 쪽으로 도와드릴 수 있어요." },
  { name: "정서진", role: "소믈리에", message: "와인 리스트 큐레이션 도와드립니다." },
  { name: "한지우", role: "비건 셰프", message: "플랜트베이스 메뉴 구성 관심 있어요." },
  { name: "오세훈", role: "R&D 연구원", message: "푸드랩 출신입니다. 레시피 검증 단계에서 기여할 수 있어요." },
  { name: "윤다솜", role: "팝업 기획자", message: "팝업 운영/물류 쪽 경험 많습니다." },
];

function hashId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

export function applicantCount(id: string) {
  return (hashId(id) % 3) + 1;
}

export function pickApplicants(id: string): Applicant[] {
  const h = hashId(id);
  const count = applicantCount(id);
  const start = h % APPLICANT_POOL.length;
  return Array.from(
    { length: count },
    (_, i) => APPLICANT_POOL[(start + i) % APPLICANT_POOL.length],
  );
}
