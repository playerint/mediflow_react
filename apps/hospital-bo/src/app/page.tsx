'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  HOSPITAL_INFO,
  KPI,
  RECENT_INQUIRIES,
  TODAY_SCHEDULE,
  AEO_TOP,
  LINE_BOT,
  STATUS_LABEL,
  STATUS_BADGE,
  CHANNEL_STATS,
  MONTHLY_KPI,
} from '@/lib/mock-data'

// ── 대시보드 전용 목업 데이터 ──────────────────────────────────

const PERIOD = '2026년 6월 1일 ~ 6월 9일'

const ALERTS = [
  { id: 1, dot: '#DC2626', title: '미답변 문의 48시간 초과 — 小林 結衣', sub: 'LINE · 2일 전 09:00 접수', time: '48시간+', link: '/crm' },
  { id: 2, dot: '#D97706', title: '오늘 미처리 문의 3건', sub: '신규 문의 빠른 답변을 권장합니다', time: '지금', link: '/crm' },
  { id: 3, dot: '#2563EB', title: '이번 달 예약 24건 — 전월 대비 +8건', sub: '6월 예약 현황을 확인하세요', time: '이번 달', link: '/booking' },
]

const BUILD_STEPS = [
  { label: '사이트 기본 정보',   pct: 100, done: true,  warn: false },
  { label: '콘텐츠 번역',        pct: 80,  done: false, warn: true  },
  { label: '이미지 에셋 업로드', pct: 60,  done: false, warn: false },
  { label: 'LINE 채널 연결',     pct: 100, done: true,  warn: false },
  { label: 'SEO / AEO 설정',    pct: 40,  done: false, warn: false },
  { label: '퍼블리시',           pct: 0,   done: false, warn: false },
]

const FUNNEL_STEPS = [
  { n: 1420, lbl: '방문',    color: '#0D1B3E' },
  { n: 312,  lbl: '문의',   color: '#2563EB' },
  { n: 86,   lbl: '상담',   color: '#7C3AED' },
  { n: 24,   lbl: '예약',   color: '#0D9488' },
  { n: 18,   lbl: '내원',   color: '#16A34A' },
]

const FUNNEL_CONV_RATE = '1.27%'
const FUNNEL_INDUSTRY_AVG = '0.9%'

const CHANNELS = [
  { name: 'LINE',       cnt: 164, pct: 53, color: '#06B854' },
  { name: '사이트 폼',  cnt: 98,  pct: 32, color: '#2563EB' },
  { name: '직접 연락',  cnt: 34,  pct: 11, color: '#7C3AED' },
  { name: '기타',       cnt: 12,  pct: 4,  color: '#9CA3AF' },
]

const AEO_ENGINES = [
  { engine: 'ChatGPT',       cnt: 24, max: 30, delta: '+5', color: '#0D1B3E' },
  { engine: 'Perplexity',    cnt: 18, max: 30, delta: '+4', color: '#2563EB' },
  { engine: 'Google AIO',    cnt: 12, max: 30, delta: '+1', color: '#7C3AED' },
  { engine: 'Bing Copilot',  cnt: 4,  max: 30, delta: '-2', color: '#9CA3AF' },
]

const AEO_TOTAL_THIS_MONTH = 58
const AEO_DELTA = '↑ 지난주 대비 +11'

const LINE_AUTO = {
  aiRate:      '83%',
  avgResponse: '1분 12초',
  convRate:    '6.3%',
  chartData:   [8, 12, 6, 14, 10, 16, 9, 11, 13, 7, 12, 15, 8, 10, 12],
}

// ──────────────────────────────────────────────────────────────

function buildStepIcon(done: boolean, warn: boolean): string {
  if (warn) return '⚠'
  if (done) return '✓'
  return '○'
}
function buildStepColor(done: boolean, warn: boolean): string {
  if (warn) return '#D97706'
  if (done) return '#059669'
  return '#9CA3AF'
}

export default function DashboardPage() {
  const [period, setPeriod] = useState('이번 달')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)

  function showToast(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const doneCount = BUILD_STEPS.filter(s => s.done).length

  return (
    <>
      {/* 상단 타이틀바 */}
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-title">홈 대시보드</span>
          <span style={{ fontSize: 12, color: 'var(--s400)', marginLeft: 8 }}>{PERIOD}</span>
        </div>
        <div className="topbar-right">
          <select
            value={period}
            onChange={e => { setPeriod(e.target.value); showToast(`${e.target.value} 데이터를 불러왔습니다`, 'info') }}
            style={{ fontSize: 12, padding: '5px 10px', borderRadius: 10, border: '1px solid var(--s200)', background: '#fff', color: 'var(--s700)', width: 'auto', cursor: 'pointer' }}
          >
            <option>이번 달</option>
            <option>지난달</option>
            <option>최근 3개월</option>
          </select>
          <Link href="/notifications" style={{ fontSize: 20, textDecoration: 'none', padding: '4px 6px', borderRadius: 8, background: 'var(--s100)', lineHeight: 1 }} title="알림">🔔</Link>
          <Link href="/settings" style={{ fontSize: 20, textDecoration: 'none', padding: '4px 6px', borderRadius: 8, background: 'var(--s100)', lineHeight: 1 }} title="설정">⚙️</Link>
        </div>
      </div>

      <div className="content fade">

        {/* KPI 카드 4개 */}
        <div className="kpi-grid">
          {KPI.map(k => (
            <Link key={k.label} href={k.href} style={{ textDecoration: 'none' }}>
              <div className="kpi-card">
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-value">
                  {k.value}
                  <span className="kpi-unit">{k.unit}</span>
                </div>
                <div className={`kpi-delta ${k.up ? 'up' : 'down'}`}>{k.delta}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* 2열 그리드: 지금 처리할 항목 + 빌드 진행 현황 */}
        <div className="grid2" style={{ alignItems: 'start', marginBottom: 14 }}>

          {/* 지금 처리할 항목 */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">⚠ 지금 처리할 항목</div>
              <Link href="/notifications" className="see-all">전체 보기</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {ALERTS.map((a, i) => (
                <Link
                  key={a.id}
                  href={a.link}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 2px',
                    borderBottom: i < ALERTS.length - 1 ? '1px solid var(--s100)' : 'none',
                    textDecoration: 'none', cursor: 'pointer',
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.dot, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--s900)', marginBottom: 2 }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--s500)' }}>{a.sub}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: 'var(--s400)' }}>{a.time}</span>
                    <span style={{ fontSize: 14, color: 'var(--s300)' }}>›</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 빌드 진행 현황 */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">▤ 빌드 진행 현황</div>
              <span style={{ fontSize: 12, color: 'var(--s400)' }}>{BUILD_STEPS.length}단계 중 {doneCount}완료</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {BUILD_STEPS.map((st, i) => {
                const color = buildStepColor(st.done, st.warn)
                const icon  = buildStepIcon(st.done, st.warn)
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 18, fontSize: 13, textAlign: 'center', color, flexShrink: 0 }}>{icon}</div>
                    <div style={{ fontSize: 12, color: 'var(--s700)', width: 120, flexShrink: 0 }}>{st.label}</div>
                    <div style={{ flex: 1, height: 5, background: 'var(--s100)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${st.pct}%`, height: '100%', background: color, borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--s400)', width: 30, textAlign: 'right', flexShrink: 0 }}>{st.pct}%</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 2열 그리드: 문의 퍼널 + 채널별 문의 */}
        <div className="grid2" style={{ alignItems: 'start', marginBottom: 14 }}>

          {/* 문의 퍼널 */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">⬇ 문의 퍼널</div>
              <Link href="/crm" className="see-all">상세 보기</Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 10 }}>
              {FUNNEL_STEPS.map((f, i) => {
                const maxN = FUNNEL_STEPS[0].n
                const barH = Math.max(20, Math.round((f.n / maxN) * 90))
                const prevN = i > 0 ? FUNNEL_STEPS[i - 1].n : null
                const rate = prevN ? Math.round((f.n / prevN) * 100) + '%' : ''
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)' }}>{f.n.toLocaleString()}</div>
                    <div style={{ width: '100%', height: barH, background: f.color, borderRadius: 4, opacity: 0.85 }} />
                    <div style={{ fontSize: 11, color: 'var(--s500)' }}>{f.lbl}</div>
                    <div style={{ fontSize: 10, color: 'var(--s400)' }}>{rate}</div>
                  </div>
                )
              })}
            </div>
            <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 6 }}>
              방문→내원 전환율&nbsp;
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>{FUNNEL_CONV_RATE}</span>
              &nbsp;· 업계 평균 {FUNNEL_INDUSTRY_AVG}
            </div>
          </div>

          {/* 채널별 문의 */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">📡 채널별 문의</div>
              <Link href="/crm" className="see-all">비교 분석</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CHANNELS.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                  <div style={{ fontSize: 13, color: 'var(--s700)', width: 70, flexShrink: 0 }}>{c.name}</div>
                  <div style={{ flex: 1, height: 5, background: 'var(--s100)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${c.pct}%`, height: '100%', background: c.color, borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--s700)', width: 30, textAlign: 'right', flexShrink: 0 }}>{c.cnt}건</div>
                  <div style={{ fontSize: 11, color: 'var(--s400)', width: 28, textAlign: 'right', flexShrink: 0 }}>{c.pct}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3열 그리드: 오늘 일정 + AEO 인용 현황 + LINE 자동상담 */}
        <div className="grid3" style={{ alignItems: 'start', marginBottom: 14 }}>

          {/* 오늘 일정 */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">📅 오늘 일정</div>
              <Link href="/booking" className="see-all">이번 주</Link>
            </div>
            {TODAY_SCHEDULE.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--s400)', fontSize: 13 }}>오늘 일정이 없습니다</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {TODAY_SCHEDULE.map((s, i) => (
                  <Link
                    key={s.id}
                    href="/booking"
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '10px 0',
                      borderBottom: i < TODAY_SCHEDULE.length - 1 ? '1px solid var(--s100)' : 'none',
                      textDecoration: 'none', cursor: 'pointer',
                    }}
                  >
                    <div style={{ minWidth: 38, fontSize: 12, fontWeight: 700, color: 'var(--navy)', paddingTop: 1, flexShrink: 0 }}>{s.time}</div>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', marginTop: 3, flexShrink: 0,
                      background: s.urgent ? '#DC2626' : '#0D9488',
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--s900)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        {s.name}
                        {s.urgent && <span className="badge bdg-red">긴급</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--s500)' }}>
                        {s.type}
                        {s.note && <span style={{ color: 'var(--s400)', marginLeft: 6 }}>· {s.note}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* AEO 인용 현황 */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">🧠 AEO 인용 현황</div>
              <Link href="/reports" className="see-all">상세</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {AEO_ENGINES.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 12, color: 'var(--s700)', width: 88, flexShrink: 0 }}>{a.engine}</div>
                  <div style={{ flex: 1, height: 5, background: 'var(--s100)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.round((a.cnt / a.max) * 100)}%`, height: '100%', background: a.color, borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--s700)', width: 30, textAlign: 'right', flexShrink: 0 }}>{a.cnt}회</div>
                  <div style={{
                    fontSize: 11, width: 28, textAlign: 'right', flexShrink: 0,
                    color: a.delta.startsWith('+') ? 'var(--green)' : a.delta.startsWith('-') ? 'var(--red)' : 'var(--s400)',
                    fontWeight: 600,
                  }}>{a.delta}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 8 }}>
              이번 달 총&nbsp;<span style={{ color: 'var(--navy)', fontWeight: 600 }}>{AEO_TOTAL_THIS_MONTH}</span>
              &nbsp;·&nbsp;<span style={{ color: 'var(--green)', fontWeight: 500 }}>{AEO_DELTA}</span>
            </div>
          </div>

          {/* LINE 자동상담 */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">🤖 LINE 자동상담</div>
              <Link href="/line" className="see-all">설정</Link>
            </div>

            {/* 3개 지표 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
              {[
                { label: 'AI 해결률',  value: LINE_AUTO.aiRate },
                { label: '평균 응답',  value: LINE_AUTO.avgResponse },
                { label: '예약 전환',  value: LINE_AUTO.convRate },
              ].map((stat, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '8px 4px', background: 'var(--s50)', borderRadius: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 3 }}>{stat.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--s500)' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* 미니 바 차트 (Canvas 없이 div로 표현) */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 52, paddingTop: 4 }}>
              {LINE_AUTO.chartData.map((v, i) => {
                const maxV = Math.max(...LINE_AUTO.chartData)
                const barH = Math.max(4, Math.round((v / maxV) * 44))
                return (
                  <div
                    key={i}
                    style={{ flex: 1, height: barH, background: '#0D9488', borderRadius: 2, opacity: 0.75 }}
                    title={`${v}건`}
                  />
                )
              })}
            </div>
            <div style={{ fontSize: 10, color: 'var(--s400)', textAlign: 'center', marginTop: 4 }}>일별 LINE 처리 건수</div>
          </div>
        </div>

        {/* 최근 문의 (테이블) */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="card-head">
            <div className="card-title">💬 최근 문의</div>
            <Link href="/crm" className="see-all">전체 보기</Link>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>이름</th>
                <th>채널</th>
                <th>문의 내용</th>
                <th>상태</th>
                <th>시간</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_INQUIRIES.map(q => (
                <tr
                  key={q.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => { window.location.href = '/crm' }}
                >
                  <td style={{ fontWeight: 500 }}>{q.name}</td>
                  <td>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                      background: q.channel === 'LINE' ? '#D1FAE5' : 'var(--blue-l)',
                      color: q.channel === 'LINE' ? '#065F46' : 'var(--blue)',
                    }}>
                      {q.channel}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--s500)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {q.content}
                  </td>
                  <td><span className={STATUS_BADGE[q.status]}>{STATUS_LABEL[q.status]}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--s400)', whiteSpace: 'nowrap' }}>{q.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
