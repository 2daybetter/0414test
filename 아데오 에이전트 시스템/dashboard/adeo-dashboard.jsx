import { useState } from "react";

/* ─────────────────────────────────────────────
   DESIGN TOKENS — shadcn/ui dark theme
   ref: https://ui.shadcn.com/docs/theming
───────────────────────────────────────────── */
const T = {
  // Base surfaces (zinc scale — light)
  background:  "#ffffff",   // white
  card:        "#ffffff",
  surface:     "#f4f4f5",   // zinc-100
  elevated:    "#e4e4e7",   // zinc-200 (hover states)

  // Borders
  border:      "#e4e4e7",   // zinc-200
  borderMuted: "#d4d4d8",   // zinc-300
  input:       "#e4e4e7",

  // Text
  foreground:     "#09090b",  // zinc-950
  mutedFg:        "#71717a",  // zinc-500
  dimFg:          "#a1a1aa",  // zinc-400

  // Radius (matches --radius: 0.625rem)
  radius:   "0.625rem",  // 10px
  radiusSm: "0.375rem",  // 6px
  radiusLg: "0.75rem",   // 12px
  radiusXl: "0.875rem",  // 14px

  // Accent colors (shadcn chart palette style)
  primary:  "#7c3aed",   // violet-600
  proposal: "#4f46e5",   // indigo-600
  agency:   "#2563eb",   // blue-600
  ops:      "#059669",   // emerald-600
  lab:      "#ea580c",   // orange-600

  // Semantic
  success:     "#16a34a",  // green-600
  successMuted:"#dcfce7",
  warn:        "#d97706",  // amber-600
  warnMuted:   "#fef9c3",
  danger:      "#dc2626",  // red-600
  dangerMuted: "#fee2e2",
};

/* ─────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────── */
const OPPORTUNITIES = [
  { id: "OPP-001", name: "스마트팩토리 AI 관제 시스템",  client: "한국제조(주)",    value: "4.2억", stage: "제안서 작성중", assigned: "전략팀",     match: 82, days: 12, policy: "스마트공장 고도화 사업" },
  { id: "OPP-002", name: "의료 클라우드 EMR 전환",       client: "서울의료재단",    value: "2.8억", stage: "정책자금 매칭", assigned: "정책자금팀",   match: 74, days: 5,  policy: "의료기관 디지털 전환" },
  { id: "OPP-003", name: "물류 TMS 고도화",             client: "동방로지스틱스",   value: "6.1억", stage: "제안서 완성",   assigned: "전략팀",     match: 91, days: 18, policy: "물류 스마트화 지원" },
  { id: "OPP-004", name: "공공기관 통합포털 구축",       client: "광주광역시",      value: "3.5억", stage: "기회 탐색",     assigned: "전략팀",     match: 68, days: 3,  policy: "공공 디지털서비스 혁신" },
  { id: "OPP-005", name: "핀테크 백오피스 자동화",       client: "소울페이먼츠",    value: "1.9억", stage: "정책자금 매칭", assigned: "정책자금팀",   match: 79, days: 7,  policy: "혁신창업 패키지 지원" },
];

const PROJECTS = [
  { id: "PRJ-001", name: "K-바이오 연구원 정보시스템",   phase: "IM", progress: 62, team: "구축사", days_in_phase: 14, outputs: 8,  status: "normal", budget: "3.8억" },
  { id: "PRJ-002", name: "스마트시티 통합 대시보드",     phase: "DE", progress: 38, team: "구축사", days_in_phase: 6,  outputs: 5,  status: "normal", budget: "5.2억" },
  { id: "PRJ-003", name: "이커머스 풀스택 리뉴얼",       phase: "TE", progress: 87, team: "구축사", days_in_phase: 15, outputs: 12, status: "warn",   budget: "2.1억" },
  { id: "PRJ-004", name: "HR SaaS 플랫폼 MVP",          phase: "AY", progress: 18, team: "구축사", days_in_phase: 2,  outputs: 2,  status: "normal", budget: "1.6억" },
  { id: "PRJ-005", name: "공공 민원 처리 시스템",        phase: "PM", progress: 5,  team: "구축사", days_in_phase: 1,  outputs: 1,  status: "normal", budget: "4.4억" },
];

const OPERATIONS = [
  { id: "OPS-001", name: "국민은행 기업뱅킹 포털",   uptime: 99.97, issues_open: 1, issues_resolved: 18, visitors_w: 142300, nps: 74, last_deploy: "2026-04-08" },
  { id: "OPS-002", name: "대림산업 사내 인트라넷",    uptime: 99.81, issues_open: 3, issues_resolved: 42, visitors_w: 23400,  nps: 61, last_deploy: "2026-03-28" },
  { id: "OPS-003", name: "서울관광공사 공식 사이트",  uptime: 100.0, issues_open: 0, issues_resolved: 7,  visitors_w: 88100,  nps: 82, last_deploy: "2026-04-12" },
];

const OPS_ISSUES = [
  { id: "ISS-014", project: "국민은행 기업뱅킹 포털",  type: "성능", severity: "보통", summary: "야간 배치 처리 지연 (23:00~01:00)", status: "조사중",  created: "2026-04-15" },
  { id: "ISS-015", project: "대림산업 사내 인트라넷",   type: "기능", severity: "낮음", summary: "IE11 첨부파일 다운로드 실패",        status: "수정완료", created: "2026-04-13" },
  { id: "ISS-016", project: "대림산업 사내 인트라넷",   type: "UI",   severity: "낮음", summary: "모바일 메뉴 z-index 충돌",          status: "대기",    created: "2026-04-14" },
  { id: "ISS-017", project: "대림산업 사내 인트라넷",   type: "보안", severity: "높음", summary: "API 응답에 민감정보 포함 가능성",    status: "조사중",  created: "2026-04-16" },
];

const RESEARCH_REPORTS = [
  { id: "LAB-001", topic: "AI 에이전트 오케스트레이션 프레임워크", type: "기술 리서치", status: "완료",  recommendation: "도입 권장",  date: "2026-04-10" },
  { id: "LAB-002", topic: "Vercel vs AWS vs Azure 프론트엔드 배포", type: "벤치마킹",   status: "완료",  recommendation: "검토 필요",  date: "2026-04-07" },
  { id: "LAB-003", topic: "Next.js 15 App Router 마이그레이션",     type: "도입 검토",  status: "진행중", recommendation: "—",         date: "2026-04-16" },
  { id: "LAB-004", topic: "Supabase vs PlanetScale DB-as-a-Service", type: "비교 분석", status: "완료",  recommendation: "파일럿 권장", date: "2026-04-03" },
  { id: "LAB-005", topic: "WebAssembly 도입 가능성",                 type: "기술 리서치", status: "대기",  recommendation: "—",         date: "—" },
];

const KPI_WEEKLY = {
  period: "2026-04-10 ~ 2026-04-16",
  outputs_created: 11, outputs_target: 3,
  validation_pass_rate: 94,
  projects_active: 5, proposals_active: 5, proposals_submitted: 1,
  delays: [{ project: "이커머스 풀스택 리뉴얼", phase: "TE", days_over: 1, threshold: 14 }],
  by_phase: { PM: 1, AY: 1, DE: 1, IM: 1, TE: 1 },
  team_output: { "웹기획팀": 4, "디자인팀": 3, "개발팀": 4 },
};

const KPI_MONTHLY = {
  period: "2026년 04월",
  total_outputs: 38, validation_pass_rate: 91,
  proposal_conversion: 60, policy_fund_matches: 3,
  ops_uptime_avg: 99.93, lab_reports: 4,
  revenue_est: "12.4억", pipeline_est: "18.5억",
  summary_bullets: [
    "K-바이오, 스마트시티 등 2개 신규 프로젝트 착수, 총 5개 병행 진행",
    "이커머스 풀스택 리뉴얼 TE 단계 진입 — 검증 최종 단계",
    "정책자금 3건 매칭 완료 (물류 TMS, 의료 EMR, 핀테크)",
    "연구소 리서치 4건 완료, Next.js 15 마이그레이션 검토 진행중",
  ],
};

const RECENT_OUTPUTS = [
  { name: "tech-spec-K바이오연구원.md",        team: "개발팀",   project: "K-바이오 연구원",     age: "2일 전" },
  { name: "화면설계서-스마트시티.md",            team: "웹기획팀", project: "스마트시티 대시보드", age: "3일 전" },
  { name: "제안서-물류TMS고도화.md",             team: "전략팀",   project: "OPP-003",            age: "4일 전" },
  { name: "design-system-스마트시티.md",         team: "디자인팀", project: "스마트시티 대시보드", age: "5일 전" },
  { name: "LAB-01-AI에이전트오케스트레이션.md",  team: "연구소",   project: "—",                  age: "6일 전" },
];

/* ─────────────────────────────────────────────
   PRIMITIVE COMPONENTS  (shadcn-style)
───────────────────────────────────────────── */

/** Card — rounded-xl border bg-card */
function Card({ children, style = {} }) {
  return (
    <div style={{
      borderRadius: T.radiusXl,
      border: `1px solid ${T.border}`,
      background: T.card,
      ...style,
    }}>
      {children}
    </div>
  );
}

function CardHeader({ children, style = {} }) {
  return <div style={{ padding: "20px 24px 0", ...style }}>{children}</div>;
}

function CardTitle({ children, style = {} }) {
  return <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.foreground, lineHeight: 1.4, ...style }}>{children}</h3>;
}

function CardDescription({ children }) {
  return <p style={{ margin: "4px 0 0", fontSize: 13, color: T.mutedFg, lineHeight: 1.5 }}>{children}</p>;
}

function CardContent({ children, style = {} }) {
  return <div style={{ padding: "16px 24px 24px", ...style }}>{children}</div>;
}

function Separator({ style = {} }) {
  return <div style={{ height: 1, background: T.border, ...style }} />;
}

/** Badge variants: default | secondary | outline | destructive | success | warn */
function Badge({ label, variant = "secondary", color }) {
  const variants = {
    default:     { bg: T.foreground,  text: T.background,  border: "transparent" },
    secondary:   { bg: T.surface,     text: T.mutedFg,     border: T.border },
    outline:     { bg: "transparent", text: T.foreground,  border: T.borderMuted },
    destructive: { bg: T.dangerMuted, text: T.danger,      border: "#fca5a5" },
    success:     { bg: T.successMuted,text: T.success,     border: "#86efac" },
    warn:        { bg: T.warnMuted,   text: T.warn,        border: "#fde68a" },
  };
  const v = variants[variant] || variants.secondary;
  const overrideStyle = color ? { bg: color + "22", text: color, border: color + "44" } : null;
  const s = overrideStyle || v;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 9px",
      borderRadius: T.radiusSm,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
      color: s.text, background: s.bg,
      border: `1px solid ${s.border}`,
      whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

/** Progress — shadcn style */
function Progress({ value, color = T.foreground, height = 6 }) {
  return (
    <div style={{ height, borderRadius: 999, background: T.elevated, overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: 999,
        width: `${Math.min(100, Math.max(0, value))}%`,
        background: color,
        transition: "width 0.35s ease",
      }} />
    </div>
  );
}

/** Stat card content */
function StatBlock({ label, value, sub, delta, accent }) {
  const isPos = delta > 0;
  return (
    <div>
      <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 500, color: T.mutedFg }}>{label}</p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: accent || T.foreground, fontFamily: "'Geist Mono', 'JetBrains Mono', monospace", lineHeight: 1 }}>{value}</span>
        {sub && <span style={{ fontSize: 12, color: T.mutedFg }}>{sub}</span>}
      </div>
      {delta !== undefined && (
        <p style={{ margin: "5px 0 0", fontSize: 11, color: isPos ? T.success : T.danger }}>
          {isPos ? "↑" : "↓"} {Math.abs(delta)}% 전주 대비
        </p>
      )}
    </div>
  );
}

const PHASE_COLOR = { PM: "#8b5cf6", AY: "#6366f1", DE: "#3b82f6", IM: "#f59e0b", TE: "#f97316", OP: "#10b981" };

function PhaseTag({ phase }) {
  const c = PHASE_COLOR[phase] || T.mutedFg;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "1px 8px", borderRadius: T.radiusSm,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
      color: c, background: c + "1a",
      border: `1px solid ${c}33`,
      fontFamily: "'Geist Mono', 'JetBrains Mono', monospace",
    }}>{phase}</span>
  );
}

/** Table with shadcn styling */
function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${T.border}` }}>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: "10px 16px", textAlign: "left",
                fontSize: 11, fontWeight: 600,
                color: T.mutedFg, letterSpacing: "0.05em",
                whiteSpace: "nowrap",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}
              style={{ borderBottom: `1px solid ${T.border}`, cursor: "default", transition: "background 0.1s" }}
              onMouseEnter={e => e.currentTarget.style.background = T.surface}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "12px 16px", color: T.foreground, verticalAlign: "middle" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SECTION HEADER (page-level)
───────────────────────────────────────────── */
function PageHeader({ title, description }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: T.foreground, letterSpacing: "-0.02em" }}>{title}</h1>
      {description && <p style={{ margin: 0, fontSize: 13, color: T.mutedFg }}>{description}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   VIEW: OVERVIEW
───────────────────────────────────────────── */
function OverviewView() {
  return (
    <div>
      <PageHeader title="전체 현황" description="아데오 그룹 에이전트 시스템 실시간 운영 현황 — 2026-04-16 기준" />

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "진행 중 프로젝트", value: "5", sub: "건", delta: 2,  accent: T.agency },
          { label: "활성 제안 기회",   value: "5", sub: "건", delta: 1,  accent: T.proposal },
          { label: "운영 서비스",      value: "3", sub: "사이트",        accent: T.ops },
          { label: "이달 산출물",      value: "38", sub: "건", delta: 18, accent: T.primary },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent><StatBlock {...s} /></CardContent>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* 프로젝트 파이프라인 */}
        <Card>
          <CardHeader>
            <CardTitle>구축사 프로젝트 진행률</CardTitle>
            <CardDescription>단계별 현황 및 진행률</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {PROJECTS.map(p => (
                <div key={p.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <PhaseTag phase={p.phase} />
                      <span style={{ fontSize: 13, color: T.foreground }}>{p.name}</span>
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 600,
                      fontFamily: "'Geist Mono', 'JetBrains Mono', monospace",
                      color: p.status === "warn" ? T.warn : T.mutedFg,
                    }}>{p.progress}%</span>
                  </div>
                  <Progress value={p.progress} color={p.status === "warn" ? T.warn : PHASE_COLOR[p.phase]} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 제안 파이프라인 */}
        <Card>
          <CardHeader>
            <CardTitle>제안사 파이프라인</CardTitle>
            <CardDescription>활성 기회 목록 및 단계별 현황</CardDescription>
          </CardHeader>
          <CardContent style={{ paddingTop: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {OPPORTUNITIES.map((o, i) => (
                <div key={o.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
                    <div>
                      <div style={{ fontSize: 13, color: T.foreground, fontWeight: 500 }}>{o.name}</div>
                      <div style={{ fontSize: 11, color: T.mutedFg, marginTop: 2 }}>{o.client} · {o.assigned}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.foreground }}>{o.value}</span>
                      <Badge
                        label={o.stage}
                        variant={o.stage === "제안서 완성" ? "success" : o.stage === "제안서 작성중" ? "outline" : "secondary"}
                      />
                    </div>
                  </div>
                  {i < OPPORTUNITIES.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* 최근 산출물 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 산출물</CardTitle>
            <CardDescription>최근 생성된 문서 목록</CardDescription>
          </CardHeader>
          <CardContent style={{ paddingTop: 14 }}>
            {RECENT_OUTPUTS.map((o, i) => {
              const dotColor = o.team === "개발팀" ? T.agency : o.team === "디자인팀" ? T.proposal : o.team === "연구소" ? T.lab : T.ops;
              return (
                <div key={i}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontFamily: "'Geist Mono', 'JetBrains Mono', monospace", color: T.foreground, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.name}</div>
                      <div style={{ fontSize: 11, color: T.mutedFg, marginTop: 2 }}>{o.team} · {o.project}</div>
                    </div>
                    <span style={{ fontSize: 11, color: T.dimFg, flexShrink: 0 }}>{o.age}</span>
                  </div>
                  {i < RECENT_OUTPUTS.length - 1 && <Separator />}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* 경고 및 에스컬레이션 */}
        <Card>
          <CardHeader>
            <CardTitle>알림 & 에스컬레이션</CardTitle>
            <CardDescription>조치가 필요한 항목</CardDescription>
          </CardHeader>
          <CardContent style={{ paddingTop: 14 }}>
            {/* 지연 */}
            {KPI_WEEKLY.delays.map((d, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "12px 14px", borderRadius: T.radius,
                background: T.warnMuted, border: `1px solid ${T.warn}33`,
                marginBottom: 8,
              }}>
                <span style={{ color: T.warn, fontSize: 15, flexShrink: 0, marginTop: 1 }}>▲</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.foreground }}>{d.project}</div>
                  <div style={{ fontSize: 11, color: T.mutedFg, marginTop: 2, display: "flex", gap: 6, alignItems: "center" }}>
                    <PhaseTag phase={d.phase} />
                    <span>기준({d.threshold}일) 대비 {d.days_over}일 초과</span>
                  </div>
                </div>
              </div>
            ))}
            {/* 보안 이슈 */}
            {OPS_ISSUES.filter(i => i.severity === "높음").map((issue, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "12px 14px", borderRadius: T.radius,
                background: T.dangerMuted, border: `1px solid ${T.danger}33`,
                marginBottom: 8,
              }}>
                <span style={{ color: T.danger, fontSize: 15, flexShrink: 0, marginTop: 1 }}>!</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.foreground }}>{issue.summary}</div>
                  <div style={{ fontSize: 11, color: T.mutedFg, marginTop: 2 }}>{issue.project} · {issue.type}</div>
                </div>
                <Badge label={issue.severity === "높음" ? "긴급" : issue.severity} variant="destructive" style={{ marginLeft: "auto", flexShrink: 0 }} />
              </div>
            ))}
            <Separator style={{ margin: "10px 0" }} />
            {/* 시스템 상태 요약 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ padding: "12px 14px", borderRadius: T.radius, background: T.surface, border: `1px solid ${T.border}` }}>
                <p style={{ margin: "0 0 4px", fontSize: 11, color: T.mutedFg }}>문서 검증 통과율</p>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.success, fontFamily: "'Geist Mono', monospace" }}>94%</p>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: T.radius, background: T.surface, border: `1px solid ${T.border}` }}>
                <p style={{ margin: "0 0 4px", fontSize: 11, color: T.mutedFg }}>평균 서비스 업타임</p>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.ops, fontFamily: "'Geist Mono', monospace" }}>99.93%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   VIEW: 제안사
───────────────────────────────────────────── */
function ProposalView() {
  return (
    <div>
      <PageHeader title="제안사" description="기회 탐색 · 제안서 작성 · 정책자금 매칭 현황" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "활성 기회",       value: "5", sub: "건",    accent: T.proposal },
          { label: "제안서 완성",     value: "3", sub: "건",    accent: T.success },
          { label: "정책자금 매칭",   value: "3", sub: "건",    accent: T.primary },
          { label: "기회→제안 전환율",value: "60%",              accent: T.warn },
        ].map((s, i) => <Card key={i}><CardContent><StatBlock {...s} /></CardContent></Card>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16 }}>
        <Card>
          <CardHeader><CardTitle>기회 상세</CardTitle><CardDescription>현재 활성화된 모든 수주 기회</CardDescription></CardHeader>
          <CardContent style={{ padding: 0, paddingBottom: 0 }}>
            <DataTable
              headers={["ID", "기회명", "클라이언트", "규모", "단계", "매칭률", "경과"]}
              rows={OPPORTUNITIES.map(o => [
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: T.dimFg }}>{o.id}</span>,
                <span style={{ fontWeight: 500 }}>{o.name}</span>,
                <span style={{ color: T.mutedFg }}>{o.client}</span>,
                <span style={{ fontWeight: 600 }}>{o.value}</span>,
                <Badge
                  label={o.stage}
                  variant={o.stage === "제안서 완성" ? "success" : o.stage === "제안서 작성중" ? "outline" : "secondary"}
                />,
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 100 }}>
                  <Progress value={o.match} color={T.proposal} height={4} />
                  <span style={{ fontSize: 11, color: T.mutedFg, minWidth: 28, fontFamily: "'Geist Mono', monospace" }}>{o.match}%</span>
                </div>,
                <span style={{ color: T.dimFg, fontSize: 12, fontFamily: "'Geist Mono', monospace" }}>{o.days}일</span>,
              ])}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>정책자금 매칭 현황</CardTitle><CardDescription>기회별 정책자금 연결 상태</CardDescription></CardHeader>
          <CardContent style={{ paddingTop: 14 }}>
            {OPPORTUNITIES.map((o, i) => (
              <div key={o.id}>
                <div style={{ padding: "10px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: T.foreground }}>{o.name}</span>
                    <Badge
                      label={o.stage === "정책자금 매칭" ? "매칭완료" : "탐색중"}
                      variant={o.stage === "정책자금 매칭" ? "success" : "secondary"}
                    />
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: T.mutedFg }}>{o.policy}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: T.dimFg }}>{o.client}</p>
                </div>
                {i < OPPORTUNITIES.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   VIEW: 구축사
───────────────────────────────────────────── */
function WebAgencyView() {
  const phaseOrder = ["PM", "AY", "DE", "IM", "TE", "OP"];
  return (
    <div>
      <PageHeader title="구축사" description="프로젝트 설계 · 개발 · 테스트 전 단계 현황" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "진행 중 프로젝트",  value: "5",   sub: "건",    accent: T.agency },
          { label: "주간 신규 산출물",  value: "11",  sub: "건",    delta: 10, accent: T.primary },
          { label: "검증 통과율",       value: "94%",              accent: T.success },
          { label: "지연 경고",         value: "1",   sub: "건",    accent: T.warn },
        ].map((s, i) => <Card key={i}><CardContent><StatBlock {...s} /></CardContent></Card>)}
      </div>

      {/* Pipeline board */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>단계별 파이프라인</CardTitle>
          <CardDescription>PM → AY → DE → IM → TE → OP 단계별 프로젝트 분포</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 1, background: T.border, borderRadius: T.radius, overflow: "hidden" }}>
            {phaseOrder.map((ph) => {
              const inPhase = PROJECTS.filter(p => p.phase === ph);
              const c = PHASE_COLOR[ph];
              return (
                <div key={ph} style={{ background: T.card, padding: "12px 10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: c, letterSpacing: "0.08em", fontFamily: "'Geist Mono', monospace" }}>{ph}</span>
                    <span style={{ fontSize: 11, color: T.dimFg, marginLeft: "auto" }}>{inPhase.length}</span>
                  </div>
                  {inPhase.length === 0
                    ? <div style={{ fontSize: 11, color: T.dimFg, textAlign: "center", padding: "8px 0" }}>—</div>
                    : inPhase.map(p => (
                      <div key={p.id} style={{
                        fontSize: 11, padding: "7px 9px", borderRadius: T.radiusSm,
                        background: T.surface, border: `1px solid ${T.border}`,
                        color: T.foreground, marginBottom: 4, lineHeight: 1.4,
                        borderLeft: `3px solid ${c}`,
                      }}>
                        {p.name.length > 12 ? p.name.slice(0, 12) + "…" : p.name}
                      </div>
                    ))
                  }
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Project table */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader><CardTitle>프로젝트 상세</CardTitle></CardHeader>
        <CardContent style={{ padding: 0, paddingBottom: 0 }}>
          <DataTable
            headers={["프로젝트명", "단계", "진행률", "체류기간", "산출물", "예산", "상태"]}
            rows={PROJECTS.map(p => [
              <span style={{ fontWeight: 500 }}>{p.name}</span>,
              <PhaseTag phase={p.phase} />,
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 110 }}>
                <Progress value={p.progress} color={p.status === "warn" ? T.warn : PHASE_COLOR[p.phase]} height={5} />
                <span style={{ fontSize: 12, color: T.mutedFg, minWidth: 30, fontFamily: "'Geist Mono', monospace" }}>{p.progress}%</span>
              </div>,
              <span style={{
                fontFamily: "'Geist Mono', monospace", fontSize: 12,
                color: p.days_in_phase > 14 ? T.warn : T.mutedFg,
              }}>{p.days_in_phase}일</span>,
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12 }}>{p.outputs}</span>,
              <span style={{ fontWeight: 600, fontSize: 12 }}>{p.budget}</span>,
              <Badge label={p.status === "warn" ? "지연 경고" : "정상"} variant={p.status === "warn" ? "warn" : "success"} />,
            ])}
          />
        </CardContent>
      </Card>

      {/* Team output */}
      <Card>
        <CardHeader><CardTitle>팀별 이번 주 산출물</CardTitle></CardHeader>
        <CardContent>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {Object.entries(KPI_WEEKLY.team_output).map(([team, cnt]) => (
              <div key={team} style={{
                padding: "20px", borderRadius: T.radius,
                background: T.surface, border: `1px solid ${T.border}`,
                textAlign: "center",
              }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: T.foreground, fontFamily: "'Geist Mono', monospace", lineHeight: 1 }}>{cnt}</div>
                <div style={{ fontSize: 12, color: T.mutedFg, marginTop: 8 }}>{team}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────
   VIEW: 운영사
───────────────────────────────────────────── */
function OperationsView() {
  const severityBadge = { 높음: "destructive", 보통: "warn", 낮음: "secondary" };
  const statusBadge   = { 조사중: "warn", 수정완료: "success", 대기: "secondary" };
  return (
    <div>
      <PageHeader title="운영사" description="서비스 운영 · 장애 대응 · 성과 분석" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "운영 서비스",    value: "3",      sub: "사이트", accent: T.ops },
          { label: "평균 업타임",   value: "99.93%",              accent: T.success },
          { label: "오픈 이슈",     value: "4",      sub: "건",    accent: T.warn },
          { label: "이달 해결 이슈", value: "67",     sub: "건",    accent: T.primary },
        ].map((s, i) => <Card key={i}><CardContent><StatBlock {...s} /></CardContent></Card>)}
      </div>

      {/* 서비스 카드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
        {OPERATIONS.map(op => (
          <Card key={op.id}>
            <CardHeader>
              <CardTitle>{op.name}</CardTitle>
              <CardDescription>최근 배포 {op.last_deploy}</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: 11, color: T.mutedFg }}>업타임</p>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 700, fontFamily: "'Geist Mono', monospace", color: op.uptime >= 99.9 ? T.success : T.warn }}>{op.uptime}%</p>
                </div>
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: 11, color: T.mutedFg }}>NPS</p>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 700, fontFamily: "'Geist Mono', monospace", color: T.foreground }}>{op.nps}</p>
                </div>
              </div>
              <Progress value={op.uptime} color={op.uptime >= 99.9 ? T.success : T.warn} />
              <Separator style={{ margin: "14px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: T.mutedFg }}>
                  오픈 이슈 <strong style={{ color: op.issues_open > 0 ? T.warn : T.success }}>{op.issues_open}</strong>
                </span>
                <span style={{ fontSize: 12, color: T.mutedFg }}>
                  해결 <strong style={{ color: T.success }}>{op.issues_resolved}</strong>건
                </span>
                <span style={{ fontSize: 12, color: T.mutedFg }}>
                  주간 {(op.visitors_w / 1000).toFixed(1)}k
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 이슈 테이블 */}
      <Card>
        <CardHeader><CardTitle>이슈 트래커</CardTitle><CardDescription>현재 오픈 이슈 및 최근 처리 내역</CardDescription></CardHeader>
        <CardContent style={{ padding: 0, paddingBottom: 0 }}>
          <DataTable
            headers={["ID", "서비스", "유형", "심각도", "이슈 내용", "상태", "접수일"]}
            rows={OPS_ISSUES.map(issue => [
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: T.dimFg }}>{issue.id}</span>,
              <span style={{ fontSize: 12 }}>{issue.project.split(" ").slice(-2).join(" ")}</span>,
              <Badge label={issue.type} variant="outline" />,
              <Badge label={issue.severity} variant={severityBadge[issue.severity] || "secondary"} />,
              <span style={{ fontSize: 12 }}>{issue.summary}</span>,
              <Badge label={issue.status} variant={statusBadge[issue.status] || "secondary"} />,
              <span style={{ fontSize: 12, color: T.mutedFg }}>{issue.created}</span>,
            ])}
          />
        </CardContent>
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────
   VIEW: 연구소
───────────────────────────────────────────── */
function ResearchView() {
  const recBadge = { "도입 권장": "success", "파일럿 권장": "outline", "검토 필요": "warn", "현재 보류": "destructive" };
  const statusBadge = { 완료: "success", 진행중: "outline", 대기: "secondary" };
  return (
    <div>
      <PageHeader title="연구소" description="기술 리서치 · 벤치마킹 · 도입 검토" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "완료 리포트",  value: "4", sub: "건",    accent: T.lab },
          { label: "진행중",       value: "1", sub: "건",    accent: T.proposal },
          { label: "대기 중",      value: "1", sub: "건",    accent: T.mutedFg },
          { label: "도입 권장 건", value: "3", sub: "건",    accent: T.success },
        ].map((s, i) => <Card key={i}><CardContent><StatBlock {...s} /></CardContent></Card>)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16 }}>
        {/* 리포트 목록 */}
        <Card>
          <CardHeader><CardTitle>리서치 리포트 목록</CardTitle><CardDescription>전체 리서치 현황 및 권고 결과</CardDescription></CardHeader>
          <CardContent style={{ padding: 0, paddingBottom: 0 }}>
            <DataTable
              headers={["ID", "주제", "유형", "상태", "권고", "날짜"]}
              rows={RESEARCH_REPORTS.map(r => [
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: T.dimFg }}>{r.id}</span>,
                <span style={{ fontWeight: 500, fontSize: 13 }}>{r.topic}</span>,
                <Badge label={r.type} variant="outline" />,
                <Badge label={r.status} variant={statusBadge[r.status] || "secondary"} />,
                r.recommendation !== "—"
                  ? <Badge label={r.recommendation} variant={recBadge[r.recommendation] || "secondary"} />
                  : <span style={{ color: T.dimFg, fontSize: 12 }}>—</span>,
                <span style={{ fontSize: 11, color: T.dimFg, fontFamily: "'Geist Mono', monospace" }}>{r.date}</span>,
              ])}
            />
          </CardContent>
        </Card>

        {/* 도입 권고 요약 */}
        <Card>
          <CardHeader><CardTitle>도입 권고 분류</CardTitle><CardDescription>리서치 결과 요약</CardDescription></CardHeader>
          <CardContent style={{ paddingTop: 14 }}>
            {[
              { label: "도입 권장",   items: ["AI 에이전트 오케스트레이션"],   variant: "success",     count: 1 },
              { label: "파일럿 권장", items: ["Supabase DB-as-a-Service"],     variant: "outline",     count: 1 },
              { label: "검토 필요",   items: ["Vercel vs AWS 배포"],           variant: "warn",        count: 1 },
              { label: "진행중",      items: ["Next.js 15 App Router"],        variant: "secondary",   count: 1 },
            ].map((cat, i) => (
              <div key={i}>
                <div style={{ padding: "12px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <Badge label={cat.label} variant={cat.variant} />
                    <span style={{ fontSize: 11, color: T.dimFg }}>{cat.count}건</span>
                  </div>
                  {cat.items.map((item, j) => (
                    <div key={j} style={{ fontSize: 12, color: T.mutedFg, paddingLeft: 4 }}>· {item}</div>
                  ))}
                </div>
                {i < 3 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   VIEW: 주간 보고
───────────────────────────────────────────── */
function WeeklyReportView() {
  return (
    <div>
      <PageHeader title="주간 보고" description={`PM-WR · ${KPI_WEEKLY.period}`} />

      {/* 요약 */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div><CardTitle>이번 주 요약</CardTitle><CardDescription>자동 생성된 서술형 분석</CardDescription></div>
            <Badge label="자동 생성" variant="outline" />
          </div>
        </CardHeader>
        <CardContent>
          <p style={{ margin: 0, fontSize: 13, color: T.foreground, lineHeight: 1.8 }}>
            이번 주 총 <strong>{KPI_WEEKLY.outputs_created}건</strong>의 산출물이 생성되어 주간 목표({KPI_WEEKLY.outputs_target}건)를
            <strong style={{ color: T.success }}> 363% 초과 달성</strong>하였습니다.
            문서 검증 통과율은 <strong>{KPI_WEEKLY.validation_pass_rate}%</strong>로 목표(90%)를 상회합니다.
            이커머스 풀스택 리뉴얼이 TE 단계에서 체류 기간 기준을 1일 초과하여 <strong style={{ color: T.warn }}>모니터링이 필요</strong>합니다.
          </p>
        </CardContent>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <CardHeader><CardTitle>구축사 KPI</CardTitle></CardHeader>
          <CardContent style={{ padding: 0, paddingBottom: 0 }}>
            <DataTable
              headers={["지표", "실적", "목표", "결과"]}
              rows={[
                ["활성 프로젝트 수",  "5건",   "—",          <Badge label="정상" variant="success" />],
                ["주간 산출물 생성",  `${KPI_WEEKLY.outputs_created}건`, "3건/주", <Badge label="달성" variant="success" />],
                ["검증 통과율",       `${KPI_WEEKLY.validation_pass_rate}%`, "90%+", <Badge label="달성" variant="success" />],
                ["지연 프로젝트",     "1건",   "0건",         <Badge label="주의" variant="warn" />],
              ]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>제안사 KPI</CardTitle></CardHeader>
          <CardContent style={{ padding: 0, paddingBottom: 0 }}>
            <DataTable
              headers={["지표", "실적", "목표", "결과"]}
              rows={[
                ["활성 기회 수",      `${KPI_WEEKLY.proposals_active}건`, "—",     <Badge label="정상" variant="success" />],
                ["이번 주 제안 제출", `${KPI_WEEKLY.proposals_submitted}건`, "—",   <Badge label="완료" variant="outline" />],
                ["정책자금 매칭",     "2건 진행중", "—",                           <Badge label="진행중" variant="secondary" />],
                ["기회→제안 전환율",  "60%",  "70%+",                             <Badge label="미달" variant="warn" />],
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* 지연 항목 */}
        <Card>
          <CardHeader><CardTitle>지연 / 이슈 항목</CardTitle></CardHeader>
          <CardContent>
            {KPI_WEEKLY.delays.map((d, i) => (
              <div key={i} style={{
                padding: "12px 14px", borderRadius: T.radius,
                background: T.warnMuted, border: `1px solid ${T.warn}33`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.foreground }}>{d.project}</span>
                  <PhaseTag phase={d.phase} />
                </div>
                <p style={{ margin: 0, fontSize: 12, color: T.mutedFg }}>기준({d.threshold}일) 대비 {d.days_over}일 초과 — TE 담당 팀 진행 현황 확인 권고</p>
              </div>
            ))}
            {KPI_WEEKLY.delays.length === 0 && <p style={{ color: T.mutedFg, fontSize: 13 }}>지연 항목 없음</p>}
          </CardContent>
        </Card>

        {/* 단계 분포 */}
        <Card>
          <CardHeader><CardTitle>단계별 분포 & 다음 주 계획</CardTitle></CardHeader>
          <CardContent>
            <div style={{ marginBottom: 16 }}>
              {Object.entries(KPI_WEEKLY.by_phase).map(([ph, cnt]) => (
                <div key={ph} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <PhaseTag phase={ph} />
                  <Progress value={cnt * 20} color={PHASE_COLOR[ph]} height={6} />
                  <span style={{ fontSize: 12, color: T.mutedFg, minWidth: 20 }}>{cnt}건</span>
                </div>
              ))}
            </div>
            <Separator style={{ marginBottom: 14 }} />
            {[
              { phase: "IM", task: "K-바이오 연구원 — 핵심 기능 구현" },
              { phase: "DE", task: "스마트시티 — tech-spec 작성" },
              { phase: "TE", task: "이커머스 — 테스트 완료 & OP 인계" },
              { phase: "AY", task: "HR SaaS — 요구사항정의서 완성" },
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <PhaseTag phase={t.phase} />
                <span style={{ fontSize: 12, color: T.mutedFg }}>{t.task}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   VIEW: 월간 보고
───────────────────────────────────────────── */
function MonthlyReportView() {
  const kpis = [
    { label: "총 산출물 생성",    value: KPI_MONTHLY.total_outputs, target: 48,   unit: "건",  color: T.agency },
    { label: "문서 검증 통과율",  value: KPI_MONTHLY.validation_pass_rate, target: 90, unit: "%", color: T.success },
    { label: "제안 전환율",       value: KPI_MONTHLY.proposal_conversion, target: 70, unit: "%",  color: T.proposal },
    { label: "정책자금 매칭",     value: KPI_MONTHLY.policy_fund_matches, target: 2, unit: "건", color: T.primary },
    { label: "평균 업타임",       value: KPI_MONTHLY.ops_uptime_avg, target: 99.9, unit: "%",    color: T.ops },
    { label: "연구소 리포트",     value: KPI_MONTHLY.lab_reports, target: 3,      unit: "건",  color: T.lab },
  ];
  return (
    <div>
      <PageHeader title="월간 보고" description={`PM-MR · ${KPI_MONTHLY.period}`} />

      {/* 성과 요약 */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div><CardTitle>이달 성과 요약</CardTitle><CardDescription>자동 생성된 서술형 분석</CardDescription></div>
            <Badge label="자동 생성" variant="outline" />
          </div>
        </CardHeader>
        <CardContent>
          <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            {KPI_MONTHLY.summary_bullets.map((b, i) => (
              <li key={i} style={{ fontSize: 13, color: T.foreground, lineHeight: 1.7 }}>{b}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* KPI 달성률 */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader><CardTitle>월간 KPI 달성률</CardTitle><CardDescription>목표 대비 실적</CardDescription></CardHeader>
        <CardContent>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {kpis.map((k, i) => {
              const pct = Math.min(100, (k.value / k.target) * 100);
              const hit = k.value >= k.target;
              return (
                <div key={i} style={{
                  padding: "16px 18px",
                  borderRadius: T.radius,
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                }}>
                  <p style={{ margin: "0 0 10px", fontSize: 11, color: T.mutedFg }}>{k.label}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: k.color, fontFamily: "'Geist Mono', monospace" }}>{k.value}{k.unit}</span>
                    <span style={{ fontSize: 11, color: T.dimFg }}>목표 {k.target}{k.unit}</span>
                  </div>
                  <Progress value={pct} color={hit ? k.color : T.warn} />
                  <p style={{ margin: "6px 0 0", fontSize: 11, color: hit ? T.success : T.warn }}>
                    {hit ? "목표 달성" : `목표 대비 ${(100 - pct).toFixed(0)}% 미달`}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* 재무 */}
        <Card>
          <CardHeader><CardTitle>재무 현황 (추정)</CardTitle><CardDescription>확정 매출 및 파이프라인 합계</CardDescription></CardHeader>
          <CardContent>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <p style={{ margin: "0 0 6px", fontSize: 12, color: T.mutedFg }}>이달 확정 매출 (추정)</p>
                <p style={{ margin: 0, fontSize: 30, fontWeight: 700, color: T.success, fontFamily: "'Geist Mono', monospace" }}>{KPI_MONTHLY.revenue_est}</p>
              </div>
              <Separator />
              <div>
                <p style={{ margin: "0 0 6px", fontSize: 12, color: T.mutedFg }}>수주 파이프라인 합계</p>
                <p style={{ margin: 0, fontSize: 30, fontWeight: 700, color: T.proposal, fontFamily: "'Geist Mono', monospace" }}>{KPI_MONTHLY.pipeline_est}</p>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: T.dimFg, lineHeight: 1.6 }}>※ 위 수치는 추정값입니다. 확정 매출은 계약 완료 기준으로 별도 집계됩니다.</p>
            </div>
          </CardContent>
        </Card>

        {/* 다음 달 계획 */}
        <Card>
          <CardHeader><CardTitle>다음 달 계획</CardTitle><CardDescription>2026년 05월 예정 작업</CardDescription></CardHeader>
          <CardContent style={{ paddingTop: 14 }}>
            {[
              { text: "이커머스 풀스택 리뉴얼 OP 인계 예정",       color: T.agency },
              { text: "물류 TMS 고도화 제안서 최종 제출 (OPP-003)", color: T.proposal },
              { text: "K-바이오 연구원 IM → TE 단계 전환",         color: T.agency },
              { text: "Next.js 15 마이그레이션 도입 검토 완료",     color: T.lab },
              { text: "대림산업 보안 이슈(ISS-017) 조치 목표",      color: T.danger },
            ].map((item, i) => (
              <div key={i}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: item.color, flexShrink: 0, marginTop: 4 }} />
                  <span style={{ fontSize: 13, color: T.foreground, lineHeight: 1.5 }}>{item.text}</span>
                </div>
                {i < 4 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   NAVIGATION CONFIG
───────────────────────────────────────────── */
const NAV_GROUPS = [
  {
    label: "대시보드",
    items: [
      { id: "overview",  label: "전체 현황",  color: T.primary,   view: OverviewView },
    ],
  },
  {
    label: "자회사",
    items: [
      { id: "proposal",  label: "제안사",     color: T.proposal,  view: ProposalView },
      { id: "webagency", label: "구축사",     color: T.agency,    view: WebAgencyView },
      { id: "ops",       label: "운영사",     color: T.ops,       view: OperationsView },
      { id: "lab",       label: "연구소",     color: T.lab,       view: ResearchView },
    ],
  },
  {
    label: "보고서",
    items: [
      { id: "weekly",  label: "주간 보고",  color: T.primary, view: WeeklyReportView },
      { id: "monthly", label: "월간 보고",  color: T.primary, view: MonthlyReportView },
    ],
  },
];

/* ─────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────── */
export default function AdeoDashboard() {
  const [active, setActive] = useState("overview");

  const allItems = NAV_GROUPS.flatMap(g => g.items);
  const current = allItems.find(n => n.id === active);
  const View = current?.view || OverviewView;

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: T.background,
      fontFamily: "'Inter', 'Pretendard Variable', system-ui, sans-serif",
      color: T.foreground,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.borderMuted}; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #a1a1aa; }
      `}</style>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 224, flexShrink: 0,
        background: T.surface,
        borderRight: `1px solid ${T.border}`,
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh",
        overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: T.radiusSm,
              background: T.elevated, border: `1px solid ${T.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: T.foreground,
            }}>A</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.foreground, lineHeight: 1.2 }}>Adeo</div>
              <div style={{ fontSize: 11, color: T.mutedFg, lineHeight: 1.2 }}>Agent OS</div>
            </div>
          </div>
        </div>

        {/* Nav groups */}
        <nav style={{ flex: 1, padding: "12px 12px" }}>
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} style={{ marginBottom: 20 }}>
              <p style={{
                margin: "0 0 6px 8px",
                fontSize: 11, fontWeight: 600,
                color: T.dimFg, letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}>{group.label}</p>
              {group.items.map(item => {
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActive(item.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      width: "100%", padding: "7px 10px",
                      borderRadius: T.radiusSm,
                      border: "none", cursor: "pointer",
                      background: isActive ? T.elevated : "transparent",
                      color: isActive ? T.foreground : T.mutedFg,
                      fontSize: 13, fontWeight: isActive ? 500 : 400,
                      textAlign: "left", transition: "all 0.1s",
                      marginBottom: 1,
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = T.elevated; e.currentTarget.style.color = T.foreground; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.mutedFg; } }}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: isActive ? item.color : T.borderMuted, flexShrink: 0, transition: "background 0.1s" }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "12px 16px 16px", borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", items: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.success, marginTop: 5 }} />
            <div>
              <p style={{ margin: 0, fontSize: 11, color: T.mutedFg }}>시스템 정상 가동</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: T.dimFg }}>비서실 L1 오케스트레이터</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, overflow: "auto" }}>
        {/* Top bar */}
        <header style={{
          position: "sticky", top: 0, zIndex: 10,
          height: 52,
          padding: "0 32px",
          background: T.background + "ee",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: T.mutedFg }}>
            <span>아데오 그룹</span>
            <span style={{ color: T.dimFg }}>›</span>
            <span style={{ color: T.foreground, fontWeight: 500 }}>{current?.label}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: T.dimFg, fontFamily: "'Geist Mono', monospace" }}>2026-04-16</span>
            <Badge label="v1.0" variant="secondary" />
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: "32px", maxWidth: 1360 }}>
          <View />
        </div>
      </main>
    </div>
  );
}
