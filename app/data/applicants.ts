export type ApplicantAuthor = "소속" | "이름" | "둘 다";

export type Applicant = {
  name: string;
  affiliation: string;
  position: string;
  location: string;
  message: string;
  author: ApplicantAuthor;
};

export const APPLICANT_POOL: Applicant[] = [
  {
    name: "김도현",
    affiliation: "Bistro Lune",
    position: "파인다이닝 셰프",
    location: "서울 성수",
    message: "시즈널 코스 R&D 경험 있습니다. 함께 하고 싶어요.",
    author: "둘 다",
  },
  {
    name: "박유나",
    affiliation: "Pâtisserie Nine",
    position: "파티시에",
    location: "서울 연남",
    message: "디저트 파트로 합류 가능합니다. 포트폴리오 보내드릴게요.",
    author: "이름",
  },
  {
    name: "이준혁",
    affiliation: "Cafe Northern",
    position: "바리스타",
    location: "서울 한남",
    message: "음료 페어링 파트에 관심 있습니다.",
    author: "소속",
  },
  {
    name: "최은서",
    affiliation: "Studio Plate",
    position: "푸드 스타일리스트",
    location: "서울 합정",
    message: "비주얼/플레이팅 쪽으로 도와드릴 수 있어요.",
    author: "둘 다",
  },
  {
    name: "정서진",
    affiliation: "Cellar 33",
    position: "소믈리에",
    location: "서울 청담",
    message: "와인 리스트 큐레이션 도와드립니다.",
    author: "둘 다",
  },
  {
    name: "한지우",
    affiliation: "Green Bowl",
    position: "비건 셰프",
    location: "서울 망원",
    message: "플랜트베이스 메뉴 구성 관심 있어요.",
    author: "이름",
  },
  {
    name: "오세훈",
    affiliation: "FoodLab Korea",
    position: "R&D 연구원",
    location: "성남 판교",
    message: "푸드랩 출신입니다. 레시피 검증 단계에서 기여할 수 있어요.",
    author: "소속",
  },
  {
    name: "윤다솜",
    affiliation: "Pop Agency",
    position: "팝업 기획자",
    location: "서울 을지로",
    message: "팝업 운영/물류 쪽 경험 많습니다.",
    author: "둘 다",
  },
];

export function displayApplicantName(a: Applicant): string {
  if (a.author === "이름") return a.name;
  if (a.author === "소속") return a.affiliation;
  return [a.affiliation, a.name].filter(Boolean).join(" · ");
}

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
