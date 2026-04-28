import { NextResponse } from "next/server";

// 국세청 사업자등록정보 진위확인 + 상태조회를 한 번에 호출.
// 응답은 두 API의 원시 JSON을 그대로 묶어서 반환 (디버깅·UX 디자인 결정 전용).
//
// 환경변수: DATA_GO_KR_API_KEY 에 data.go.kr 서비스키 (인코딩된 형태) 저장.

type ReqBody = {
  b_no?: string;
  p_nm?: string;
  start_dt?: string;
  p_nm2?: string;
  corp_no?: string;
};

const VALIDATE_URL = "https://api.odcloud.kr/api/nts-businessman/v1/validate";
const STATUS_URL = "https://api.odcloud.kr/api/nts-businessman/v1/status";

export async function POST(req: Request) {
  const apiKey = process.env.DATA_GO_KR_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "DATA_GO_KR_API_KEY 환경변수가 설정되지 않았어요." },
      { status: 500 },
    );
  }

  let body: ReqBody;
  try {
    body = (await req.json()) as ReqBody;
  } catch {
    return NextResponse.json({ error: "잘못된 JSON" }, { status: 400 });
  }

  const bNoRaw = (body.b_no ?? "").replace(/[^0-9]/g, "");
  if (bNoRaw.length !== 10) {
    return NextResponse.json(
      { error: "사업자등록번호는 숫자 10자리여야 해요." },
      { status: 400 },
    );
  }

  const startDt = (body.start_dt ?? "").replace(/[^0-9]/g, "");
  const pNm = (body.p_nm ?? "").trim();

  if (!startDt || startDt.length !== 8) {
    return NextResponse.json(
      { error: "개업일자는 YYYYMMDD 형식 8자리여야 해요." },
      { status: 400 },
    );
  }
  if (!pNm) {
    return NextResponse.json(
      { error: "대표자 성명을 입력해주세요." },
      { status: 400 },
    );
  }

  // 서비스키는 보통 인코딩된 형태로 발급되므로 그대로 사용.
  // URL에 직접 붙이면 `+`/`=` 같은 문자가 한 번 더 인코딩될 수 있어, URL 객체 사용.
  const validateUrl = `${VALIDATE_URL}?serviceKey=${apiKey}`;
  const statusUrl = `${STATUS_URL}?serviceKey=${apiKey}`;

  const validateBody = {
    businesses: [
      {
        b_no: bNoRaw,
        start_dt: startDt,
        p_nm: pNm,
        p_nm2: body.p_nm2 ?? "",
        b_nm: "",
        corp_no: (body.corp_no ?? "").replace(/[^0-9]/g, ""),
        b_sector: "",
        b_type: "",
        b_adr: "",
      },
    ],
  };

  const statusBody = {
    b_no: [bNoRaw],
  };

  const [validateRes, statusRes] = await Promise.allSettled([
    fetch(validateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validateBody),
    }),
    fetch(statusUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(statusBody),
    }),
  ]);

  const readResult = async (
    settled: PromiseSettledResult<Response>,
  ): Promise<{ status: number; data: unknown } | { error: string }> => {
    if (settled.status === "rejected") {
      return { error: String(settled.reason) };
    }
    const r = settled.value;
    const text = await r.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { status: r.status, data };
  };

  return NextResponse.json({
    request: {
      validate: validateBody,
      status: statusBody,
    },
    validate: await readResult(validateRes),
    status: await readResult(statusRes),
  });
}
