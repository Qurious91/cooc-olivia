import { type CollabKind } from "./collabs";

export type CollabListing = {
  id: string;
  host: string;
  title: string;
  meta: string;
  location: string;
  status: "모집중" | "마감임박" | "예정" | "진행중";
  detail: string;
  budget: string;
  capacity: string;
  contact: string;
};

export const COLLAB_FEED: Record<CollabKind, CollabListing[]> = {
  "게스트 초청": [
    {
      id: "g1",
      host: "박셰프",
      title: "오마카세 시즈널 게스트 초청",
      meta: "2026.05.10 · 1일",
      location: "서울 청담",
      status: "모집중",
      detail:
        "봄 시즈널 재료로 구성된 12코스 오마카세에 게스트 셰프를 모십니다. 3코스는 게스트 구성이며, 리허설은 이벤트 3일 전 1회 진행합니다.",
      budget: "러닝 개런티 + 정산 10%",
      capacity: "셰프 1명 (보조 1명까지 동반 가능)",
      contact: "park.chef@coocmail.kr",
    },
    {
      id: "g2",
      host: "클로이피자",
      title: "핫한 피제리아 × 게스트 셰프 합작",
      meta: "2026.06.02 · 1일",
      location: "성수",
      status: "예정",
      detail:
        "성수 핫플 피제리아에서 1일 한정 스페셜 메뉴 협업. 도우와 화덕은 호스트가 제공하며 토핑·소스 구성을 게스트가 주도합니다.",
      budget: "고정 300만원 + 원가 별도 정산",
      capacity: "셰프 1팀",
      contact: "chloe@pizzeria.kr",
    },
    {
      id: "g3",
      host: "라메종 한남",
      title: "봄의 디저트 게스트 초청전",
      meta: "2026.05.22 · 3시간",
      location: "한남",
      status: "마감임박",
      detail:
        "봄 컬렉션 주제로 디저트 3종을 게스트 파티시에가 선보이는 초청 이벤트. 재료 공급 및 플레이팅은 호스트 팀과 공동 준비합니다.",
      budget: "초청비 120만원",
      capacity: "파티시에 1명",
      contact: "events@lamaison.kr",
    },
  ],
  "메뉴 테스트": [
    {
      id: "t1",
      host: "누벨 다이닝",
      title: "신메뉴 파스타 3종 블라인드 시식",
      meta: "최대 15명 · 2회",
      location: "서교",
      status: "모집중",
      detail:
        "런칭 예정 파스타 3종에 대한 블라인드 테이스팅. 평가 시트 제공, 회당 90분 내외로 진행되며 피드백 리포트를 공유합니다.",
      budget: "참여비 5만원 + 식사 제공",
      capacity: "회당 15명",
      contact: "test@nuvelle.kr",
    },
    {
      id: "t2",
      host: "플랜트베이스",
      title: "비건 디저트 라인 프리뷰 시식",
      meta: "5회 진행 · 초청제",
      location: "연남",
      status: "모집중",
      detail:
        "비건 디저트 6종의 사전 시식 라운드. 원물·당도·식감 평가지 작성이 포함되며 알러지 확인 후 참여 확정됩니다.",
      budget: "참여비 7만원",
      capacity: "회당 10명",
      contact: "hi@plantbase.kr",
    },
    {
      id: "t3",
      host: "바 하이볼",
      title: "시즈널 칵테일 블라인드 테스트",
      meta: "주말 2회 · 각 8인",
      location: "을지로",
      status: "예정",
      detail:
        "여름 한정 칵테일 5종의 블라인드 시음. 주류 반입 및 외부 촬영은 불가하며, 평가 후 간단한 인터뷰가 있습니다.",
      budget: "참여비 4만원 + 안주 제공",
      capacity: "회당 8명",
      contact: "bar@hiball.kr",
    },
  ],
  "메뉴 개발": [
    {
      id: "d1",
      host: "시그니엘 F&B",
      title: "여름 시즈널 코스 공동 R&D",
      meta: "3개월 프로젝트",
      location: "잠실",
      status: "진행중",
      detail:
        "여름 한정 7코스 디너를 공동 개발합니다. 주 1회 리서치 미팅, 2주 1회 셰프 테이블 테이스팅, 런칭 시 공동 크레딧 표기.",
      budget: "월 500만원 × 3개월 + 런칭 인센티브",
      capacity: "셰프 1팀 (R&D 경험 우대)",
      contact: "rd@signiel.kr",
    },
    {
      id: "d2",
      host: "델리 오브제",
      title: "저염 프리미엄 도시락 라인",
      meta: "런칭 2026.07",
      location: "성수",
      status: "모집중",
      detail:
        "성인 1식 기준 나트륨 500mg 이하의 프리미엄 도시락 라인 개발. 메뉴 6종 프로토타이핑 후 파일럿 판매 진행 예정.",
      budget: "개발비 800만원 + 판매 로열티",
      capacity: "셰프/영양사 1팀",
      contact: "obj@deli-objet.kr",
    },
    {
      id: "d3",
      host: "하이톤 베버리지",
      title: "논카본 시그니처 음료 개발",
      meta: "R&D 6주",
      location: "리모트",
      status: "모집중",
      detail:
        "탄산 없는 기능성 음료 4종의 레시피·가니쉬 개발. 리모트 진행이 기본이며 샘플 테이스팅은 서울 오프라인 1회 포함.",
      budget: "건당 200만원",
      capacity: "바텐더/푸드 스타일리스트",
      contact: "dev@hitone.kr",
    },
  ],
  "팝업 행사": [
    {
      id: "p1",
      host: "한강 브루어리",
      title: "루프탑 디너 팝업 3일",
      meta: "2026.05.17–19",
      location: "뚝섬",
      status: "마감임박",
      detail:
        "한강뷰 루프탑에서 3일간 진행되는 페어링 디너 팝업. 맥주 5종에 맞춘 4코스 구성, 회당 30석 예약제 운영.",
      budget: "세일즈 쉐어 40% + 식재료 지원",
      capacity: "셰프 1팀 + 서비스 2명",
      contact: "popup@hanriver.kr",
    },
    {
      id: "p2",
      host: "삼청 베이크하우스",
      title: "시크릿 베이커리 오픈하우스",
      meta: "2026.06.01 · 1일",
      location: "삼청",
      status: "예정",
      detail:
        "삼청동 베이커리의 주말 오픈하우스에서 한정 빵·잼 라인업을 선보입니다. 호스트가 공간·오븐 제공, 게스트는 시그니처 3종 준비.",
      budget: "매출 쉐어 50%",
      capacity: "베이커 1팀",
      contact: "open@samcheong.kr",
    },
    {
      id: "p3",
      host: "제주 팜 키친",
      title: "팜투테이블 위켄드 다이닝",
      meta: "2026.06.14–16",
      location: "제주",
      status: "모집중",
      detail:
        "제주 팜 현장에서 수확한 식재료로 3일간 위켄드 다이닝 운영. 숙박 2박 제공, 첫날은 농장 투어 후 메뉴 확정.",
      budget: "개런티 500만원 + 숙박/교통 제공",
      capacity: "셰프 1명 + 어시 1명",
      contact: "farm@jejukitchen.kr",
    },
  ],
  "컨설팅": [
    {
      id: "c1",
      host: "스튜디오 오픈로드",
      title: "신규 F&B 브랜드 콘셉트 자문",
      meta: "8주 프로그램",
      location: "서울",
      status: "모집중",
      detail:
        "신규 다이닝 브랜드의 네이밍·메뉴 기획·오픈 전략까지 8주간 자문. 주 1회 대면 미팅 + 주중 리뷰 문서 1건.",
      budget: "총 1,200만원 (월 분할 정산)",
      capacity: "컨설턴트 1명",
      contact: "studio@openroad.kr",
    },
    {
      id: "c2",
      host: "델리 오브제",
      title: "매장 운영 효율화 멘토링",
      meta: "월 2회 · 3개월",
      location: "하이브리드",
      status: "모집중",
      detail:
        "3개 지점 운영 효율화를 위한 멘토링. 주방 동선·인력 스케줄·원가율 분석 3단계로 진행되며 보고서 1건 제공.",
      budget: "월 300만원",
      capacity: "멘토 1명",
      contact: "ops@deli-objet.kr",
    },
    {
      id: "c3",
      host: "바이나잇",
      title: "메뉴 리뉴얼 전략 자문",
      meta: "단기 프로젝트",
      location: "리모트",
      status: "예정",
      detail:
        "캐주얼 다이닝의 메뉴 리뉴얼 전략 단기 자문. 현재 메뉴 분석 → 가설 수립 → 테스트 플랜까지 2주 진행.",
      budget: "총 400만원",
      capacity: "컨설턴트 1명",
      contact: "by@bynight.kr",
    },
  ],
};
