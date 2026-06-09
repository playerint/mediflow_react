'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ── Mock Data ────────────────────────────────────────────────────

interface Scenario {
  name:    string
  nameKo:  string
  kw:      string
  kwKo?:   string
  msg:     string
  msgKo:   string
}

interface Trigger {
  text:  string
  color: string
}

interface HrsRow {
  day:   string
  range: string
  on:    boolean
}

const INIT_SCENARIOS: Scenario[] = [
  {
    name: '料金・費用', nameKo: '가격·비용',
    kw: '料金,価格,いくら,費用', kwKo: '가격,요금,얼마',
    msg: 'ご相談の施術料金をご案内いたします。二重埋没法₩400,000〜、鼻プロテーゼ₩900,000〜です。詳細はカウンセリングでご確認ください。',
    msgKo: '시술 요금을 안내해 드립니다. 쌍꺼풀 매몰법 ₩400,000~, 코 보형물 ₩900,000~입니다. 자세한 사항은 상담에서 확인해 주세요.',
  },
  {
    name: 'ダウンタイム', nameKo: '다운타임',
    kw: 'ダウンタイム,腫れ,痛み,回復', kwKo: '다운타임,부기,통증,회복',
    msg: '施術によって異なりますが、埋没法は1〜3日、切開法は1〜2週間程度です。翌日からお仕事可能なケースも多いです。',
    msgKo: '시술에 따라 다르지만, 매몰법은 1~3일, 절개법은 1~2주 정도입니다. 다음 날부터 일이 가능한 경우도 많습니다.',
  },
  {
    name: '日本語対応', nameKo: '일본어 대응',
    kw: '日本語,通訳,言葉', kwKo: '일본어,통역,언어',
    msg: '当院には日本語専属スタッフが常駐しております。カウンセリングから術後ケアまで日本語でサポートいたします。',
    msgKo: '저희 병원에는 일본어 전담 스탭이 상주하고 있습니다. 상담부터 수술 후 케어까지 일본어로 지원합니다.',
  },
]

const INIT_TRIGGERS: Trigger[] = [
  { text: '「訴訟」「弁護士」키워드 감지', color: '#DC2626' },
  { text: '3회 이상 반복 질문 미해결',     color: '#D97706' },
  { text: '수술 합병증 키워드 감지',        color: '#DC2626' },
  { text: '예약 확정 요청',               color: '#059669' },
]

const INIT_HRS: HrsRow[] = [
  { day: '월', range: '09-18', on: true },
  { day: '화', range: '09-18', on: true },
  { day: '수', range: '09-18', on: true },
  { day: '목', range: '09-18', on: true },
  { day: '금', range: '09-18', on: true },
  { day: '토', range: '09-13', on: true },
  { day: '일', range: '휴무',  on: false },
]

const CHART_DATA = {
  labels:  ['1','3','5','7','9','11','13','15','17','19'],
  ai:      [8,10,7,12,9,11,8,13,10,14],
  escalate:[1,0,1,1,0,1,0,1,1,1],
}

// ── Types ────────────────────────────────────────────────────────

interface ModalState {
  title:        string
  body:         React.ReactNode
  confirmLabel: string
  confirmClass: string
  onConfirm:    () => void
}

interface QuickBtn { ja: string; ko: string }

// ── Component ────────────────────────────────────────────────────

export default function LinePage() {
  // global state
  const [toast, setToast]     = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [modal, setModal]     = useState<ModalState | null>(null)
  const [autoOn, setAutoOn]   = useState(true)

  // data state
  const [scenarios,   setScenarios]   = useState<Scenario[]>(INIT_SCENARIOS)
  const [triggers,    setTriggers]    = useState<Trigger[]>(INIT_TRIGGERS)
  const [hrs,         setHrs]         = useState<HrsRow[]>(INIT_HRS)
  const [welcomeMsg,  setWelcomeMsg]  = useState('はじめまして！オーレ整形外科です。\nご相談内容をお選びください。')
  const [welcomeMsgKo,setWelcomeMsgKo]= useState('안녕하세요! 올래성형외과입니다.\n상담 내용을 선택해 주세요.')
  const [quickBtns,   setQuickBtns]   = useState<string[]>(['二重・目元','鼻','料金確認'])
  const [quickBtnsKo, setQuickBtnsKo] = useState<string[]>(['쌍꺼풀·눈 성형','코 성형','가격 확인'])

  // UI state
  const [langMode,    setLangMode]    = useState<'ja' | 'ko'>('ja')
  const [welcomeLang, setWelcomeLang] = useState<'ja' | 'ko'>('ja')

  // chart canvas ref
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<unknown>(null)

  function showToast(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  function closeModal() { setModal(null) }

  // ── Chart ────────────────────────────────────────────────────────
  useEffect(() => {
    const el = chartRef.current
    if (!el) return
    const win = window as unknown as Record<string, unknown>
    const Chart = win['Chart'] as (new (el: HTMLCanvasElement, cfg: unknown) => { destroy: () => void }) | undefined
    if (!Chart) return

    if (chartInstance.current) {
      (chartInstance.current as { destroy: () => void }).destroy()
    }
    chartInstance.current = new Chart(el, {
      type: 'bar',
      data: {
        labels: CHART_DATA.labels,
        datasets: [
          { label: 'AI 처리', data: CHART_DATA.ai,      backgroundColor: '#0D9488', borderRadius: 2, stack: 'a' },
          { label: '인계',    data: CHART_DATA.escalate, backgroundColor: '#F59E0B', borderRadius: 2, stack: 'a' },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { font: { size: 9 }, color: '#9CA3AF' } },
          y: { stacked: true, display: false, beginAtZero: true },
        },
      },
    })
    return () => {
      if (chartInstance.current) {
        (chartInstance.current as { destroy: () => void }).destroy()
        chartInstance.current = null
      }
    }
  }, [])

  // ── Welcome preview ──────────────────────────────────────────────
  function renderWelcomePreviewHtml() {
    const msg  = welcomeLang === 'ko' ? welcomeMsgKo : welcomeMsg
    const btns = welcomeLang === 'ko' ? quickBtnsKo  : quickBtns
    const lines = msg.replace(/\n/g, '<br>')
    const btnHtml = btns.map(b =>
      `<span style="display:inline-block;background:#fff;border:1px solid #E5E7EB;border-radius:6px;padding:2px 8px;font-size:12px;margin:2px">${b}</span>`
    ).join('')
    return lines + '<br><br>' + btnHtml
  }

  // ── Test send modal ──────────────────────────────────────────────
  function openTestSend() {
    const previewMsg = (welcomeLang === 'ko' ? welcomeMsgKo : welcomeMsg).replace(/\n/g, '<br>')
    const btns = welcomeLang === 'ko' ? quickBtnsKo : quickBtns
    const btnHtml = btns.map(b =>
      `<span style="display:inline-block;background:#fff;border:1px solid #E5E7EB;border-radius:6px;padding:2px 8px;font-size:12px;margin:2px">${b}</span>`
    ).join('')

    setModal({
      title: '📤 테스트 발송 미리보기',
      body: (
        <div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>수신 담당자</label>
            <select id="test-staff" style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>
              <option>김지현 (관리자)</option>
              <option>이수진 (스탭)</option>
            </select>
          </div>
          <div style={{ marginBottom: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>발송 내용 미리보기</label>
            <div
              style={{ background: '#F0FDFA', border: '1px solid #5EEAD4', borderRadius: 10, padding: '12px 14px', fontSize: 12, color: '#374151', lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: previewMsg + '<br><br>' + btnHtml }}
            />
          </div>
          <div style={{ marginTop: 12, padding: '10px 12px', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 8, fontSize: 12, color: '#92400E', lineHeight: 1.6 }}>
            ⚠ 실제 LINE 발송은 설정 → LINE 연동에서 Channel ID / Secret 연결 후 가능합니다.
          </div>
        </div>
      ),
      confirmLabel: '발송 요청',
      confirmClass: 'btn-primary',
      onConfirm: () => {
        const el = document.getElementById('test-staff') as HTMLSelectElement | null
        const name = el ? el.value : '담당자'
        showToast(`✓ ${name}에게 테스트 발송 요청이 전달되었습니다.`, 'success')
      },
    })
  }

  // ── Welcome msg edit modal ───────────────────────────────────────
  function openEditWelcome() {
    const jaBtns = [...quickBtns]
    const koBtns = [...quickBtnsKo]

    setModal({
      title: '✏ 웰컴 메시지 & 버튼 편집',
      body: <WelcomeMsgForm
        initJaMsg={welcomeMsg}
        initKoMsg={welcomeMsgKo}
        initJaBtns={jaBtns}
        initKoBtns={koBtns}
      />,
      confirmLabel: '저장',
      confirmClass: 'btn-primary',
      onConfirm: () => {
        const jaEl = document.getElementById('wm-ja') as HTMLTextAreaElement | null
        const koEl = document.getElementById('wm-ko') as HTMLTextAreaElement | null
        if (jaEl) setWelcomeMsg(jaEl.value)
        if (koEl) setWelcomeMsgKo(koEl.value)
        const newJa: string[] = []
        const newKo: string[] = []
        for (let i = 0; i < 10; i++) {
          const ja = document.getElementById(`qbtn-ja-${i}`) as HTMLInputElement | null
          const ko = document.getElementById(`qbtn-ko-${i}`) as HTMLInputElement | null
          if (ja && ja.value.trim()) newJa.push(ja.value.trim())
          if (ko && ko.value.trim()) newKo.push(ko.value.trim())
        }
        setQuickBtns(newJa)
        setQuickBtnsKo(newKo)
        showToast('✓ 웰컴 메시지가 저장되었습니다.', 'success')
      },
    })
  }

  // ── Add scenario ─────────────────────────────────────────────────
  function openAddScenario() {
    setModal({
      title: '➕ L2 시나리오 추가',
      body: <ScenarioForm mode="add" />,
      confirmLabel: '추가',
      confirmClass: 'btn-primary',
      onConfirm: () => {
        const nameEl  = document.getElementById('sc-add-name')  as HTMLInputElement | null
        const kwJaEl  = document.getElementById('sc-add-kw-ja') as HTMLInputElement | null
        const kwKoEl  = document.getElementById('sc-add-kw-ko') as HTMLInputElement | null
        const jaEl    = document.getElementById('sc-add-ja')    as HTMLTextAreaElement | null
        const koEl    = document.getElementById('sc-add-ko')    as HTMLTextAreaElement | null
        if (!nameEl?.value.trim())  { showToast('시나리오 이름을 입력해주세요.', 'error'); return }
        if (!kwJaEl?.value.trim())  { showToast('일본어 키워드를 입력해주세요.', 'error'); return }
        if (!jaEl?.value.trim())    { showToast('일본어 메시지를 입력해주세요.', 'error'); return }
        const kwVal = kwJaEl.value.trim() + (kwKoEl?.value.trim() ? ',' + kwKoEl.value.trim() : '')
        setScenarios(prev => [...prev, {
          name:   nameEl.value.trim(),
          nameKo: nameEl.value.trim(),
          kw:     kwVal,
          kwKo:   kwKoEl?.value.trim() || '',
          msg:    jaEl.value.trim(),
          msgKo:  koEl?.value.trim() || '',
        }])
        showToast('✓ 시나리오가 추가되었습니다.', 'success')
      },
    })
  }

  // ── Edit scenario ────────────────────────────────────────────────
  function openEditScenario(idx: number) {
    const s = scenarios[idx]
    if (!s) return
    setModal({
      title: `✏ 시나리오 편집 — ${s.name}`,
      body: <ScenarioForm mode="edit" scenario={s} />,
      confirmLabel: '저장',
      confirmClass: 'btn-primary',
      onConfirm: () => {
        const nameEl  = document.getElementById('sc-edit-name')  as HTMLInputElement | null
        const kwJaEl  = document.getElementById('sc-edit-kw-ja') as HTMLInputElement | null
        const kwKoEl  = document.getElementById('sc-edit-kw-ko') as HTMLInputElement | null
        const jaEl    = document.getElementById('sc-edit-ja')    as HTMLTextAreaElement | null
        const koEl    = document.getElementById('sc-edit-ko')    as HTMLTextAreaElement | null
        const kwVal = (kwJaEl?.value.trim() || '') + (kwKoEl?.value.trim() ? ',' + kwKoEl.value.trim() : '')
        setScenarios(prev => prev.map((sc, i) => i !== idx ? sc : {
          ...sc,
          name:  nameEl?.value || sc.name,
          kw:    kwVal || sc.kw,
          kwKo:  kwKoEl?.value.trim() || sc.kwKo,
          msg:   jaEl?.value || sc.msg,
          msgKo: koEl?.value || sc.msgKo,
        }))
        showToast('✓ 시나리오가 저장되었습니다.', 'success')
      },
    })
  }

  // ── Delete scenario ──────────────────────────────────────────────
  function openDeleteScenario(idx: number) {
    const s = scenarios[idx]
    if (!s) return
    setModal({
      title: '🗑 시나리오 삭제',
      body: (
        <div dangerouslySetInnerHTML={{ __html: `"<strong>${s.name}</strong>" 시나리오를 삭제하시겠습니까?<br><span style="font-size:12px;color:#9CA3AF">삭제 후 복구할 수 없습니다.</span>` }} />
      ),
      confirmLabel: '삭제',
      confirmClass: 'btn-danger',
      onConfirm: () => {
        setScenarios(prev => prev.filter((_, i) => i !== idx))
        showToast('✓ 시나리오가 삭제되었습니다.', 'info')
      },
    })
  }

  // ── Add trigger ──────────────────────────────────────────────────
  function openAddTrigger() {
    setModal({
      title: '➕ L3 트리거 추가',
      body: <TriggerForm />,
      confirmLabel: '추가',
      confirmClass: 'btn-primary',
      onConfirm: () => {
        const kwJa   = document.getElementById('tr-kw-ja')  as HTMLInputElement | null
        const kwKo   = document.getElementById('tr-kw-ko')  as HTMLInputElement | null
        const color  = document.getElementById('tr-color')  as HTMLSelectElement | null
        if (!kwJa?.value.trim()) { showToast('일본어 키워드를 입력해주세요.', 'error'); return }
        const disp = kwKo?.value.trim()
          ? `${kwJa.value.trim()} (${kwKo.value.trim()})`
          : kwJa.value.trim()
        setTriggers(prev => [...prev, { text: disp, color: color?.value || '#DC2626' }])
        showToast('✓ 트리거가 추가되었습니다.', 'success')
      },
    })
  }

  // ── Delete trigger ───────────────────────────────────────────────
  function openDeleteTrigger(idx: number) {
    const t = triggers[idx]
    if (!t) return
    setModal({
      title: '🗑 트리거 삭제',
      body: (
        <div dangerouslySetInnerHTML={{ __html: `"<strong>${t.text}</strong>"<br>트리거를 삭제하시겠습니까?<br><span style="font-size:12px;color:#9CA3AF">삭제 후 복구할 수 없습니다.</span>` }} />
      ),
      confirmLabel: '삭제',
      confirmClass: 'btn-danger',
      onConfirm: () => {
        setTriggers(prev => prev.filter((_, i) => i !== idx))
        showToast('✓ 트리거가 삭제되었습니다.', 'info')
      },
    })
  }

  // ── Toggle hrs ───────────────────────────────────────────────────
  function toggleHr(idx: number) {
    setHrs(prev => prev.map((h, i) => i === idx ? { ...h, on: !h.on } : h))
  }

  // ── Render ───────────────────────────────────────────────────────
  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/" className="topbar-back">← 대시보드</Link>
          <span className="topbar-sep">/</span>
          <span className="topbar-title">LINE 자동상담 설정</span>
        </div>
        <div className="topbar-right">
          <span style={{ fontSize: 12, color: 'var(--s400)' }}>모델: claude-sonnet-4</span>
          <button className="btn btn-primary" onClick={openTestSend}>📤 테스트 발송</button>
        </div>
      </div>

      <div className="content fade">

        {/* AI Agent banner */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16, background: 'var(--navy-l)',
          border: '1px solid #DBEAFE', borderRadius: 'var(--rl)', padding: '14px 20px',
        }}>
          {/* Left: Agent identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'linear-gradient(135deg,#0D1B3E,#162952)',
              color: '#fff', fontSize: 22, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 12px rgba(13,27,62,.3)', flexShrink: 0,
            }}>
              は
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>하나 (はな)</div>
              <div style={{ fontSize: 12, color: 'var(--navy-h)', marginTop: 2 }}>AI はな · LINE 자동상담</div>
              <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 2 }}>24/7 자동 응답 · LINE Official Account 연결됨</div>
            </div>
          </div>

          {/* Right: toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--s500)' }}>{autoOn ? '자동상담 ON' : '자동상담 OFF'}</span>
            <ToggleSwitch checked={autoOn} onChange={v => setAutoOn(v)} />
          </div>
        </div>

        {/* KPI grid */}
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,minmax(0,1fr))' }}>
          {[
            { label: 'AI 자동 해결률',  value: '94%',  delta: '↑ +3%p',       up: true },
            { label: '평균 첫 응답',    value: '8초',  delta: '↓ 2시간 단축',  up: true },
            { label: '예약 전환율',     value: '41%',  delta: '↑ +7%p',       up: true },
            { label: '이번 달 처리',    value: '142건', delta: '인계 9건',     up: false, neutral: true },
          ].map(k => (
            <div key={k.label} style={{ background: '#fff', border: '1px solid var(--s200)', borderRadius: 'var(--r)', padding: '12px 14px' }}>
              <div style={{ fontSize: 12, color: 'var(--s400)', marginBottom: 4 }}>{k.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy)' }}>{k.value}</div>
              <div style={{ fontSize: 12, color: k.neutral ? 'var(--s500)' : k.up ? '#16A34A' : '#DC2626' }}>
                {k.delta}
              </div>
            </div>
          ))}
        </div>

        {/* Daily chart */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="card-head">
            <div className="card-title">📈 일별 처리 현황</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: '#0D9488' }} />
                <span style={{ fontSize: 11, color: 'var(--s500)' }}>AI 처리</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: '#F59E0B' }} />
                <span style={{ fontSize: 11, color: 'var(--s500)' }}>인계</span>
              </div>
            </div>
          </div>
          <div style={{ position: 'relative', width: '100%', height: 140 }}>
            <canvas ref={chartRef} role="img" aria-label="일별 자동상담 처리 건수" />
          </div>
        </div>

        {/* L1 / L2 / L3 grid */}
        <div className="grid3">

          {/* L1 — 즉시 자동응답 */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <span style={{ background: 'var(--navy-l)', color: 'var(--navy)', padding: '1px 7px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>L1</span>
                즉시 자동응답
              </div>
              <ToggleSwitch checked={true} onChange={() => {}} size="sm" />
            </div>
            <div style={{ fontSize: 12, color: 'var(--s500)', marginBottom: 10 }}>첫 메시지 수신 즉시 0초 응답</div>

            {/* Welcome preview */}
            <div style={{ position: 'relative' }}>
              {/* Lang toggle */}
              <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', borderRadius: 6, overflow: 'hidden', border: '1px solid var(--s200)', zIndex: 1 }}>
                <button
                  onClick={() => setWelcomeLang('ja')}
                  style={{ padding: '2px 8px', fontSize: 10, fontFamily: 'inherit', cursor: 'pointer', border: 'none', background: welcomeLang === 'ja' ? 'var(--navy)' : '#fff', color: welcomeLang === 'ja' ? '#fff' : 'var(--s500)', fontWeight: 500, transition: 'all .15s' }}
                >日</button>
                <button
                  onClick={() => setWelcomeLang('ko')}
                  style={{ padding: '2px 8px', fontSize: 10, fontFamily: 'inherit', cursor: 'pointer', border: 'none', background: welcomeLang === 'ko' ? 'var(--teal)' : '#fff', color: welcomeLang === 'ko' ? '#fff' : 'var(--s500)', fontWeight: 500, transition: 'all .15s' }}
                >한</button>
              </div>
              <div
                style={{ background: 'var(--s50)', borderRadius: 'var(--r)', padding: '10px', paddingRight: 70, fontSize: 12, color: 'var(--s700)', lineHeight: 1.65, marginBottom: 10, minHeight: 60 }}
                dangerouslySetInnerHTML={{ __html: renderWelcomePreviewHtml() }}
              />
            </div>
            <button className="btn" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }} onClick={openEditWelcome}>
              ✏ 메시지 편집
            </button>
          </div>

          {/* L2 — AI 상담 */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <span style={{ background: 'var(--blue-l)', color: 'var(--blue)', padding: '1px 7px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>L2</span>
                AI 상담
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {/* Lang toggle */}
                <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--s200)' }}>
                  <button
                    onClick={() => setLangMode('ja')}
                    style={{ padding: '4px 10px', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', border: 'none', background: langMode === 'ja' ? 'var(--navy)' : '#fff', color: langMode === 'ja' ? '#fff' : 'var(--s500)', fontWeight: 500, transition: 'all .15s' }}
                  >日</button>
                  <button
                    onClick={() => setLangMode('ko')}
                    style={{ padding: '4px 10px', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', border: 'none', background: langMode === 'ko' ? 'var(--teal)' : '#fff', color: langMode === 'ko' ? '#fff' : 'var(--s500)', fontWeight: 500, transition: 'all .15s' }}
                  >한</button>
                </div>
                <button className="btn btn-sm" onClick={openAddScenario}>+ 추가</button>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--s500)', marginBottom: 10 }}>키워드 분류 → AI はな 자동 답변</div>

            {/* Scenario list */}
            <div>
              {scenarios.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', background: 'var(--s50)', borderRadius: 'var(--r)', marginBottom: 6, border: '1px solid var(--s100)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 2 }}>
                      {langMode === 'ko' ? s.nameKo : s.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--s400)', marginBottom: 4 }}>키워드: {s.kw}</div>
                    <div style={{ fontSize: 12, color: 'var(--s700)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {langMode === 'ko' ? s.msgKo : s.msg}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                    <button className="btn btn-sm" onClick={() => openEditScenario(i)}>✏</button>
                    <button className="btn btn-sm" style={{ color: 'var(--red)', borderColor: '#FCA5A5' }} onClick={() => openDeleteScenario(i)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* L3 — 인계 판단 */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <span style={{ background: 'var(--s100)', color: 'var(--s700)', padding: '1px 7px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>L3</span>
                인계 판단
              </div>
              <button className="btn btn-sm" onClick={openAddTrigger}>+ 추가</button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--s500)', marginBottom: 10 }}>트리거 감지 → 담당자 자동 알림</div>

            {/* Trigger list */}
            <div>
              {triggers.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--s50)', borderRadius: 'var(--r)', marginBottom: 6, border: '1px solid var(--s100)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--s700)', flex: 1 }}>{t.text}</span>
                  <button className="btn btn-sm" style={{ color: 'var(--red)', borderColor: '#FCA5A5', flexShrink: 0 }} onClick={() => openDeleteTrigger(i)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Business hours */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">🕐 업무시간 설정</div>
            <span style={{ fontSize: 12, color: 'var(--s400)' }}>업무시간 외 → AI 단독 대응</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {hrs.map((h, i) => (
              <div
                key={h.day}
                onClick={() => toggleHr(i)}
                style={{
                  width: 70, textAlign: 'center', padding: '10px 8px',
                  borderRadius: 'var(--r)', cursor: 'pointer',
                  border: `1px solid ${h.on ? 'var(--blue)' : 'var(--s200)'}`,
                  background: h.on ? 'var(--blue-l)' : 'var(--s50)',
                  transition: 'all .15s',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: h.on ? 'var(--blue)' : 'var(--s400)', marginBottom: 4 }}>{h.day}</div>
                <div style={{ fontSize: 11, color: h.on ? 'var(--blue)' : 'var(--s400)' }}>{h.range}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="site-footer">© 2026 MEDIFLOW. All rights reserved.</footer>
      </div>

      {/* Modal */}
      {modal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0D1B3E', marginBottom: 14 }}>{modal.title}</div>
            <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, marginBottom: 20 }}>{modal.body}</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={closeModal}>취소</button>
              <button
                className={`btn ${modal.confirmClass}`}
                style={modal.confirmClass === 'btn-danger' ? { background: '#DC2626', borderColor: '#DC2626', color: '#fff' } : {}}
                onClick={() => { closeModal(); modal.onConfirm() }}
              >
                {modal.confirmLabel}
              </button>
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

      {/* Chart.js CDN */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js" />
    </>
  )
}

// ── Sub-components ───────────────────────────────────────────────

function ToggleSwitch({ checked, onChange, size = 'md' }: { checked: boolean; onChange: (v: boolean) => void; size?: 'md' | 'sm' }) {
  const w  = size === 'sm' ? 32 : 40
  const h  = size === 'sm' ? 18 : 22
  const tb = size === 'sm' ? 12 : 16

  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: w, height: h, borderRadius: h / 2, position: 'relative', cursor: 'pointer',
        background: checked ? '#0D9488' : '#D1D5DB', transition: 'background .2s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: (h - tb) / 2,
        left: checked ? w - tb - (h - tb) / 2 : (h - tb) / 2,
        width: tb, height: tb, borderRadius: '50%',
        background: '#fff', transition: 'left .2s',
        boxShadow: '0 1px 3px rgba(0,0,0,.2)',
      }} />
    </div>
  )
}

function LangToggle({ id, initLang }: { id: string; initLang?: 'ja' | 'ko' }) {
  const [lang, setLang] = useState<'ja' | 'ko'>(initLang || 'ja')

  function switchLang(mode: 'ja' | 'ko') {
    setLang(mode)
    const modal = document.getElementById('__modal-inner')
    if (!modal) return
    modal.querySelectorAll<HTMLElement>('.mf-ja').forEach(el => { el.style.display = mode === 'ja' ? '' : 'none' })
    modal.querySelectorAll<HTMLElement>('.mf-ko').forEach(el => { el.style.display = mode === 'ko' ? '' : 'none' })
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
      <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
        <button
          id={`${id}-ja`}
          type="button"
          onClick={() => switchLang('ja')}
          style={{ padding: '4px 12px', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', border: 'none', background: lang === 'ja' ? '#1A2642' : '#fff', color: lang === 'ja' ? '#fff' : '#6B7280', fontWeight: 500, transition: 'all .15s' }}
        >日</button>
        <button
          id={`${id}-ko`}
          type="button"
          onClick={() => switchLang('ko')}
          style={{ padding: '4px 12px', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', border: 'none', background: lang === 'ko' ? '#0D9488' : '#fff', color: lang === 'ko' ? '#fff' : '#6B7280', fontWeight: 500, transition: 'all .15s' }}
        >한</button>
      </div>
    </div>
  )
}

// ── Welcome message form ──────────────────────────────────────────

function WelcomeMsgForm({ initJaMsg, initKoMsg, initJaBtns, initKoBtns }: {
  initJaMsg:  string
  initKoMsg:  string
  initJaBtns: string[]
  initKoBtns: string[]
}) {
  const [lang, setLang]     = useState<'ja' | 'ko'>('ja')
  const [jaBtns, setJaBtns] = useState<QuickBtn[]>(initJaBtns.map((s, i) => ({ ja: s, ko: initKoBtns[i] || '' })))

  function addBtn() {
    if (jaBtns.length >= 5) return
    setJaBtns(prev => [...prev, { ja: '', ko: '' }])
  }
  function removeBtn(i: number) { setJaBtns(prev => prev.filter((_, j) => j !== i)) }
  function updateBtn(i: number, field: 'ja' | 'ko', val: string) {
    setJaBtns(prev => prev.map((b, j) => j === i ? { ...b, [field]: val } : b))
  }

  const INP: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }
  const LBL: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }

  return (
    <div id="__modal-inner">
      <LangToggle id="modal-welcome" />
      {/* JA section */}
      <div className="mf-ja">
        <div style={{ marginBottom: 12 }}>
          <label style={LBL}>🇯🇵 웰컴 메시지</label>
          <textarea id="wm-ja" rows={3} defaultValue={initJaMsg} style={{ ...INP, resize: 'vertical', lineHeight: 1.6 }} />
        </div>
        <label style={LBL}>🇯🇵 빠른 답장 버튼 <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 400 }}>(최대 5개)</span></label>
        {jaBtns.map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <input id={`qbtn-ja-${i}`} type="text" defaultValue={b.ja} onChange={e => updateBtn(i, 'ja', e.target.value)} style={{ flex: 1, padding: '7px 10px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
            <button type="button" onClick={() => removeBtn(i)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #FCA5A5', background: '#FEE2E2', color: '#DC2626', cursor: 'pointer', fontSize: 13, flexShrink: 0 }}>✕</button>
          </div>
        ))}
        <button type="button" onClick={addBtn} style={{ width: '100%', padding: 7, borderRadius: 8, border: '1.5px dashed #E5E7EB', background: '#fff', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', color: '#6B7280', marginTop: 4 }}>+ 버튼 추가</button>
      </div>
      {/* KO section */}
      <div className="mf-ko" style={{ display: 'none' }}>
        <div style={{ marginBottom: 12 }}>
          <label style={LBL}>🇰🇷 웰컴 메시지 (참고용)</label>
          <textarea id="wm-ko" rows={3} defaultValue={initKoMsg} style={{ ...INP, resize: 'vertical', lineHeight: 1.6 }} />
        </div>
        <label style={LBL}>🇰🇷 빠른 답장 버튼 (참고용)</label>
        {jaBtns.map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <input id={`qbtn-ko-${i}`} type="text" defaultValue={b.ko} onChange={e => updateBtn(i, 'ko', e.target.value)} style={{ flex: 1, padding: '7px 10px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
            <button type="button" onClick={() => removeBtn(i)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #FCA5A5', background: '#FEE2E2', color: '#DC2626', cursor: 'pointer', fontSize: 13, flexShrink: 0 }}>✕</button>
          </div>
        ))}
        <button type="button" onClick={addBtn} style={{ width: '100%', padding: 7, borderRadius: 8, border: '1.5px dashed #E5E7EB', background: '#fff', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', color: '#6B7280', marginTop: 4 }}>+ 버튼 추가</button>
      </div>
      <div style={{ marginTop: 10, padding: '10px 12px', background: '#F0FDFA', borderRadius: 8, fontSize: 12, color: '#0F766E', lineHeight: 1.7 }}>
        🌸 환자에게는 🇯🇵 일본어로 발송됩니다. 🇰🇷 한국어는 상담사 참고용입니다.
      </div>
    </div>
  )
}

// ── Scenario form ─────────────────────────────────────────────────

function ScenarioForm({ mode, scenario }: { mode: 'add' | 'edit'; scenario?: Scenario }) {
  const INP: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }
  const LBL: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }
  const idPrefix = mode === 'add' ? 'sc-add' : 'sc-edit'

  return (
    <div id="__modal-inner">
      <LangToggle id={`modal-sc-${mode}`} />
      <div style={{ marginBottom: 12 }}>
        <label style={LBL}>시나리오 이름</label>
        <input type="text" id={`${idPrefix}-name`} defaultValue={scenario?.name || ''} placeholder="예) 가격 문의" style={INP} />
      </div>
      <div className="mf-ja" style={{ marginBottom: 12 }}>
        <label style={LBL}>🇯🇵 키워드 <span style={{ fontSize: 10, color: '#9CA3AF' }}>(쉼표로 구분, 일본어)</span></label>
        <input type="text" id={`${idPrefix}-kw-ja`} defaultValue={scenario?.kw || ''} placeholder="料金,価格,いくら" style={INP} />
      </div>
      <div className="mf-ko" style={{ display: 'none', marginBottom: 12 }}>
        <label style={LBL}>🇰🇷 키워드 <span style={{ fontSize: 10, color: '#9CA3AF' }}>(쉼표로 구분, 한국어)</span></label>
        <input type="text" id={`${idPrefix}-kw-ko`} defaultValue={scenario?.kwKo || ''} placeholder="가격,요금,얼마" style={INP} />
      </div>
      <div className="mf-ja">
        <label style={LBL}>🇯🇵 자동 응답 메시지 (환자 발송용)</label>
        <textarea id={`${idPrefix}-ja`} rows={4} defaultValue={scenario?.msg || ''} placeholder="일본어로 입력" style={{ ...INP, resize: 'vertical', lineHeight: 1.6 }} />
      </div>
      <div className="mf-ko" style={{ display: 'none' }}>
        <label style={LBL}>🇰🇷 한국어 번역 (상담사 참고용)</label>
        <textarea id={`${idPrefix}-ko`} rows={4} defaultValue={scenario?.msgKo || ''} placeholder="한국어 번역 입력" style={{ ...INP, resize: 'vertical', lineHeight: 1.6 }} />
      </div>
      <div style={{ marginTop: 10, padding: '8px 12px', background: '#F0FDFA', borderRadius: 8, fontSize: 12, color: '#0F766E' }}>
        🌸 환자에게는 🇯🇵 일본어로 발송됩니다.
      </div>
    </div>
  )
}

// ── Trigger form ──────────────────────────────────────────────────

function TriggerForm() {
  const INP: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }
  const LBL: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }

  return (
    <div id="__modal-inner">
      <LangToggle id="modal-tr-add" />
      <div className="mf-ja" style={{ marginBottom: 12 }}>
        <label style={LBL}>🇯🇵 트리거 키워드 (실제 감지용)</label>
        <input type="text" id="tr-kw-ja" placeholder="例) 訴訟,弁護士,クレーム" style={INP} />
      </div>
      <div className="mf-ko" style={{ display: 'none', marginBottom: 12 }}>
        <label style={LBL}>🇰🇷 트리거 키워드 (참고용)</label>
        <input type="text" id="tr-kw-ko" placeholder="예) 소송, 변호사, 컴플레인" style={INP} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={LBL}>우선순위</label>
        <select id="tr-color" style={INP}>
          <option value="#DC2626">🔴 긴급 (즉시 인계)</option>
          <option value="#D97706">🟡 주의 (확인 후 인계)</option>
          <option value="#059669">🟢 일반 (여유 인계)</option>
        </select>
      </div>
      <div>
        <label style={LBL}>인계 담당자</label>
        <select id="tr-staff" style={INP}>
          <option>김지현 (관리자)</option>
          <option>이수진 (스탭)</option>
        </select>
      </div>
    </div>
  )
}
