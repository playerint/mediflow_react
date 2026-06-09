'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// ── Mock data ────────────────────────────────────────────────────────────────

interface CwvData {
  lcp: string
  inp: string
  cls: string
  score: number
  grade: string
}

interface SeoKeyword {
  rank: number
  kw: string
  vol: string
  trend: 'up' | 'down' | 'same'
}

interface AeoTarget {
  q: string
  engine: string
  cited: boolean
  lastSeen: string
}

interface MetaEntry {
  page: string
  title: string
  desc: string
  status: 'ok' | 'warn'
}

const CORE_WEB_VITALS: CwvData = {
  lcp: '1.2s',
  inp: '65ms',
  cls: '0.04',
  score: 98,
  grade: 'Good',
}

const SEO_KEYWORDS_DATA: SeoKeyword[] = [
  { rank: 1, kw: 'オルレ美容外科',          vol: '830번 노출/월',  trend: 'same' },
  { rank: 3, kw: '韓国整形 日本語対応',      vol: '2,400번 노출/월', trend: 'up' },
  { rank: 5, kw: '二重手術 ソウル',          vol: '1,900번 노출/월', trend: 'up' },
  { rank: 8, kw: '韓国 鼻整形 自然',        vol: '1,500번 노출/월', trend: 'down' },
  { rank: 12, kw: '江南クリニック 口コミ',   vol: '720번 노출/월',  trend: 'up' },
  { rank: 21, kw: '美容整形 韓国 費用',     vol: '3,100번 노출/월', trend: 'up' },
]

const AEO_TARGETS_INIT: AeoTarget[] = [
  { q: '韓国の美容外科で日本語対応しているクリニックはどこですか？',      engine: 'ChatGPT',    cited: true,  lastSeen: '2일 전' },
  { q: 'ソウルで二重手術を受けるのにおすすめのクリニックは？',            engine: 'Perplexity', cited: true,  lastSeen: '1주 전' },
  { q: '韓国整形のダウンタイムはどのくらいかかりますか？',                engine: 'Google AI',  cited: true,  lastSeen: '3일 전' },
  { q: 'オルレ美容外科の鼻整形の費用はいくらですか？',                    engine: 'ChatGPT',    cited: false, lastSeen: '-' },
  { q: '韓国美容整形クリニックの選び方のポイントを教えてください',        engine: 'Perplexity', cited: true,  lastSeen: '5일 전' },
  { q: '江南区で脂肪吸引ができる日本語対応クリニックは？',                engine: 'Bing AI',    cited: false, lastSeen: '-' },
]

const META_ENTRIES_INIT: MetaEntry[] = [
  {
    page: 'HOME',
    title: 'オルレ美容外科 | 韓国美容整形 日本語対応クリニック',
    desc: '日本語専属スタッフが対応する韓国美容整形クリニック。二重、鼻整形、脂肪吸引など。無料カウンセリング受付中。',
    status: 'ok',
  },
  {
    page: 'EYES',
    title: '二重手術・目整形 | オルレ美容外科 ソウル',
    desc: '自然な二重ラインを実現する目整形専門。埋没法・切開法・目頭切開など。日本語カウンセリング無料。',
    status: 'ok',
  },
  {
    page: 'NOSE',
    title: '鼻整形 韓国 | オルレ美容外科 江南',
    desc: '韓国トップクラスの鼻整形専門クリニック。隆鼻術・鼻尖縮小・鷲鼻修正など全種類対応。',
    status: 'warn',
  },
  {
    page: 'BODY',
    title: '脂肪吸引・ボディライン | オルレ美容外科',
    desc: '最新技術を用いた脂肪吸引・ボディコントロール。安全性と自然な仕上がりを追求します。',
    status: 'ok',
  },
  {
    page: 'ABOUT',
    title: 'クリニック紹介 | オルレ美容外科',
    desc: '2010年設立、累計施術実績15,000件以上。江南区の日本語対応美容外科クリニック。',
    status: 'warn',
  },
]

// ── Component ────────────────────────────────────────────────────────────────

interface AeoPending {
  q: string
  engine: string
}

interface MetaPending {
  title: string
  desc: string
}

export default function SiteSeoPage() {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)

  // AEO state
  const [aeoTargets, setAeoTargets] = useState<AeoTarget[]>(AEO_TARGETS_INIT)
  const [aeoPending, setAeoPending] = useState<AeoPending[]>([])
  const [aeoLoading, setAeoLoading] = useState(false)

  // Meta state
  const [metaEntries, setMetaEntries] = useState<MetaEntry[]>(META_ENTRIES_INIT)
  const [metaPending, setMetaPending] = useState<Record<number, MetaPending>>({})
  const [metaLoading, setMetaLoading] = useState(false)

  // Modal: AEO edit
  const [aeoEditModal, setAeoEditModal] = useState<{ idx: number; q: string } | null>(null)
  const [aeoEditQ, setAeoEditQ] = useState('')

  // Modal: Meta edit
  const [metaEditModal, setMetaEditModal] = useState<{ idx: number } | null>(null)
  const [metaEditTitle, setMetaEditTitle] = useState('')
  const [metaEditDesc, setMetaEditDesc] = useState('')

  // Modal: generic info
  const [infoModal, setInfoModal] = useState<{ title: string; body: string } | null>(null)

  function showToast(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  // ── AEO edit ──────────────────────────────────────────────────────────────
  function openAeoEdit(idx: number) {
    setAeoEditModal({ idx, q: aeoTargets[idx].q })
    setAeoEditQ(aeoTargets[idx].q)
  }

  function submitAeoEdit() {
    if (!aeoEditQ.trim()) { showToast('질문을 입력해주세요.', 'error'); return }
    if (aeoEditModal === null) return
    const updated = [...aeoTargets]
    updated[aeoEditModal.idx] = { ...updated[aeoEditModal.idx], q: aeoEditQ.trim() }
    setAeoTargets(updated)
    setAeoEditModal(null)
    showToast('✓ 수정되었습니다.', 'success')
  }

  // ── AEO AI suggest ────────────────────────────────────────────────────────
  function generateAEOSuggestions() {
    setAeoLoading(true)
    showToast('🤖 AI가 AEO 타겟 질문을 생성 중...', 'info')
    // Simulate AI response after 1.5s
    setTimeout(() => {
      const suggestions: AeoPending[] = [
        { q: '韓国整形で失敗しないためのクリニック選びのコツは？', engine: 'ChatGPT' },
        { q: 'ソウルの美容外科で術後サポートが充実しているのはどこ？', engine: 'Perplexity' },
        { q: 'オルレ美容外科の口コミ・評判はどうですか？', engine: 'Google AI' },
      ]
      const existingQs = [...aeoTargets, ...aeoPending].map(a => a.q)
      const fresh = suggestions.filter(s => !existingQs.includes(s.q))
      if (fresh.length === 0) {
        showToast('모든 제안이 이미 등록된 질문입니다.', 'error')
      } else {
        setAeoPending(prev => [...prev, ...fresh])
        showToast(`✓ ${fresh.length}개 질문이 제안됐습니다. 검토 후 승인해주세요.`, 'success')
      }
      setAeoLoading(false)
    }, 1500)
  }

  function approveAEO(idx: number) {
    const item = aeoPending[idx]
    if (!item) return
    setAeoTargets(prev => [...prev, { q: item.q, engine: item.engine, cited: false, lastSeen: '-' }])
    setAeoPending(prev => prev.filter((_, i) => i !== idx))
    showToast('✓ 질문이 승인되어 활성 목록에 추가됐습니다.', 'success')
  }

  function rejectAEO(idx: number) {
    setAeoPending(prev => prev.filter((_, i) => i !== idx))
    showToast('거부됐습니다.', 'info')
  }

  // ── Meta edit ─────────────────────────────────────────────────────────────
  function openMetaEdit(idx: number) {
    const m = metaEntries[idx]
    setMetaEditModal({ idx })
    setMetaEditTitle(m.title)
    setMetaEditDesc(m.desc)
  }

  function submitMetaEdit() {
    if (!metaEditTitle.trim()) { showToast('Title 태그를 입력해주세요.', 'error'); return }
    if (metaEditModal === null) return
    const idx = metaEditModal.idx
    const updated = [...metaEntries]
    updated[idx] = {
      ...updated[idx],
      title: metaEditTitle.trim(),
      desc: metaEditDesc.trim(),
      status: metaEditTitle.trim().length <= 60 && metaEditDesc.trim().length <= 160 ? 'ok' : 'warn',
    }
    setMetaEntries(updated)
    setMetaEditModal(null)
    showToast('✓ 메타태그가 저장되었습니다.', 'success')
  }

  function approveMeta(idx: number) {
    const p = metaPending[idx]
    if (!p) return
    const updated = [...metaEntries]
    updated[idx] = {
      ...updated[idx],
      title: p.title,
      desc: p.desc,
      status: p.title.length <= 60 && p.desc.length <= 160 ? 'ok' : 'warn',
    }
    setMetaEntries(updated)
    const newPending = { ...metaPending }
    delete newPending[idx]
    setMetaPending(newPending)
    showToast('✓ 메타태그가 적용됐습니다.', 'success')
  }

  function rejectMeta(idx: number) {
    const newPending = { ...metaPending }
    delete newPending[idx]
    setMetaPending(newPending)
    showToast('제안이 거부됐습니다.', 'info')
  }

  // ── Meta AI suggest ───────────────────────────────────────────────────────
  function generateMetaSuggestions() {
    setMetaLoading(true)
    showToast('🤖 AI가 메타태그를 분석 중...', 'info')
    setTimeout(() => {
      const suggestions: Record<number, MetaPending> = {
        0: { title: 'オルレ美容外科 | 韓国No.1日本語対応美容クリニック', desc: '日本語スタッフ常駐の韓国美容外科。二重・鼻整形・脂肪吸引など全施術対応。無料カウンセリング予約受付中！' },
        2: { title: '韓国鼻整形ならオルレ美容外科 | ソウル江南', desc: '鼻整形専門医による自然な仕上がり。隆鼻・鼻尖縮小・ワシ鼻修正。日本語カウンセリング完全無料対応。' },
        4: { title: 'オルレ美容外科について | 韓国美容整形15年の実績', desc: '2010年設立・累計15,000件以上の施術実績。江南区アクセス便利。日本語対応スタッフが丁寧にサポートします。' },
      }
      setMetaPending(prev => ({ ...prev, ...suggestions }))
      showToast(`✓ ${Object.keys(suggestions).length}개 페이지 메타태그 제안이 생성됐습니다.`, 'success')
      setMetaLoading(false)
    }, 1500)
  }

  // ── Save all ──────────────────────────────────────────────────────────────
  function saveSEOSettings() {
    try {
      const now = new Date()
      const savedAt = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
      sessionStorage.setItem('seo_settings', JSON.stringify({ aeoTargets, meta: metaEntries, savedAt }))
      showToast('✓ SEO·AEO 설정이 저장되었습니다.', 'success')
    } catch {
      showToast('저장에 실패했습니다.', 'error')
    }
  }

  // ── Comprehensive report (simulate) ──────────────────────────────────────
  function requestAISEO() {
    showToast('🤖 AI가 SEO 개선 포인트를 분석 중...', 'info')
    setTimeout(() => {
      setInfoModal({
        title: '📋 종합 분석 리포트',
        body: `<strong>개선 우선순위 3가지</strong><br><br>
1. <strong>미인용 AEO 질문 최적화</strong><br>
「オルレ美容外科の鼻整形の費用」와 「脂肪吸引 日本語対応」 질문에 대한 답변 콘텐츠를 강화하세요. FAQ 페이지에 구체적인 가격 범위와 시술 과정을 추가하면 AI 검색 인용률이 높아질 수 있습니다.<br><br>
2. <strong>NOSE 페이지 메타태그 보완</strong><br>
현재 「検索 warn」 상태인 NOSE 페이지의 타이틀이 60자를 초과하고 있습니다. AI 제안된 메타태그를 검토하고 적용해보세요.<br><br>
3. <strong>Core Web Vitals 유지</strong><br>
현재 98점으로 우수한 상태를 유지하고 있습니다. 이미지 최적화와 캐싱 설정을 지속적으로 관리하여 점수를 유지하세요.`,
      })
    }, 1200)
  }

  // ── CWV items ─────────────────────────────────────────────────────────────
  const cwvItems = [
    { lbl: '로딩 속도(LCP)',    val: CORE_WEB_VITALS.lcp,  note: 'Largest Contentful Paint' },
    { lbl: '반응 속도(INP)',    val: CORE_WEB_VITALS.inp,  note: 'Interaction to Next Paint' },
    { lbl: '화면 안정성(CLS)', val: CORE_WEB_VITALS.cls,  note: 'Cumulative Layout Shift' },
    { lbl: '종합',             val: `${CORE_WEB_VITALS.score}점`, note: 'Performance Score' },
  ]

  const trendColor = { up: 'var(--green)', down: 'var(--red)', same: 'var(--s400)' }
  const trendIcon  = { up: '↑', down: '↓', same: '→' }

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/" className="topbar-back">← 대시보드</Link>
          <span className="topbar-sep">/</span>
          <span className="topbar-title">사이트 관리</span>
          <span style={{ fontSize: 12, color: 'var(--s400)' }}>/</span>
          <span style={{ fontSize: 14, color: 'var(--s600)' }}>SEO·AEO 관리</span>
        </div>
        <div className="topbar-right">
          <button className="btn" onClick={requestAISEO}>📋 종합 분석 리포트</button>
          <button className="btn btn-primary" onClick={saveSEOSettings}>💾 저장</button>
        </div>
      </div>

      <div className="content fade">
        {/* Tab bar */}
        <div className="tab-bar">
          <Link href="/site/content" className="tab">콘텐츠 편집</Link>
          <Link href="/site/assets" className="tab">이미지 관리</Link>
          <Link href="/site/seo" className="tab active">SEO·AEO</Link>
          <Link href="/site/preview" className="tab">미리보기 &amp; 게시</Link>
        </div>

        {/* Core Web Vitals */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="card-title">⚡ Core Web Vitals</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>
              종합 {CORE_WEB_VITALS.score}점 · {CORE_WEB_VITALS.grade}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {cwvItems.map(item => (
              <div key={item.lbl} style={{ background: 'var(--s50)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', marginBottom: 2 }}>{item.val}</div>
                <div style={{ fontSize: 10, color: 'var(--s400)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{item.lbl}</div>
                <div style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 8, background: '#D1FAE5', color: '#065F46', marginTop: 4, display: 'inline-block' }}>Good</div>
              </div>
            ))}
          </div>
        </div>

        {/* SEO Keywords + AEO Targets grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          {/* SEO 키워드 순위 */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 4 }}>🔍 SEO 키워드 순위</div>
            <div style={{ fontSize: 11, color: 'var(--s400)', marginBottom: 12 }}>
              Yahoo Japan 검색 결과에서 이 사이트가 몇 번째로 노출되는지를 보여줍니다. 숫자가 낮을수록 상위 노출입니다.
            </div>
            <div>
              {SEO_KEYWORDS_DATA.slice().sort((a, b) => a.rank - b.rank).map((k, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < SEO_KEYWORDS_DATA.length - 1 ? '1px solid var(--s100)' : 'none' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: k.rank <= 3 ? 'var(--teal)' : 'var(--navy)',
                    color: '#fff', fontSize: 12, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {k.rank}
                  </div>
                  <div style={{ flex: 1, fontSize: 13, color: 'var(--s800)', fontWeight: 500 }}>{k.kw}</div>
                  <div style={{ fontSize: 12, color: 'var(--s400)' }}>{k.vol}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: trendColor[k.trend] }}>{trendIcon[k.trend]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AEO 타겟 질문 */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="card-title">🧠 AEO 타겟 질문</div>
              <button
                className="btn"
                style={{ fontSize: 12, padding: '3px 9px' }}
                onClick={generateAEOSuggestions}
                disabled={aeoLoading}
              >
                {aeoLoading ? '생성 중...' : '🤖 AI 제안 받기'}
              </button>
            </div>

            {/* Active AEO targets */}
            {aeoTargets.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--s400)', padding: '12px 0' }}>등록된 질문이 없습니다.</div>
            ) : (
              aeoTargets.map((a, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 0', borderBottom: '1px solid var(--s100)', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, fontSize: 12, color: 'var(--s800)' }}>{a.q}</div>
                  <span style={{ fontSize: 10, color: 'var(--s400)', flexShrink: 0 }}>{a.engine}</span>
                  {a.cited ? (
                    <span style={{ background: '#D1FAE5', color: '#065F46', fontSize: 10, padding: '2px 7px', borderRadius: 6, fontWeight: 600 }}>인용됨 · {a.lastSeen}</span>
                  ) : (
                    <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: 10, padding: '2px 7px', borderRadius: 6, fontWeight: 600 }}>미인용</span>
                  )}
                  <button className="btn" style={{ fontSize: 10, padding: '2px 7px', flexShrink: 0 }} onClick={() => openAeoEdit(idx)}>편집</button>
                </div>
              ))
            )}

            {/* Pending AEO suggestions */}
            {aeoPending.length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--s400)', padding: '10px 0 4px', marginTop: 6, borderTop: '1px solid var(--s100)', letterSpacing: '.04em' }}>
                  🤖 AI 제안 검토 ({aeoPending.length}개)
                </div>
                {aeoPending.map((a, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', background: 'var(--blue-l)', borderRadius: 8, margin: '2px 0', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, fontSize: 12, color: 'var(--s800)' }}>{a.q}</div>
                    <span style={{ fontSize: 10, color: 'var(--s400)', flexShrink: 0 }}>{a.engine}</span>
                    <span style={{ background: 'var(--blue-b)', color: 'var(--blue)', fontSize: 10, padding: '2px 7px', borderRadius: 6, fontWeight: 600, flexShrink: 0 }}>AI 제안</span>
                    <button className="btn btn-primary" style={{ fontSize: 10, padding: '2px 8px', flexShrink: 0 }} onClick={() => approveAEO(idx)}>✓ 승인</button>
                    <button className="btn" style={{ fontSize: 10, padding: '2px 8px', flexShrink: 0, borderColor: 'var(--red)', color: 'var(--red)' }} onClick={() => rejectAEO(idx)}>✗ 거부</button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* 메타태그 편집 */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="card-title">🏷 메타태그 편집</div>
            <button
              className="btn"
              style={{ fontSize: 12, padding: '3px 9px' }}
              onClick={generateMetaSuggestions}
              disabled={metaLoading}
            >
              {metaLoading ? '생성 중...' : '🤖 AI 메타태그 제안'}
            </button>
          </div>

          {metaEntries.map((m, i) => {
            const pending = metaPending[i]
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 0', borderBottom: i < metaEntries.length - 1 ? '1px solid var(--s100)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--s400)', textTransform: 'uppercase' }}>{m.page}</span>
                  <span style={{
                    background: m.status === 'ok' ? '#D1FAE5' : '#FEF3C7',
                    color: m.status === 'ok' ? '#065F46' : '#92400E',
                    fontSize: 10, padding: '2px 7px', borderRadius: 6, fontWeight: 600,
                  }}>
                    {m.status === 'ok' ? '최적화됨' : '검토 필요'}
                  </span>
                  <button className="btn" style={{ fontSize: 10, padding: '2px 7px', marginLeft: 'auto' }} onClick={() => openMetaEdit(i)}>편집</button>
                </div>
                <div style={{ fontSize: 12, color: 'var(--navy)', fontWeight: 500 }}>{m.title}</div>
                <div style={{ fontSize: 12, color: 'var(--s500)', lineHeight: 1.5 }}>{m.desc}</div>

                {/* Pending meta suggestion */}
                {pending && (
                  <div style={{ marginTop: 8, padding: '10px 12px', background: 'var(--blue-l)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ background: 'var(--blue-b)', color: 'var(--blue)', fontSize: 10, padding: '2px 7px', borderRadius: 6, fontWeight: 600 }}>AI 제안</span>
                      <span style={{ fontSize: 10, color: 'var(--s500)' }}>현재 값과 비교 후 승인해주세요</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--blue)', marginBottom: 2 }}>TITLE</div>
                      <div style={{ fontSize: 12, color: 'var(--s700)', lineHeight: 1.5 }}>{pending.title}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--blue)', marginBottom: 2 }}>DESCRIPTION</div>
                      <div style={{ fontSize: 12, color: 'var(--s700)', lineHeight: 1.5 }}>{pending.desc}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <button className="btn btn-primary" style={{ fontSize: 10, padding: '3px 10px' }} onClick={() => approveMeta(i)}>✓ 승인</button>
                      <button className="btn" style={{ fontSize: 10, padding: '3px 10px', borderColor: 'var(--red)', color: 'var(--red)' }} onClick={() => rejectMeta(i)}>✗ 거부</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <footer style={{ padding: '20px 0', textAlign: 'center', fontSize: 12, color: 'var(--s400)', borderTop: '1px solid var(--s100)', marginTop: 20 }}>
          © 2026 MEDIFLOW. All rights reserved.
        </footer>
      </div>

      {/* ── Modal: AEO Edit ─────────────────────────────────────── */}
      {aeoEditModal !== null && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 9500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setAeoEditModal(null) }}
        >
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,.25)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--s100)' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>✏ AEO 타겟 질문 편집</div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s600)', marginBottom: 6 }}>질문 <span style={{ color: 'var(--red)' }}>*</span></div>
              <textarea
                rows={3}
                value={aeoEditQ}
                onChange={e => setAeoEditQ(e.target.value)}
                style={{ width: '100%', fontSize: 13, padding: 10, border: '1.5px solid var(--s200)', borderRadius: 8, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, outline: 'none', boxSizing: 'border-box' }}
                autoFocus
              />
            </div>
            <div style={{ padding: '16px 24px', background: 'var(--s50)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setAeoEditModal(null)}>취소</button>
              <button className="btn btn-primary" onClick={submitAeoEdit}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Meta Edit ────────────────────────────────────── */}
      {metaEditModal !== null && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 9500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setMetaEditModal(null) }}
        >
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560, boxShadow: '0 20px 60px rgba(0,0,0,.25)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--s100)' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>
                🏷 메타태그 편집 — {metaEditModal !== null ? metaEntries[metaEditModal.idx].page : ''}
              </div>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s600)', marginBottom: 6 }}>Title 태그 <span style={{ color: 'var(--red)' }}>*</span></div>
                <input
                  type="text"
                  value={metaEditTitle}
                  onChange={e => setMetaEditTitle(e.target.value)}
                  style={{ width: '100%', fontSize: 13, padding: 10, border: '1.5px solid var(--s200)', borderRadius: 8, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                  autoFocus
                />
                <div style={{ fontSize: 11, color: metaEditTitle.length > 60 ? 'var(--red)' : 'var(--s400)', marginTop: 3, textAlign: 'right' }}>
                  {metaEditTitle.length} / 60자 권장
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s600)', marginBottom: 6 }}>Description 태그</div>
                <textarea
                  rows={3}
                  value={metaEditDesc}
                  onChange={e => setMetaEditDesc(e.target.value)}
                  style={{ width: '100%', fontSize: 13, padding: 10, border: '1.5px solid var(--s200)', borderRadius: 8, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, outline: 'none', boxSizing: 'border-box' }}
                />
                <div style={{ fontSize: 11, color: metaEditDesc.length > 160 ? 'var(--red)' : 'var(--s400)', marginTop: 3, textAlign: 'right' }}>
                  {metaEditDesc.length} / 160자 권장
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 24px', background: 'var(--s50)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setMetaEditModal(null)}>취소</button>
              <button className="btn btn-primary" onClick={submitMetaEdit}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Info (AI report) ─────────────────────────────── */}
      {infoModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}
          onClick={e => { if (e.target === e.currentTarget) setInfoModal(null) }}
        >
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, maxHeight: '90vh', boxShadow: '0 20px 60px rgba(0,0,0,.2)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px 28px 16px', fontSize: 16, fontWeight: 700, color: '#0D1B3E', flexShrink: 0, borderBottom: '1px solid #F3F4F6' }}>
              {infoModal.title}
            </div>
            <div
              style={{ padding: '16px 28px', fontSize: 13, color: '#374151', lineHeight: 1.7, overflowY: 'auto', flex: 1 }}
              dangerouslySetInnerHTML={{ __html: infoModal.body }}
            />
            <div style={{ padding: '16px 28px', display: 'flex', gap: 8, justifyContent: 'flex-end', flexShrink: 0, borderTop: '1px solid #F3F4F6' }}>
              <button className="btn btn-primary" onClick={() => setInfoModal(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'success' ? '#059669' : toast.type === 'error' ? '#DC2626' : '#0D1B3E',
          color: '#fff', padding: '11px 22px', borderRadius: 10, fontSize: 13, fontWeight: 500,
          boxShadow: '0 4px 20px rgba(0,0,0,.2)', zIndex: 9999, whiteSpace: 'nowrap',
        }}>
          {toast.msg}
        </div>
      )}
    </>
  )
}
