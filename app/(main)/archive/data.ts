export type ArchiveItem = {
  id: string;
  kind: string;
  image: string;
  title: string;
  host: string;
  period: string;
  location: string;
  desc: string;
};

export const ARCHIVE_DUMMY: ArchiveItem[] = [
  {
    id: "a1",
    kind: "메뉴 개발",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80",
    title: "시즈널 디저트 코스 공동개발",
    host: "박셰프 × 이파티시에",
    period: "2026.03 – 2026.06",
    location: "서울 성수",
    desc: "성수 한식 파인다이닝과 청담 파티스리 팀의 공동 디저트 코스. 제철 과일·곡물 베이스로 5개월간 시즌 메뉴 4종을 개발해 본점 상설 코스 후반부에 편입합니다.\n\n· 주 1회 합동 테이스팅\n· 원가/플레이팅 기획은 양측 공동\n· 완성 메뉴는 양 매장 동시 런칭",
  },
  {
    id: "a2",
    kind: "팝업 행사",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1600&q=80",
    title: "한남 팝업 다이닝 3일",
    host: "정셰프 × 한브랜드",
    period: "2026.05.01 – 05.03",
    location: "서울 한남",
    desc: "3일간 진행되는 한남 팝업 다이닝. 한브랜드의 신제품 런칭과 맞춰 7코스 페어링 메뉴를 구성합니다.\n\n· 1일 2회 · 2시간 세션\n· 와인·논알콜 페어링 포함\n· 예약제 30석/세션",
  },
  {
    id: "a3",
    kind: "메뉴 개발",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1600&q=80",
    title: "와인 페어링 시그니처 음료",
    host: "김바리스타 × 최소믈리에",
    period: "2026.02 – 2026.07",
    location: "서울 청담",
    desc: "논알콜 바 프로그램을 와인 소믈리에와 공동 기획. 6개월간 시즌별 페어링 음료 8종을 개발하고 청담 본점 디너 코스에 편입합니다.\n\n· 스페셜티 티·하우스 인퓨전 베이스\n· 와인 페어링과 동일한 가격대 유지",
  },
  {
    id: "a4",
    kind: "메뉴 개발",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80",
    title: "브런치 메뉴 신규 라인업",
    host: "오베이커 × 유셰프",
    period: "2026.04 – 2026.09",
    location: "서울 연남",
    desc: "연남동 브런치 매장의 신규 라인업 테스트. 베이커리와 셰프 팀이 공동으로 6종 프로토타입을 돌려가며 A/B 판매 데이터를 수집합니다.\n\n· 주말 한정 테스트 슬롯 운영\n· 피드백 설문 → 월 1회 리뷰\n· 상위 3종은 정규 메뉴 편입",
  },
  {
    id: "a5",
    kind: "게스트 초청",
    image: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1600&q=80",
    title: "오사카 이치류 게스트 셰프 위크",
    host: "최셰프 × Ichiryu Osaka",
    period: "2026.06.10 – 06.16",
    location: "서울 도산",
    desc: "오사카 미쉐린 1스타 Ichiryu 오너셰프를 1주일간 초청. 양 팀 합작으로 일본-한식 크로스오버 10코스를 구성하며, 마지막 날은 4핸즈 디너로 마무리합니다.\n\n· 전 기간 예약제\n· 디너 1회차/일\n· 일부 석은 업계 초청",
  },
  {
    id: "a6",
    kind: "컨설팅",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1600&q=80",
    title: "신생 다이닝 메뉴 컨설팅",
    host: "한셰프 × 스튜디오 밀",
    period: "2026.01 – 2026.04",
    location: "서울 용산",
    desc: "오픈 준비중인 용산 다이닝의 오픈 메뉴 컨설팅. 컨셉 정립부터 시그니처 개발, 주방 워크플로우 세팅까지 4개월 풀패키지.\n\n· 주 1회 현장 세션\n· 원가/판가 구조 수립 포함\n· 오픈 후 한 달 모니터링",
  },
];
