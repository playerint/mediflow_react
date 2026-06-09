'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MONTHLY_KPI, CHANNEL_STATS, SEO_KEYWORDS, AEO_KEYWORDS } from '@/lib/mock-data'

// ────────────────────────────────────────
// 리포트 페이지 전용 목업 데이터
// ────────────────────────────────────────

// 월간 요약 KPI (prototype: 사이트 방문자, 전체 문의, 예약 전환, AEO 인용)
const REPORT_KPI = [
  { label: '사이트 방문자', value: '1,847', delta: '↑ +23%',  up: true },
  { label: '전체 문의',     value: '23건',  delta: '↑ +53%',  up: true },
  { label: '예약 전환',     value: '8건',   delta: '34.8%',   up: true },
  { label: 'AEO 인용',     value: '19회',  delta: '↑ +7회',  up: true },
]

// 월간 퍼널 전환율 단계
const FUNNEL_STEPS = [
  { label: '사이트 방문',  value: 1847, pct: 100 },
  { label: 'CTA 클릭',    value: 312,  pct: 16.9 },
  { label: '문의 접수',   value: 23,   pct: 7.4  },
  { label: '예약 확정',   value: 8,    pct: 34.8 },
]

// 월별 방문자 추이 (chart.js 없이 CSS 막대로 대체)
const VISITOR_TREND = [
  { month: '1월', visitors: 1102 },
  { month: '2월', visitors: 1248 },
  { month: '3월', visitors: 1390 },
  { month: '4월', visitors: 1501 },
  { month: '5월', visitors: 1847 },
  { month: '6월', visitors: 820, current: true },
]

// LINE 자동상담 성과
const LINE_PERF = [
  { label: 'AI 해결률', value: '94%' },
  { label: '처리 건수', value: '142' },
  { label: '예약 전환', value: '41%' },
]

// LINE 시나리오별 처리 (도넛 차트 대신 막대)
const LINE_SCENARIOS = [
  { label: '비용 문의',   pct: 38, color: 'var(--navy)' },
  { label: '예약 요청',   pct: 29, color: 'var(--blue)' },
  { label: '일반 안내',   pct: 19, color: '#16A34A' },
  { label: '에스컬레이션', pct: 14, color: 'var(--s300)' },
]

// AEO 엔진별 인용 수
const AEO_ENGINES = [
  { engine: 'Perplexity',      count: 9,  pct: 47, color: '#6D28D9' },
  { engine: 'ChatGPT / GPT-4o', count: 6, pct: 32, color: '#059669' },
  { engine: 'AI Overviews',    count: 4,  pct: 21, color: 'var(--blue)' },
]

// AEO 월별 추이 (chart.js 없이 CSS 막대로 대체)
const AEO_TREND = [
  { month: '1월', count: 6 },
  { month: '2월', count: 8 },
  { month: '3월', count: 11 },
  { month: '4월', count: 12 },
  { month: '5월', count: 19 },
]

// 채널별 문의 비중
const CHANNEL_DIST = [
  { label: 'LINE',    pct: 52, color: 'var(--navy)' },
  { label: '사이트폼', pct: 30, color: 'var(--blue)' },
  { label: '직접 연락', pct: 12, color: '#16A34A' },
  { label: '기타',    pct: 6,  color: 'var(--s300)' },
]

// 선택 가능한 기간 목록
const PERIODS = ['2026년 5월', '2026년 4월', '2026년 3월']

// ────────────────────────────────────────
// PDF 생성 함수 (prototype의 generatePDF 그대로 포팅)
// ────────────────────────────────────────
function generatePDF(period: string) {
  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(
    '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>월간 리포트 — ' + period + '</title>'
    + '<style>body{font-family:"Pretendard Variable",sans-serif;padding:40px;color:#111;max-width:860px;margin:0 auto}'
    + 'h1{font-size:20px;color:#0D1B3E;margin-bottom:4px}h2{font-size:13px;color:#6B7280;font-weight:400;margin-bottom:28px}'
    + 'h3{font-size:12px;color:#6B7280;text-transform:uppercase;letter-spacing:.06em;margin:24px 0 10px;font-weight:600}'
    + '.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}'
    + '.kpi{background:#F9FAFB;border-radius:8px;padding:12px 14px}'
    + '.kpi-val{font-size:22px;font-weight:700;color:#0D1B3E}.kpi-lbl{font-size:11px;color:#6B7280;margin-bottom:4px}'
    + '.kpi-delta{font-size:11px;color:#059669;margin-top:2px}'
    + 'table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:20px}'
    + 'th{background:#F9FAFB;padding:8px 12px;border-bottom:2px solid #E5E7EB;text-align:left;font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:.04em}'
    + 'td{padding:9px 12px;border-bottom:1px solid #F3F4F6}'
    + '.bar-wrap{background:#E5E7EB;border-radius:4px;height:6px;margin-top:3px}'
    + '.bar{height:6px;border-radius:4px;background:#0D1B3E}'
    + 'footer{margin-top:40px;font-size:10px;color:#9CA3AF;text-align:center;border-top:1px solid #E5E7EB;padding-top:16px}'
    + '@media print{button{display:none}}</style>'
    + '</head><body>'
    + '<h1>📊 월간 리포트</h1>'
    + '<h2>올래성형외과 · ' + period + ' · MEDIFLOW</h2>'
    + '<div class="kpi-grid">'
    + '<div class="kpi"><div class="kpi-lbl">사이트 방문자</div><div class="kpi-val">1,847</div><div class="kpi-delta">↑ +23%</div></div>'
    + '<div class="kpi"><div class="kpi-lbl">전체 문의</div><div class="kpi-val">23건</div><div class="kpi-delta">↑ +53%</div></div>'
    + '<div class="kpi"><div class="kpi-lbl">예약 전환</div><div class="kpi-val">8건</div><div class="kpi-delta">전환율 34.8%</div></div>'
    + '<div class="kpi"><div class="kpi-lbl">AEO 인용</div><div class="kpi-val">19회</div><div class="kpi-delta">↑ +7회</div></div>'
    + '</div>'
    + '<h3>SEO 키워드 순위</h3>'
    + '<table><thead><tr><th>순위</th><th>키워드</th><th>검색량</th><th>현재 순위</th><th>변동</th></tr></thead><tbody>'
    + '<tr><td>1</td><td>韓国 二重整形</td><td>12.4K</td><td>3위</td><td style="color:#059669">↑ +2</td></tr>'
    + '<tr><td>2</td><td>江南 整形外科</td><td>8.2K</td><td>5위</td><td style="color:#059669">↑ +1</td></tr>'
    + '<tr><td>3</td><td>韓国 鼻整形</td><td>6.8K</td><td>7위</td><td style="color:#9CA3AF">→ 0</td></tr>'
    + '<tr><td>4</td><td>ソウル 美容整形</td><td>5.1K</td><td>4위</td><td style="color:#059669">↑ +3</td></tr>'
    + '<tr><td>5</td><td>オーレ整形外科</td><td>2.3K</td><td>1위</td><td style="color:#9CA3AF">→ 0</td></tr>'
    + '</tbody></table>'
    + '<h3>AEO · LLM 인용 현황</h3>'
    + '<table><thead><tr><th>AI 엔진</th><th>인용 수</th><th>비율</th><th>전월 대비</th></tr></thead><tbody>'
    + '<tr><td>Perplexity</td><td>9회</td><td><div class="bar-wrap"><div class="bar" style="width:47%;background:#6D28D9"></div></div></td><td style="color:#059669">+4</td></tr>'
    + '<tr><td>ChatGPT / GPT-4o</td><td>6회</td><td><div class="bar-wrap"><div class="bar" style="width:32%;background:#059669"></div></div></td><td style="color:#059669">+2</td></tr>'
    + '<tr><td>AI Overviews</td><td>4회</td><td><div class="bar-wrap"><div class="bar" style="width:21%;background:#2563EB"></div></div></td><td style="color:#059669">+1</td></tr>'
    + '</tbody></table>'
    + '<h3>LINE 자동상담 성과</h3>'
    + '<table><thead><tr><th>지표</th><th>이번 달</th><th>전월</th></tr></thead><tbody>'
    + '<tr><td>AI 자동 해결률</td><td>94%</td><td>91%</td></tr>'
    + '<tr><td>처리 건수</td><td>142건</td><td>128건</td></tr>'
    + '<tr><td>예약 전환율</td><td>41%</td><td>34%</td></tr>'
    + '<tr><td>채널 1위</td><td colspan="2">LINE 52%</td></tr>'
    + '</tbody></table>'
    + '<footer>© 2026 MEDIFLOW · 올래성형외과 · ' + period + ' 월간 리포트</footer>'
    + '<script>window.onload=function(){window.print();}<\/script>'
    + '</body></html>'
  )
  w.document.close()
}

// ────────────────────────────────────────
// 컴포넌트
// ────────────────────────────────────────
export default function ReportsPage() {
  const [period, setPeriod] = useState(PERIODS[0])
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)

  function showToast(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  function handlePDF() {
    generatePDF(period)
    showToast('PDF 생성 창이 열렸습니다.', 'info')
  }

  const maxVisitor = Math.max(...VISITOR_TREND.map(v => v.visitors))
  const maxAeo = Math.max(...AEO_TREND.map(a => a.count))

  return (
    <>
      {/* 탑바 */}
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/" className="topbar-back">← 대시보드</Link>
          <span className="topbar-sep">/</span>
          <span className="topbar-title">리포트</span>
        </div>
        <div className="topbar-right">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            style={{
              fontSize: 12, padding: '7px 10px',
              borderRadius: 'var(--r)', border: '1px solid var(--s200)',
              background: '#fff', color: 'var(--s700)',
              fontFamily: 'inherit', cursor: 'pointer',
              outline: 'none',
            }}
          >
            {PERIODS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <button
            className="btn btn-primary"
            onClick={handlePDF}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}
          >
            💾 PDF 생성
          </button>
        </div>
      </div>

      <div className="content">

        {/* ── 상단 KPI 4개 ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
            gap: 12,
            marginBottom: 20,
          }}
        >
          {REPORT_KPI.map(k => (
            <div
              key={k.label}
              style={{
                background: 'var(--s50)',
                borderRadius: 'var(--r)',
                padding: '12px 14px',
              }}
            >
              <div style={{ fontSize: 12, color: 'var(--s400)', marginBottom: 4 }}>{k.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy)' }}>{k.value}</div>
              <div className={k.up ? 'up' : 'down'} style={{ fontSize: 12 }}>{k.delta}</div>
            </div>
          ))}
        </div>

        {/* ── 첫 번째 행: 퍼널 전환율 + 월별 방문자 추이 ── */}
        <div className="grid2" style={{ marginBottom: 14 }}>

          {/* 월간 퍼널 전환율 */}
          <div className="card">
            <div className="card-head">
              <span className="card-title">⬇ 월간 퍼널 전환율</span>
            </div>

            {/* 퍼널 단계 막대 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {FUNNEL_STEPS.map((step, i) => {
                const widths = [100, 16.9, 1.25, 0.43]
                const barW = widths[i]
                return (
                  <div key={step.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                      <span style={{ color: 'var(--s700)', fontWeight: 500 }}>{step.label}</span>
                      <span style={{ fontWeight: 700, color: 'var(--navy)' }}>
                        {step.value.toLocaleString()}
                        {i > 0 && (
                          <span style={{ fontWeight: 400, color: 'var(--s400)', marginLeft: 6 }}>
                            ({step.pct}%)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="prog-track">
                      <div
                        className="prog-fill pf-navy"
                        style={{ width: `${barW}%`, opacity: 1 - i * 0.15 }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ fontSize: 12, color: 'var(--s400)' }}>
              방문→내원{' '}
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>0.76%</span>
              {' '}· 업계 평균 0.41%
            </div>
          </div>

          {/* 월별 방문자 추이 */}
          <div className="card">
            <div className="card-head">
              <span className="card-title">📈 월별 방문자 추이</span>
            </div>

            {/* CSS 막대 차트 */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, padding: '0 4px', marginBottom: 8 }}>
              {VISITOR_TREND.map(v => {
                const h = Math.round((v.visitors / maxVisitor) * 120)
                return (
                  <div key={v.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: 130 }}>
                      <div
                        style={{
                          width: 28,
                          height: h,
                          background: v.current ? 'var(--s200)' : 'var(--navy)',
                          borderRadius: '3px 3px 0 0',
                          opacity: v.current ? 0.6 : 1,
                          transition: 'height .3s',
                        }}
                        title={`${v.month} ${v.visitors.toLocaleString()}명`}
                      />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--s400)' }}>
                      {v.month}{v.current ? '*' : ''}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--s400)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--navy)', display: 'inline-block' }} />
                방문자
              </span>
              <span style={{ marginLeft: 'auto' }}>* 진행 중</span>
            </div>
          </div>
        </div>

        {/* ── 두 번째 행: SEO 키워드 순위 + AEO 인용 추적 ── */}
        <div className="grid2" style={{ marginBottom: 14 }}>

          {/* SEO 키워드 순위 */}
          <div className="card">
            <div className="card-head">
              <span className="card-title">🔍 SEO 키워드 순위</span>
              <span style={{ fontSize: 12, color: 'var(--s400)' }}>Yahoo Japan</span>
            </div>

            {/* 헤더 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14, marginBottom: 6, fontSize: 10, color: 'var(--s400)' }}>
              <span>검색량</span>
              <span>순위</span>
              <span>변동</span>
            </div>

            {/* 키워드 목록 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {SEO_KEYWORDS.map(kw => {
                const diff = kw.prevRank - kw.rank // 양수 = 상승
                const diffColor = diff > 0 ? '#059669' : diff < 0 ? 'var(--red)' : 'var(--s400)'
                const diffText = diff > 0 ? `↑ +${diff}` : diff < 0 ? `↓ ${diff}` : '→ 0'
                return (
                  <div
                    key={kw.keyword}
                    style={{
                      display: 'flex', alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--s100)',
                      gap: 8,
                    }}
                  >
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--s700)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {kw.keyword}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--s400)', minWidth: 48, textAlign: 'right' }}>
                      {kw.volume >= 1000 ? `${(kw.volume / 1000).toFixed(1)}K` : kw.volume}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', minWidth: 32, textAlign: 'right' }}>
                      {kw.rank}위
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: diffColor, minWidth: 36, textAlign: 'right' }}>
                      {diffText}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* AEO · LLM 인용 추적 */}
          <div className="card">
            <div className="card-head">
              <span className="card-title">🧠 AEO · LLM 인용 추적</span>
              <span style={{ fontSize: 12, color: 'var(--s500)', fontWeight: 500 }}>★ 차별화 KPI</span>
            </div>

            {/* AEO 키워드 목록 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 10 }}>
              {AEO_KEYWORDS.map(kw => (
                <div
                  key={kw.keyword}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 0',
                    borderBottom: '1px solid var(--s100)',
                  }}
                >
                  <span style={{ flex: 1, fontSize: 12, color: 'var(--s700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {kw.keyword}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', minWidth: 24 }}>
                    {kw.citations}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, minWidth: 30, textAlign: 'right',
                    color: kw.delta > 0 ? '#059669' : kw.delta < 0 ? 'var(--red)' : 'var(--s400)',
                  }}>
                    {kw.delta > 0 ? `+${kw.delta}` : kw.delta}
                  </span>
                </div>
              ))}
            </div>

            {/* AEO 요약 배너 */}
            <div style={{
              marginBottom: 10, padding: '10px 12px',
              background: 'var(--navy-l)', borderLeft: '3px solid var(--navy)',
              borderRadius: 'var(--r)', fontSize: 12, color: 'var(--navy)',
            }}>
              <strong>이번 달 총 19회 인용</strong> — 전월 12회 대비 +58.3%<br />
              <span style={{ fontSize: 12 }}>다음 측정: 6월 1일 자동 실행</span>
            </div>

            {/* AEO 월별 추이 (CSS 막대) */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60, padding: '0 4px' }}>
              {AEO_TREND.map(a => {
                const h = Math.round((a.count / maxAeo) * 50)
                return (
                  <div key={a.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: 52 }}>
                      <div
                        style={{
                          width: '100%', minWidth: 20, height: h,
                          background: 'var(--navy)', borderRadius: '2px 2px 0 0',
                          transition: 'height .3s',
                        }}
                        title={`${a.month} ${a.count}회`}
                      />
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--s400)' }}>{a.month}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── 세 번째 행: LINE 자동상담 성과 + 채널별 문의 ── */}
        <div className="grid2" style={{ marginBottom: 14 }}>

          {/* LINE 자동상담 성과 */}
          <div className="card">
            <div className="card-head">
              <span className="card-title">🤖 LINE 자동상담 성과</span>
            </div>

            {/* 3개 지표 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
              {LINE_PERF.map(p => (
                <div
                  key={p.label}
                  style={{ background: 'var(--s50)', borderRadius: 'var(--r)', padding: 10, textAlign: 'center' }}
                >
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>{p.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--s400)', marginTop: 2 }}>{p.label}</div>
                </div>
              ))}
            </div>

            {/* 시나리오별 처리 비율 (수평 막대) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {LINE_SCENARIOS.map(s => (
                <div key={s.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                    <span style={{ color: 'var(--s700)' }}>{s.label}</span>
                    <span style={{ fontWeight: 600 }}>{s.pct}%</span>
                  </div>
                  <div className="prog-track">
                    <div className="prog-fill" style={{ width: `${s.pct}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 채널별 문의 */}
          <div className="card">
            <div className="card-head">
              <span className="card-title">📡 채널별 문의</span>
            </div>

            {/* 채널 비중 막대 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {CHANNEL_DIST.map(c => (
                <div key={c.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                    <span style={{ color: 'var(--s700)' }}>{c.label}</span>
                    <span style={{ fontWeight: 600 }}>{c.pct}%</span>
                  </div>
                  <div className="prog-track" style={{ height: 8 }}>
                    <div className="prog-fill" style={{ width: `${c.pct}%`, background: c.color, height: '100%' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* 채널별 상세 수치 테이블 */}
            <table className="table" style={{ fontSize: 12, marginTop: 8 }}>
              <thead>
                <tr>
                  <th>채널</th>
                  <th style={{ textAlign: 'right' }}>문의</th>
                  <th style={{ textAlign: 'right' }}>예약</th>
                  <th style={{ textAlign: 'right' }}>전환율</th>
                </tr>
              </thead>
              <tbody>
                {CHANNEL_STATS.map(c => (
                  <tr key={c.channel}>
                    <td>{c.channel}</td>
                    <td style={{ textAlign: 'right' }}>{c.inquiries}</td>
                    <td style={{ textAlign: 'right' }}>{c.bookings}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{
                        fontWeight: 700,
                        color: c.convRate >= 35 ? '#16A34A' : c.convRate >= 28 ? 'var(--navy)' : 'var(--s400)',
                      }}>
                        {c.convRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 8, textAlign: 'center' }}>
              LINE 52% 1위 · 20~23시 집중
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <footer className="site-footer">© 2026 MEDIFLOW. All rights reserved.</footer>
      </div>

      {/* 토스트 */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'success' ? '#059669' : toast.type === 'error' ? '#DC2626' : '#0D1B3E',
          color: '#fff', padding: '11px 22px', borderRadius: 10,
          fontSize: 13, fontWeight: 500,
          boxShadow: '0 4px 20px rgba(0,0,0,.2)',
          zIndex: 9999, whiteSpace: 'nowrap',
          animation: 'fadeInUp .25s ease both',
        }}>
          {toast.msg}
        </div>
      )}
    </>
  )
}
