'use client'

import { useState } from 'react'
import Link from 'next/link'

// ── 마케팅 성과 KPI ────────────────────────────────────────────
const SITE_MARKETING_PERFORMANCE = {
  monthlyVisitors: 1420,
  inquiries: 41,
  bookings: 12,
  aeoScore: 58,
  lineRate: 83,
  convRate: '29.3%',
}

// ── 마케팅 전략 문서 ───────────────────────────────────────────
const SITE_MARKETING_STRATEGY = {
  updatedAt: '2026-06-01',
  target: '20~40대 일본인 여성, 한국 성형에 관심 있는 의사결정 단계의 소비자',
  positioning: '자연스러운 결과 + 일본어 완전 대응 + 투명한 가격의 강남 프리미엄 클리닉',
  coreMessage: '韓国で最も安心できる美容外科',
  channels: ['LINE', 'Yahoo Japan SEO', 'ChatGPT/Perplexity AEO', '인스타그램(일본어)'],
}

// ── 경쟁사 분석 ────────────────────────────────────────────────
const SITE_MARKETING_COMPETITORS = [
  {
    name: 'バノバギ',
    strength: '강력한 일본 브랜드 인지도, SNS 마케팅',
    weakness: '가격 고가, 상담 대기 김',
    ourEdge: '자연스러운 시술, 빠른 응대',
  },
  {
    name: 'id病院',
    strength: '규모·시설 우위, 다양한 시술',
    weakness: '대형병원 느낌, 개인 맞춤 부족',
    ourEdge: '1:1 맞춤 상담, 일본어 전담',
  },
  {
    name: 'ジョーウォン',
    strength: '코 성형 특화, 유명 의사',
    weakness: '부위 한정, 복합 시술 약함',
    ourEdge: '복합·패키지 시술 강점',
  },
]

// ── 메인 키워드 (SEO 순위 포함) ────────────────────────────────
const SITE_MARKETING_MAIN_KEYWORDS = [
  '韓国整形 日本語対応',
  '二重手術 ソウル',
  'オルレ美容外科',
  '韓国 鼻整形 自然',
  '江南クリニック 口コミ',
  '美容整形 韓国 費用',
]

// SEO 키워드 순위 맵
const SEO_MAP: Record<string, { rank: number; vol: string; trend: 'up' | 'down' | 'same' }> = {
  '韓国整形 日本語対応':    { rank: 3,  vol: '2,400번 노출/월', trend: 'up' },
  '二重手術 ソウル':         { rank: 5,  vol: '1,900번 노출/월', trend: 'up' },
  'オルレ美容外科':          { rank: 1,  vol: '830번 노출/월',   trend: 'same' },
  '韓国 鼻整形 自然':       { rank: 8,  vol: '1,500번 노출/월', trend: 'down' },
  '江南クリニック 口コミ':   { rank: 12, vol: '720번 노출/월',   trend: 'up' },
  '美容整形 韓国 費用':     { rank: 21, vol: '3,100번 노출/월', trend: 'up' },
}

// ── 롱테일 키워드 (AEO 연동) ──────────────────────────────────
const SITE_MARKETING_LONGTAIL = [
  {
    kw: '韓国 美容整形 自然な仕上がり',
    aeoStatus: 'cited-all',
    aeoLabel: '✓ AI 인용 2건',
    aeoStyle: { background: '#D1FAE5', color: '#065F46' },
  },
  {
    kw: '二重手術 ソウル おすすめクリニック',
    aeoStatus: 'cited-all',
    aeoLabel: '✓ AI 인용 1건',
    aeoStyle: { background: '#D1FAE5', color: '#065F46' },
  },
  {
    kw: '韓国整形 術後 回復 期間',
    aeoStatus: 'partial',
    aeoLabel: '△ 부분 인용 1/2',
    aeoStyle: { background: '#FEF3C7', color: '#92400E' },
  },
  {
    kw: 'ソウル 鼻整形 自然',
    aeoStatus: 'cited-all',
    aeoLabel: '✓ AI 인용 1건',
    aeoStyle: { background: '#D1FAE5', color: '#065F46' },
  },
  {
    kw: '美容整形 ダウンタイム 最短',
    aeoStatus: 'none',
    aeoLabel: '⚠ 미인용',
    aeoStyle: { background: '#FEF2F2', color: '#DC2626' },
  },
  {
    kw: '江南 脂肪吸引 価格',
    aeoStatus: 'no-aeo',
    aeoLabel: '○ AEO 없음',
    aeoStyle: { background: '#F3F4F6', color: '#6B7280' },
  },
  {
    kw: '韓国美容外科 日本語スタッフ',
    aeoStatus: 'partial',
    aeoLabel: '△ 부분 인용 1/2',
    aeoStyle: { background: '#FEF3C7', color: '#92400E' },
  },
  {
    kw: 'ソウル整形 モニター募集',
    aeoStatus: 'no-aeo',
    aeoLabel: '○ AEO 없음',
    aeoStyle: { background: '#F3F4F6', color: '#6B7280' },
  },
]

// ── AI 분석 리포트 샘플 결과 ──────────────────────────────────
const AI_REPORT_SAMPLE = `**전략 개선 포인트 3가지**

1. **AEO 강화 — 미인용 키워드 콘텐츠 보강**
   "美容整形 ダウンタイム 最短" 등 미인용 키워드에 대해 FAQ 형식의 일본어 콘텐츠를 추가하면 ChatGPT·Perplexity 인용 가능성이 높아집니다. 특히 구체적인 수치(일 수, 비용 범위)를 포함한 Q&A 포맷이 효과적입니다.

2. **LINE 팔로워 전환율 제고**
   현재 팔로워 284명 대비 이번 달 문의 41건(14.4%)은 업계 평균(18~22%)보다 낮습니다. LINE 브로드캐스트 발송 빈도를 월 3회 → 6회로 늘리고, 시술 전후 비포·애프터 콘텐츠를 정기 발송하면 문의 전환을 높일 수 있습니다.

3. **경쟁 차별화 — "빠른 응대" 강조 콘텐츠 제작**
   バノバギ 대비 차별점인 "빠른 응대·자연스러운 시술"을 환자 후기 형태로 일본어 사이트에 추가하세요. 구체적인 응대 시간(평균 15분 이내 답변 등)을 수치로 표시하면 신뢰도가 상승합니다.

**다음 달 주력 채널: Yahoo Japan SEO**
현재 "美容整形 韓国 費用"(월 3,100회 검색)가 21위에 위치해 있어 상위 10위 진입 시 트래픽 2배 이상 기대됩니다. 이 키워드를 타겟한 랜딩 페이지 최적화를 우선 진행하세요.`

export default function MarketingPage() {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [modal, setModal] = useState<{ title: string; body: string } | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  function showToast(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  function requestAIStrategy() {
    if (aiLoading) return
    setAiLoading(true)
    showToast('🤖 AI가 마케팅 전략을 분석 중...', 'info')
    setTimeout(() => {
      setAiLoading(false)
      setModal({ title: '📋 AI 분석 리포트', body: AI_REPORT_SAMPLE })
    }, 1800)
  }

  const p = SITE_MARKETING_PERFORMANCE

  const perfItems = [
    { val: p.monthlyVisitors.toLocaleString(), lbl: '월 방문자', delta: '↑ +23%' },
    { val: p.inquiries + '건', lbl: '문의', delta: '↑ +8건' },
    { val: p.bookings + '건', lbl: '예약 전환', delta: '전환율 ' + p.convRate },
    { val: p.aeoScore + '회', lbl: 'AEO 인용', delta: '↑ +7회' },
    { val: p.lineRate + '%', lbl: 'LINE 해결률', delta: '↑ +2%p' },
    { val: p.convRate, lbl: '예약 전환율', delta: '업계평균 21%' },
  ]

  const s = SITE_MARKETING_STRATEGY
  const strategyItems = [
    { label: '타겟 고객', val: s.target },
    { label: '포지셔닝', val: s.positioning },
    { label: '핵심 메시지', val: `「${s.coreMessage}」` },
    { label: '주요 채널', val: s.channels.join(' · ') },
  ]

  const trendColor = { up: '#16A34A', down: '#DC2626', same: '#9CA3AF' }
  const trendIcon  = { up: '↑', down: '↓', same: '→' }

  const sortedMainKws = [...SITE_MARKETING_MAIN_KEYWORDS].sort((a, b) => {
    const ra = SEO_MAP[a]?.rank ?? 999
    const rb = SEO_MAP[b]?.rank ?? 999
    return ra - rb
  })

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/" className="topbar-back">← 대시보드</Link>
          <span className="topbar-sep">/</span>
          <span className="topbar-title">마케팅 현황</span>
        </div>
        <div className="topbar-right">
          <span style={{ fontSize: 12, color: 'var(--s400)' }}>
            최종 업데이트: {SITE_MARKETING_STRATEGY.updatedAt}
          </span>
          <button
            className="btn"
            onClick={requestAIStrategy}
            disabled={aiLoading}
            style={{ opacity: aiLoading ? 0.6 : 1, cursor: aiLoading ? 'not-allowed' : 'pointer' }}
          >
            {aiLoading ? '⏳ 분석 중...' : '📋 AI 분석 리포트'}
          </button>
        </div>
      </div>

      <div className="content">

        {/* ── 성과 KPI ─────────────────────────────────────────── */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="card-title" style={{ marginBottom: 14 }}>📊 이번 달 마케팅 성과</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
            {perfItems.map((item) => (
              <div
                key={item.lbl}
                style={{ textAlign: 'center', padding: 12 }}
              >
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>
                  {item.val}
                </div>
                <div style={{ fontSize: 12, color: 'var(--s400)' }}>{item.lbl}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#16A34A', marginTop: 2 }}>
                  {item.delta}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 전략 + 경쟁사 ─────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

          {/* 마케팅 전략 */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 4 }}>🎯 마케팅 전략</div>
            <div style={{ fontSize: 11, color: 'var(--s400)', marginBottom: 12 }}>
              MEDIFLOW가 설정한 타겟 고객·포지셔닝·핵심 메시지·주력 채널입니다.
            </div>
            {strategyItems.map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  padding: '12px 0',
                  borderBottom: '1px solid var(--s100)',
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'var(--s400)',
                    textTransform: 'uppercase',
                    letterSpacing: '.04em',
                  }}
                >
                  {item.label}
                </div>
                <div style={{ fontSize: 13, color: 'var(--s800)', lineHeight: 1.6 }}>
                  {item.val}
                </div>
              </div>
            ))}
          </div>

          {/* 경쟁사 분석 */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 4 }}>🏆 경쟁사 분석</div>
            <div style={{ fontSize: 11, color: 'var(--s400)', marginBottom: 12 }}>
              주요 경쟁 병원과의 강점·약점을 비교하고 우리 병원의 차별점을 확인합니다.
            </div>
            {SITE_MARKETING_COMPETITORS.map((c) => (
              <div
                key={c.name}
                style={{
                  display: 'flex',
                  gap: 10,
                  padding: '10px 0',
                  borderBottom: '1px solid var(--s100)',
                }}
              >
                <div
                  style={{
                    width: 80,
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--s800)',
                    flexShrink: 0,
                  }}
                >
                  {c.name}
                </div>
                <div style={{ flex: 1, fontSize: 12, color: 'var(--s500)' }}>
                  <div>강점: {c.strength}</div>
                  <div>약점: {c.weakness}</div>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: '#16A34A',
                    fontWeight: 500,
                    textAlign: 'right',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  차별점: {c.ourEdge}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 타겟 키워드 ───────────────────────────────────────── */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ marginBottom: 12 }}>
            <div className="card-title" style={{ marginBottom: 4 }}>🔑 타겟 키워드</div>
            <div style={{ fontSize: 11, color: 'var(--s400)' }}>
              Yahoo Japan에서 이 병원이 노출되길 목표로 하는 검색어입니다. 순위가 낮을수록 상위 노출 중입니다.
            </div>
          </div>

          {/* 메인 키워드 */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s400)', marginBottom: 6 }}>
              메인 키워드
            </div>
            {sortedMainKws.map((kw) => {
              const seo = SEO_MAP[kw]
              return (
                <div
                  key={kw}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 0',
                    borderBottom: '1px solid var(--s100)',
                  }}
                >
                  {seo ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 30,
                        height: 22,
                        borderRadius: 6,
                        background: seo.rank <= 3 ? 'var(--blue)' : 'var(--navy)',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {seo.rank}
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 30,
                        height: 22,
                        borderRadius: 6,
                        background: '#D1D5DB',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      -
                    </span>
                  )}
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--s800)', fontWeight: 500 }}>
                    {kw}
                  </span>
                  {seo && (
                    <span style={{ fontSize: 12, color: 'var(--s400)', flexShrink: 0 }}>
                      {seo.vol.replace('/월', '번 노출/월')}
                    </span>
                  )}
                  {seo && (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                        width: 14,
                        textAlign: 'center',
                        color: trendColor[seo.trend],
                      }}
                    >
                      {trendIcon[seo.trend]}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* 롱테일 키워드 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s400)', marginBottom: 4 }}>
              롱테일 키워드
            </div>
            <div style={{ fontSize: 11, color: 'var(--s400)', marginBottom: 6 }}>
              2~3개 단어 조합의 구체적인 검색어로, 전환율이 높은 잠재 환자를 타겟합니다.
            </div>
            {SITE_MARKETING_LONGTAIL.map((item) => (
              <div
                key={item.kw}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 0',
                  borderBottom: '1px solid var(--s100)',
                }}
              >
                <span style={{ flex: 1, fontSize: 12, color: 'var(--s800)' }}>{item.kw}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 10,
                    flexShrink: 0,
                    ...item.aeoStyle,
                  }}
                >
                  {item.aeoLabel}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 12,
              padding: '10px 12px',
              background: 'var(--s50)',
              borderRadius: 'var(--r)',
              fontSize: 12,
              color: 'var(--s500)',
            }}
          >
            💬 키워드 변경이 필요하면 담당 매니저에게 문의하세요.
          </div>
        </div>

        <footer
          style={{
            padding: '20px 0',
            textAlign: 'center',
            fontSize: 12,
            color: 'var(--s400)',
            borderTop: '1px solid var(--s100)',
            marginTop: 20,
          }}
        >
          © 2026 MEDIFLOW. All rights reserved.
        </footer>
      </div>

      {/* ── AI 분석 리포트 모달 ─────────────────────────────────── */}
      {modal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.45)',
            zIndex: 9000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setModal(null) }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 560,
              maxHeight: '90vh',
              boxShadow: '0 20px 60px rgba(0,0,0,.2)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '24px 28px 16px',
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--navy)',
                flexShrink: 0,
                borderBottom: '1px solid var(--s100)',
              }}
            >
              {modal.title}
            </div>
            <div
              style={{
                padding: '16px 28px',
                fontSize: 13,
                color: 'var(--s700)',
                lineHeight: 1.8,
                overflowY: 'auto',
                flex: 1,
                whiteSpace: 'pre-wrap',
              }}
            >
              {modal.body.split('\n').map((line, i) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                  return (
                    <div key={i} style={{ fontWeight: 700, color: 'var(--navy)', marginTop: i === 0 ? 0 : 14, marginBottom: 6 }}>
                      {line.replace(/\*\*/g, '')}
                    </div>
                  )
                }
                if (line.match(/^\d\./)) {
                  const parts = line.split('**')
                  return (
                    <div key={i} style={{ marginBottom: 4 }}>
                      {parts.map((p, pi) =>
                        pi % 2 === 1
                          ? <strong key={pi}>{p}</strong>
                          : <span key={pi}>{p}</span>
                      )}
                    </div>
                  )
                }
                if (line === '') return <div key={i} style={{ height: 8 }} />
                return <div key={i} style={{ marginBottom: 4 }}>{line.replace(/\*\*/g, '')}</div>
              })}
            </div>
            <div
              style={{
                padding: '16px 28px',
                display: 'flex',
                gap: 8,
                justifyContent: 'flex-end',
                flexShrink: 0,
                borderTop: '1px solid var(--s100)',
              }}
            >
              <button className="btn" onClick={() => setModal(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 토스트 ─────────────────────────────────────────────── */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 28,
            left: '50%',
            transform: 'translateX(-50%)',
            background:
              toast.type === 'success' ? '#059669'
              : toast.type === 'error' ? '#DC2626'
              : '#0D1B3E',
            color: '#fff',
            padding: '11px 22px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 500,
            boxShadow: '0 4px 20px rgba(0,0,0,.2)',
            zIndex: 9999,
            whiteSpace: 'nowrap',
          }}
        >
          {toast.msg}
        </div>
      )}
    </>
  )
}
