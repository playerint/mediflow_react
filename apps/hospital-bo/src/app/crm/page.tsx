'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  CRM_INQUIRIES, STATUS_LABEL, STATUS_BADGE,
  type CrmInquiry, type InquiryStatus,
} from '@/lib/mock-data'

// ─── 추가 타입 ──────────────────────────────────────────────────────────────
type CrmStatus = 'all' | 'new' | 'consulting' | 'booked' | 'closed'

// ─── 확장 문의 상태 레이블 ─────────────────────────────────────────────────
const CRM_STATUS_LABEL: Record<CrmStatus, string> = {
  all:        '전체',
  new:        '신규',
  consulting: '상담중',
  booked:     '예약완료',
  closed:     '종료',
}

// ─── 채널 스타일 ───────────────────────────────────────────────────────────
const CHANNEL_STYLE: Record<string, { bg: string; color: string; icon: string }> = {
  LINE:    { bg: '#D1FAE5', color: '#065F46', icon: '💬' },
  '사이트폼': { bg: '#EFF6FF', color: '#1D4ED8', icon: '🌐' },
  카카오:  { bg: '#FEF3C7', color: '#92400E', icon: '💛' },
}

// ─── 문의 → CRM 상태 매핑 (mock status를 CRM 필터 키로 매핑) ───────────────
function toCrmStatus(s: InquiryStatus): Exclude<CrmStatus, 'all'> {
  if (s === 'new')     return 'new'
  if (s === 'pending') return 'consulting'
  return 'booked'
}

// ─── AI 제안 답변 목업 ────────────────────────────────────────────────────
const AI_SUGGESTS = [
  {
    tone: '친절·공식',
    toneColor: '#2563EB',
    toneBg: '#EFF6FF',
    ko: '안녕하세요! 문의해 주셔서 감사합니다. 해당 시술에 대해 자세한 안내를 드리겠습니다. 무료 상담 예약을 통해 맞춤형 정보를 받아보시겠어요?',
    ja: 'こんにちは！お問い合わせいただきありがとうございます。施術について詳しくご案内いたします。無料カウンセリングのご予約はいかがでしょうか？',
  },
  {
    tone: '간결·정보형',
    toneColor: '#7C3AED',
    toneBg: '#F5F3FF',
    ko: '시술 비용과 회복 기간은 개인 상태에 따라 다릅니다. 정확한 안내를 위해 무료 상담을 권장드립니다.',
    ja: '施術の費用と回復期間は個人差があります。正確なご案内のために無料カウンセリングをお勧めします。',
  },
  {
    tone: '공감·설득형',
    toneColor: '#0D9488',
    toneBg: '#F0FDFA',
    ko: '고객님의 고민을 충분히 이해합니다. 저희 병원에서는 일본어 전담 스태프가 처음부터 끝까지 함께합니다. 편안하게 상담받아 보세요!',
    ja: 'お悩みはよく理解できます。当院では日本語専任スタッフが最初から最後までサポートいたします。ぜひ気軽にご相談ください！',
  },
]

// ─── 시술 매뉴얼 목업 ─────────────────────────────────────────────────────
const PROCEDURE_MANUAL: Record<string, { title: string; tag: string; tagColor: string; tagBg: string; body: string }[]> = {
  '성형': [
    {
      title: '쌍꺼풀 수술 (이중눈꺼풀)',
      tag: '인기',
      tagColor: '#1D4ED8',
      tagBg: '#DBEAFE',
      body: '매몰법(30분)·절개법(1~2시간). 회복: 매몰법 1주, 절개법 2~3주. 일본어 자료 제공 가능.',
    },
    {
      title: '코 성형 (비整形)',
      tag: '고관심',
      tagColor: '#065F46',
      tagBg: '#D1FAE5',
      body: '융비술·코끝 교정·코 축소 등. 수술 후 부기 2~3주, 최종 결과 6개월. 모니터 할인 가능.',
    },
  ],
  '피부': [
    {
      title: '리프팅 시술',
      tag: '비수술',
      tagColor: '#7C3AED',
      tagBg: '#EDE9FE',
      body: 'HIFU·실 리프팅 등. 시술 시간 30~60분. 효과 6개월~2년. 다운타임 최소.',
    },
    {
      title: '레이저 토닝',
      tag: '인기',
      tagColor: '#1D4ED8',
      tagBg: '#DBEAFE',
      body: '색소·기미·잡티 개선. 1회 20분. 5~10회 권장. 자외선 차단 필수.',
    },
  ],
  '라인': [
    {
      title: '지방흡입',
      tag: '수술',
      tagColor: '#DC2626',
      tagBg: '#FEE2E2',
      body: '복부·허벅지·팔 등. 수술 1~3시간. 회복 2~4주. 수술 전 혈액검사 필요.',
    },
  ],
  '기타': [
    {
      title: '일본어 통역 서비스',
      tag: '무료',
      tagColor: '#065F46',
      tagBg: '#D1FAE5',
      body: '일본어 전담 스태프 상주. 수술 전·후 전 과정 통역 제공. LINE 채팅 대응.',
    },
  ],
}

// ─── 시간 슬롯 생성 ────────────────────────────────────────────────────────
const TIME_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00']
const BUSY_SLOTS = ['10:00','14:00']

// ─── 언어 옵션 ─────────────────────────────────────────────────────────────
const LANG_OPTIONS = [
  { code: 'ja',    badge: 'JP', badgeBg: '#2563EB', label: '일본어' },
  { code: 'zh-CN', badge: 'CN', badgeBg: '#DE2910', label: '중국어 간체' },
  { code: 'zh-TW', badge: 'TW', badgeBg: '#002395', label: '중국어 번체' },
  { code: 'en',    badge: 'EN', badgeBg: '#012169', label: '영어' },
  { code: 'th',    badge: 'TH', badgeBg: '#A51931', label: '태국어' },
]

// ─── 아바타 색상 ───────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: '#EEF2FF', color: '#0D1B3E' },
  { bg: '#EEEDFE', color: '#3C3489' },
  { bg: '#FEF3C7', color: '#92400E' },
  { bg: '#D1FAE5', color: '#065F46' },
  { bg: '#FEE2E2', color: '#991B1B' },
]

function getAvatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length]
}

function getInitials(name: string) {
  const parts = name.split(' ')
  if (parts.length >= 2) return parts[parts.length - 1].slice(0, 2)
  return name.slice(0, 2)
}

// ─── KPI 계산용 상수 ───────────────────────────────────────────────────────
const TOTAL_COUNT   = CRM_INQUIRIES.length
const NEW_COUNT     = CRM_INQUIRIES.filter(q => q.status === 'new').length
const PENDING_COUNT = CRM_INQUIRIES.filter(q => q.status === 'pending').length
const REPLIED_COUNT = CRM_INQUIRIES.filter(q => q.status === 'replied').length
const OVERDUE_COUNT = CRM_INQUIRIES.filter(q => q.overdue).length

// ─── 메모 저장소 (in-memory) ──────────────────────────────────────────────
const MEMOS: Record<number, string> = {}

// ─── 문의 상태 (mutable, in-memory) ──────────────────────────────────────
type LocalStatus = InquiryStatus
const LOCAL_STATUS: Record<number, LocalStatus> = {}

export default function CrmPage() {
  // ── 필터 & 검색 ────────────────────────────────────────────────────────
  const [filter,  setFilter]  = useState<CrmStatus>('all')
  const [search,  setSearch]  = useState('')

  // ── 선택된 문의 ────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<CrmInquiry | null>(CRM_INQUIRIES[0])

  // ── 우측 패널 탭 ──────────────────────────────────────────────────────
  const [rpTab, setRpTab] = useState<'ai' | 'manual'>('ai')

  // ── 드래프트 (중앙 패널 하단) ─────────────────────────────────────────
  const [draftKo, setDraftKo] = useState('')
  const [draftJa, setDraftJa] = useState('')

  // ── 선택된 AI 제안 ────────────────────────────────────────────────────
  const [selectedSuggest, setSelectedSuggest] = useState<number | null>(null)

  // ── 언어 선택 드롭다운 ────────────────────────────────────────────────
  const [langOpen, setLangOpen] = useState(false)
  const [activeLang, setActiveLang] = useState(LANG_OPTIONS[0])
  const langRef = useRef<HTMLDivElement>(null)

  // ── 문의 상태 (로컬 override) ─────────────────────────────────────────
  const [localStatuses, setLocalStatuses] = useState<Record<number, LocalStatus>>({})

  // ── 메모 ──────────────────────────────────────────────────────────────
  const [memo, setMemo] = useState('')

  // ── 예약 전환 모달 ────────────────────────────────────────────────────
  const [bookingModal, setBookingModal] = useState(false)
  const [bmType,       setBmType]       = useState('consult')
  const [bmProc,       setBmProc]       = useState('')
  const [bmDate,       setBmDate]       = useState('')
  const [bmTime,       setBmTime]       = useState('')
  const [bmDoctor,     setBmDoctor]     = useState('')
  const [bmMemo,       setBmMemo]       = useState('')
  const [bmSendLine,   setBmSendLine]   = useState(true)

  // ── 토스트 ────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)

  function showToast(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  // ── 언어 드롭다운 외부 클릭 닫기 ─────────────────────────────────────
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // ── 선택 변경 시 메모 복원 ────────────────────────────────────────────
  useEffect(() => {
    if (selected) {
      setMemo(MEMOS[selected.id] ?? '')
      setDraftKo('')
      setDraftJa('')
      setSelectedSuggest(null)
    }
  }, [selected?.id])

  // ── 현재 문의의 실제 상태 가져오기 ───────────────────────────────────
  function getStatus(q: CrmInquiry): LocalStatus {
    return localStatuses[q.id] ?? q.status
  }

  // ── 필터링 ────────────────────────────────────────────────────────────
  const filtered = CRM_INQUIRIES.filter(q => {
    const st = getStatus(q)
    const crmSt = toCrmStatus(st)

    let matchFilter = filter === 'all'
    if (filter === 'new')        matchFilter = st === 'new'
    if (filter === 'consulting') matchFilter = st === 'pending'
    if (filter === 'booked')     matchFilter = st === 'replied'
    if (filter === 'closed')     matchFilter = false // 현재 mock에 closed 없음

    const kw = search.trim().toLowerCase()
    const matchSearch = !kw
      || q.name.toLowerCase().includes(kw)
      || q.nameKana.includes(kw)
      || q.content.toLowerCase().includes(kw)
      || q.category.includes(kw)
    return matchFilter && matchSearch
  })

  // ── 필터 카운트 ──────────────────────────────────────────────────────
  function countFor(f: CrmStatus) {
    if (f === 'all')        return CRM_INQUIRIES.length
    if (f === 'new')        return CRM_INQUIRIES.filter(q => getStatus(q) === 'new').length
    if (f === 'consulting') return CRM_INQUIRIES.filter(q => getStatus(q) === 'pending').length
    if (f === 'booked')     return CRM_INQUIRIES.filter(q => getStatus(q) === 'replied').length
    if (f === 'closed')     return 0
    return 0
  }

  // ── 상태 변경 ─────────────────────────────────────────────────────────
  function changeStatus() {
    if (!selected) return
    const cur = getStatus(selected)
    const next: LocalStatus = cur === 'new' ? 'pending' : cur === 'pending' ? 'replied' : 'new'
    setLocalStatuses(prev => ({ ...prev, [selected.id]: next }))
    showToast(`상태를 "${STATUS_LABEL[next]}"으로 변경했습니다.`)
  }

  function getStatusBtnLabel() {
    if (!selected) return ''
    const cur = getStatus(selected)
    if (cur === 'new')     return '상담중으로 변경'
    if (cur === 'pending') return '답변완료로 변경'
    return '미답변으로 변경'
  }

  // ── AI 제안 선택 → 드래프트 채우기 ────────────────────────────────────
  function pickSuggest(idx: number) {
    setSelectedSuggest(idx)
    setDraftKo(AI_SUGGESTS[idx].ko)
    setDraftJa(AI_SUGGESTS[idx].ja)
  }

  // ── 한국어 입력 → 자동 번역(mock) ────────────────────────────────────
  function onKoInput(val: string) {
    setDraftKo(val)
    if (val.trim()) {
      // Mock: 짧은 지연 후 ja 채우기
      const mock = `（翻訳）${val.slice(0, 60)}${val.length > 60 ? '…' : ''}`
      setDraftJa(mock)
    } else {
      setDraftJa('')
    }
  }

  // ── 전송 ──────────────────────────────────────────────────────────────
  function sendMsg() {
    if (!draftJa.trim() && !draftKo.trim()) {
      showToast('메시지를 입력해 주세요.', 'error')
      return
    }
    showToast(`${activeLang.label}로 메시지를 발송했습니다.`, 'success')
    setDraftKo('')
    setDraftJa('')
    setSelectedSuggest(null)
  }

  // ── 메모 저장 ─────────────────────────────────────────────────────────
  function saveMemo() {
    if (selected) {
      MEMOS[selected.id] = memo
      showToast('메모가 저장되었습니다.', 'info')
    }
  }

  // ── 예약 전환 모달 열기 ───────────────────────────────────────────────
  function openBookingModal() {
    setBmType('consult')
    setBmProc('')
    setBmDate('')
    setBmTime('')
    setBmDoctor('')
    setBmMemo('')
    setBmSendLine(true)
    setBookingModal(true)
  }

  // ── 예약 전환 제출 ────────────────────────────────────────────────────
  function submitBooking() {
    if (!bmDate) { showToast('예약 날짜를 선택해 주세요.', 'error'); return }
    if (!bmTime) { showToast('예약 시간을 선택해 주세요.', 'error'); return }
    setBookingModal(false)
    showToast('예약이 등록되었습니다! 확인 메시지를 발송합니다.', 'success')
    if (selected) {
      setLocalStatuses(prev => ({ ...prev, [selected.id]: 'replied' }))
    }
  }

  // ── 재생성 (mock) ─────────────────────────────────────────────────────
  function regenSuggests() {
    showToast('AI 답변을 재생성했습니다.', 'info')
  }

  // ─────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────
  const selStatus = selected ? getStatus(selected) : null
  const avColor   = selected ? getAvatarColor(selected.id) : AVATAR_COLORS[0]
  const chStyle   = selected ? (CHANNEL_STYLE[selected.channel] ?? { bg: 'var(--s100)', color: 'var(--s500)', icon: '📩' }) : CHANNEL_STYLE['LINE']
  const manuals   = selected ? (PROCEDURE_MANUAL[selected.category] ?? PROCEDURE_MANUAL['기타']) : []

  return (
    <>
      {/* ── TOPBAR ─────────────────────────────────────────────────── */}
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/" className="topbar-back">← 대시보드</Link>
          <span className="topbar-sep">/</span>
          <span className="topbar-title">문의·상담 CRM</span>
        </div>
        <div className="topbar-right">
          <Link href="/booking" className="btn" style={{ fontSize: 13 }}>📅 예약 관리</Link>
          <Link href="/funnel"  className="btn btn-primary" style={{ fontSize: 13 }}>⚡ 리타게팅</Link>
        </div>
      </div>

      <div className="content fade" style={{ paddingBottom: 32 }}>

        {/* ── KPI 4열 ──────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 10, marginBottom: 14 }}>
          {/* 전체 문의 */}
          <div style={{ background: 'var(--s50)', borderRadius: 'var(--r)', padding: '10px 14px' }}>
            <div style={{ fontSize: 12, color: 'var(--s400)', marginBottom: 3 }}>전체 문의</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>{TOTAL_COUNT}건</div>
            <div className="up" style={{ fontSize: 12 }}>↑ +8 전월</div>
          </div>
          {/* 미확인 */}
          <div style={{ background: 'var(--s50)', borderRadius: 'var(--r)', padding: '10px 14px' }}>
            <div style={{ fontSize: 12, color: 'var(--s400)', marginBottom: 3 }}>미확인</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--red)' }}>{NEW_COUNT}건</div>
            <div style={{ fontSize: 12, color: 'var(--red)' }}>
              {OVERDUE_COUNT > 0 ? `⚠ ${OVERDUE_COUNT}건 48h 초과` : '정상 범위'}
            </div>
          </div>
          {/* 예약 전환 */}
          <div style={{ background: 'var(--s50)', borderRadius: 'var(--r)', padding: '10px 14px' }}>
            <div style={{ fontSize: 12, color: 'var(--s400)', marginBottom: 3 }}>예약 전환</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>{REPLIED_COUNT}건</div>
            <div style={{ fontSize: 12, color: 'var(--s500)' }}>
              전환율 {Math.round((REPLIED_COUNT / TOTAL_COUNT) * 100)}%
            </div>
          </div>
          {/* AI 자동 해결 */}
          <div style={{ background: 'var(--s50)', borderRadius: 'var(--r)', padding: '10px 14px' }}>
            <div style={{ fontSize: 12, color: 'var(--s400)', marginBottom: 3 }}>AI 자동 해결</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>4건</div>
            <div style={{ fontSize: 12, color: 'var(--s500)' }}>자동 처리율 40%</div>
          </div>
        </div>

        {/* ── 3열 레이아웃 ───────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 300px', gap: 12, alignItems: 'start' }}>

          {/* ① 좌측: 상담 목록 ─────────────────────────────────────── */}
          <div style={{ background: 'var(--s0)', border: '1px solid var(--s200)', borderRadius: 'var(--rl)', overflow: 'hidden', boxShadow: 'var(--sh)' }}>
            {/* 검색 + 필터 */}
            <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid var(--s100)' }}>
              <input
                type="search"
                placeholder="환자 이름·시술·채널 검색..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ marginBottom: 8 }}
              />
              <div className="filter-pills" style={{ gap: 4 }}>
                {(['all','new','consulting','booked','closed'] as CrmStatus[]).map(f => (
                  <button
                    key={f}
                    className={`pill${filter === f ? ' on' : ''}`}
                    onClick={() => setFilter(f)}
                    style={{ fontSize: 11, padding: '3px 9px' }}
                  >
                    {CRM_STATUS_LABEL[f]} {countFor(f)}
                  </button>
                ))}
              </div>
            </div>

            {/* 문의 목록 */}
            <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 260px)' }}>
              {filtered.length === 0 && (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--s400)', fontSize: 13 }}>
                  해당 조건의 문의가 없습니다
                </div>
              )}
              {filtered.map(q => {
                const ch = CHANNEL_STYLE[q.channel] ?? { bg: 'var(--s100)', color: 'var(--s500)', icon: '📩' }
                const st = getStatus(q)
                const av = getAvatarColor(q.id)
                const isActive = selected?.id === q.id
                return (
                  <div
                    key={q.id}
                    onClick={() => setSelected(q)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '11px 14px',
                      borderBottom: '1px solid var(--s50)',
                      borderLeft: `3px solid ${isActive ? 'var(--blue)' : 'transparent'}`,
                      background: isActive ? 'var(--blue-l)' : undefined,
                      cursor: 'pointer',
                      transition: 'all .12s',
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'var(--s50)' }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = '' }}
                  >
                    {/* 아바타 */}
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: av.bg, color: av.color,
                      fontSize: 11, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {getInitials(q.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{q.name}</span>
                        <span style={{ fontSize: 10, color: q.overdue ? 'var(--red)' : 'var(--s400)', fontWeight: q.overdue ? 700 : 400, flexShrink: 0 }}>
                          {q.overdue ? '⚠ 48h↑' : q.elapsed}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: ch.bg, color: ch.color }}>{ch.icon} {q.channel}</span>
                        <span className={STATUS_BADGE[st]} style={{ fontSize: 9, padding: '1px 6px' }}>{STATUS_LABEL[st]}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--s600)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {q.content}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ② 중앙: 채팅창 ──────────────────────────────────────────── */}
          <div style={{ background: 'var(--s0)', border: '1px solid var(--s200)', borderRadius: 'var(--rl)', overflow: 'hidden', boxShadow: 'var(--sh)', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
            {selected ? (
              <>
                {/* 채팅 헤더 */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--s100)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--s50)', flexShrink: 0 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: avColor.bg, color: avColor.color,
                    fontSize: 12, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {getInitials(selected.name)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>{selected.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 1 }}>
                      {selected.channel} · {selected.elapsed} 경과 · {selected.category}
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: 12 }}
                    onClick={changeStatus}
                  >
                    {getStatusBtnLabel()}
                  </button>
                </div>

                {/* 메시지 영역 */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {selected.thread.map((msg, i) => {
                    const isStaff = msg.role === 'staff'
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: isStaff ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
                        {!isStaff && (
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: avColor.bg, color: avColor.color,
                            fontSize: 10, fontWeight: 700, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {getInitials(selected.name)}
                          </div>
                        )}
                        {isStaff && (
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: 'var(--navy-l)', fontSize: 16,
                            flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            🌸
                          </div>
                        )}
                        <div style={{ maxWidth: '72%' }}>
                          {!isStaff && <div style={{ fontSize: 11, color: 'var(--s400)', marginBottom: 3 }}>{selected.name}</div>}
                          <div style={{
                            padding: '10px 13px',
                            borderRadius: isStaff ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                            background: isStaff ? 'var(--navy)' : 'var(--s100)',
                            color: isStaff ? '#fff' : 'var(--s900)',
                            fontSize: 13, lineHeight: 1.7,
                          }}>
                            <span className="msg-ja">{msg.text}</span>
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--s400)', marginTop: 4, textAlign: isStaff ? 'right' : 'left' }}>
                            {msg.time}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* HANA AI 답변 초안 */}
                <div style={{ borderTop: '1px solid var(--s100)', flexShrink: 0 }}>
                  {/* 초안 헤더 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px 6px', flexWrap: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--navy-l)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌸</div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>HANA 답변 초안</span>
                    </div>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center', position: 'relative' }} ref={langRef}>
                      {/* 언어 선택 버튼 */}
                      <button
                        onClick={() => setLangOpen(v => !v)}
                        style={{
                          fontSize: 12, padding: '3px 10px', borderRadius: 8,
                          border: '1px solid var(--blue)', background: 'var(--blue-l)', color: 'var(--blue)',
                          cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
                          display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
                        }}
                      >
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 20, height: 14, background: activeLang.badgeBg, color: '#fff',
                          borderRadius: 3, fontSize: 9, fontWeight: 700, letterSpacing: .5,
                        }}>{activeLang.badge}</span>
                        {activeLang.label}
                        <span style={{ fontSize: 9 }}>▼</span>
                      </button>
                      {/* 드롭다운 */}
                      {langOpen && (
                        <div style={{
                          position: 'absolute', top: 'calc(100% + 4px)', right: 0,
                          background: '#fff', border: '1px solid var(--s200)',
                          borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                          zIndex: 1000, minWidth: 140, overflow: 'hidden',
                        }}>
                          {LANG_OPTIONS.map(opt => (
                            <div
                              key={opt.code}
                              onClick={() => { setActiveLang(opt); setLangOpen(false) }}
                              style={{
                                padding: '8px 14px', fontSize: 12, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 8,
                                background: activeLang.code === opt.code ? 'var(--navy-l)' : undefined,
                                color: activeLang.code === opt.code ? 'var(--navy)' : 'var(--s700)',
                                fontWeight: activeLang.code === opt.code ? 600 : 400,
                              }}
                              onMouseEnter={e => { if (activeLang.code !== opt.code) (e.currentTarget as HTMLDivElement).style.background = 'var(--s50)' }}
                              onMouseLeave={e => { if (activeLang.code !== opt.code) (e.currentTarget as HTMLDivElement).style.background = '' }}
                            >
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: 20, height: 14, background: opt.badgeBg, color: '#fff',
                                borderRadius: 3, fontSize: 9, fontWeight: 700,
                              }}>{opt.badge}</span>
                              {opt.label}
                            </div>
                          ))}
                        </div>
                      )}
                      <button className="btn" style={{ fontSize: 12, padding: '3px 8px', whiteSpace: 'nowrap', flexShrink: 0 }} onClick={regenSuggests}>↺ 재생성</button>
                    </div>
                  </div>

                  {/* 한국어 / 번역 2열 입력 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '0 14px 10px', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s500)', marginBottom: 4 }}>🇰🇷 한국어 입력</div>
                      <textarea
                        rows={3}
                        value={draftKo}
                        onChange={e => onKoInput(e.target.value)}
                        placeholder="한국어로 답변 입력..."
                        style={{
                          width: '100%', padding: '8px 10px',
                          border: '1.5px solid var(--s200)', borderRadius: 8,
                          fontSize: 13, fontFamily: 'inherit',
                          resize: 'none', outline: 'none', lineHeight: 1.7,
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = 'var(--blue)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'var(--s200)')}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s500)', marginBottom: 4 }}>
                        {activeLang.badge === 'JP' ? '🇯🇵' : activeLang.badge === 'CN' ? '🇨🇳' : activeLang.badge === 'EN' ? '🇬🇧' : '🌐'} {activeLang.label} 발송
                      </div>
                      <textarea
                        rows={3}
                        value={draftJa}
                        onChange={e => setDraftJa(e.target.value)}
                        placeholder={`${activeLang.label} 번역 결과...`}
                        style={{
                          width: '100%', padding: '8px 10px',
                          border: '1.5px solid var(--s200)', borderRadius: 8,
                          fontSize: 13, fontFamily: 'inherit',
                          resize: 'none', outline: 'none', lineHeight: 1.7,
                          background: 'var(--s50)',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.background = '#fff' }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'var(--s200)'; e.currentTarget.style.background = 'var(--s50)' }}
                      />
                    </div>
                  </div>

                  {/* 하단 액션 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, padding: '8px 14px 12px' }}>
                    <button className="btn btn-sm" onClick={() => { setDraftKo(''); setDraftJa(''); setSelectedSuggest(null) }}>취소</button>
                    <button
                      onClick={sendMsg}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '7px 16px', borderRadius: 'var(--r)',
                        background: 'var(--navy)', color: '#fff',
                        border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 500,
                      }}
                    >
                      📤 {selected.channel}으로 발송
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, color: 'var(--s400)' }}>
                <div style={{ fontSize: 32 }}>💬</div>
                <div style={{ fontSize: 14 }}>문의를 선택하면 대화가 표시됩니다</div>
              </div>
            )}
          </div>

          {/* ③ 우측 패널 ──────────────────────────────────────────────── */}
          <div style={{ background: 'var(--s0)', border: '1px solid var(--s200)', borderRadius: 'var(--rl)', overflow: 'hidden', boxShadow: 'var(--sh)', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
            {selected ? (
              <>
                {/* 고객 프로필 카드 */}
                <div style={{ padding: '16px 16px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: avColor.bg, color: avColor.color,
                      fontSize: 15, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {getInitials(selected.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>{selected.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 2 }}>{selected.nameKana}</div>
                      {selStatus && (
                        <span className={STATUS_BADGE[selStatus]} style={{ marginTop: 4, display: 'inline-flex' }}>
                          {STATUS_LABEL[selStatus]}
                        </span>
                      )}
                    </div>
                    <button
                      className="btn btn-sm"
                      style={{ fontSize: 11, flexShrink: 0 }}
                      onClick={openBookingModal}
                    >📅 예약 전환</button>
                  </div>

                  {/* 정보 그리드 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                    {[
                      { label: '관심 시술', value: selected.category },
                      { label: '유입 채널', value: selected.channel },
                      { label: '문의 경과', value: selected.elapsed },
                      { label: '방문 이력', value: '첫 방문' },
                    ].map(item => (
                      <div key={item.label} style={{ background: 'var(--s50)', borderRadius: 8, padding: '8px 10px' }}>
                        <div style={{ fontSize: 10, color: 'var(--s400)', marginBottom: 2, letterSpacing: '.03em' }}>{item.label}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s900)' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* 내부 메모 */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s400)', letterSpacing: '.04em', marginBottom: 6 }}>📝 내부 메모</div>
                    <textarea
                      rows={3}
                      value={memo}
                      onChange={e => setMemo(e.target.value)}
                      onBlur={saveMemo}
                      placeholder="담당자 메모를 입력하세요... (자동저장)"
                      style={{
                        width: '100%', padding: '8px 10px',
                        border: '1.5px solid var(--s200)', borderRadius: 8,
                        fontSize: 12, fontFamily: 'inherit', resize: 'none', outline: 'none',
                        lineHeight: 1.6, color: 'var(--s700)', background: '#fff', transition: 'border .15s',
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = 'var(--blue)')}
                    />
                  </div>

                  {/* 액션 버튼 2개 */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn" style={{ flex: 1, justifyContent: 'center', fontSize: 12, height: 32 }} onClick={openBookingModal}>
                      📅 예약 전환
                    </button>
                    <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 12, height: 32 }} onClick={changeStatus}>
                      {getStatusBtnLabel().replace('로 변경', '')}
                    </button>
                  </div>
                </div>

                {/* 탭 선택 */}
                <div style={{ padding: '0 14px 8px', borderTop: '1px solid var(--s100)' }}>
                  <div className="rp-tab-bar" style={{
                    display: 'flex', gap: 2, background: 'var(--s100)',
                    borderRadius: 8, padding: 3, marginTop: 12,
                  }}>
                    {(['ai', 'manual'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setRpTab(tab)}
                        style={{
                          flex: 1, padding: '5px 0', fontSize: 12,
                          fontWeight: rpTab === tab ? 600 : 500,
                          textAlign: 'center', border: 'none',
                          background: rpTab === tab ? '#fff' : 'transparent',
                          borderRadius: 6, cursor: 'pointer',
                          color: rpTab === tab ? 'var(--navy)' : 'var(--s500)',
                          boxShadow: rpTab === tab ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
                          fontFamily: 'inherit', transition: 'all .15s',
                        }}
                      >
                        {tab === 'ai' ? '🤖 AI 코칭' : '💉 시술 코칭'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI 코칭 탭 */}
                {rpTab === 'ai' && (
                  <div style={{ padding: '0 14px 14px' }}>
                    {AI_SUGGESTS.map((sug, idx) => (
                      <div
                        key={idx}
                        onClick={() => pickSuggest(idx)}
                        style={{
                          border: `1px solid ${selectedSuggest === idx ? 'var(--navy)' : 'var(--s200)'}`,
                          borderRadius: 10, padding: '10px 12px', marginBottom: 8,
                          cursor: 'pointer', transition: 'all .15s',
                          background: selectedSuggest === idx ? 'var(--navy-l)' : undefined,
                        }}
                        onMouseEnter={e => { if (selectedSuggest !== idx) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--blue)', (e.currentTarget as HTMLDivElement).style.background = 'var(--blue-l)' }}
                        onMouseLeave={e => { if (selectedSuggest !== idx) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--s200)', (e.currentTarget as HTMLDivElement).style.background = '' }}
                      >
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: '2px 7px',
                          borderRadius: 10, marginBottom: 6, display: 'inline-block',
                          background: sug.toneBg, color: sug.toneColor,
                        }}>{sug.tone}</span>
                        <div style={{ fontSize: 12, color: 'var(--s700)', lineHeight: 1.6 }}>{sug.ko}</div>
                        <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 4, lineHeight: 1.5, paddingTop: 4, borderTop: '1px dashed var(--s200)' }}>{sug.ja}</div>
                      </div>
                    ))}
                    <button className="btn" style={{ width: '100%', justifyContent: 'center', fontSize: 12, marginTop: 4 }} onClick={regenSuggests}>
                      ↺ 답변 재생성
                    </button>
                  </div>
                )}

                {/* 시술 코칭 탭 */}
                {rpTab === 'manual' && (
                  <div style={{ padding: '0 14px 14px' }}>
                    {manuals.map((m, idx) => (
                      <div key={idx} style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--s50)', marginBottom: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {m.title}
                          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, fontWeight: 500, background: m.tagBg, color: m.tagColor }}>{m.tag}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--s600)', lineHeight: 1.7 }}>{m.body}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--s400)', fontSize: 13 }}>
                문의를 선택하면 고객 정보가 표시됩니다
              </div>
            )}
          </div>
        </div>

        <footer style={{ padding: '20px 0', textAlign: 'center', fontSize: 12, color: 'var(--s400)', borderTop: '1px solid var(--s100)', marginTop: 20 }}>
          © 2026 MEDIFLOW. All rights reserved.
        </footer>
      </div>

      {/* ── 예약 전환 모달 ──────────────────────────────────────────────── */}
      {bookingModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setBookingModal(false) }}
        >
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,.2)' }}>
            {/* 모달 헤더 */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--s100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>📅 예약 전환</div>
                <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 2 }}>
                  {selected?.name} · {selected?.channel} · {selected?.category}
                </div>
              </div>
              <button
                onClick={() => setBookingModal(false)}
                style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--s200)', background: '#fff', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--s500)' }}
              >✕</button>
            </div>

            {/* 모달 바디 */}
            <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>
              {/* 환자 카드 */}
              {selected && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--navy-l)', border: '1px solid var(--blue)', borderRadius: 12, marginBottom: 18 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: avColor.bg, color: avColor.color, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {getInitials(selected.name)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{selected.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--s500)' }}>{selected.channel} · {selected.category} · {STATUS_LABEL[getStatus(selected)]}</div>
                  </div>
                  <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: chStyle.bg, color: chStyle.color, fontWeight: 500 }}>
                    {chStyle.icon} {selected.channel}
                  </span>
                </div>
              )}

              {/* 예약 유형 */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s600)', marginBottom: 6 }}>예약 유형 <span style={{ color: 'var(--red)' }}>*</span></div>
                <select value={bmType} onChange={e => setBmType(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--s200)', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#fff' }}>
                  <option value="">선택</option>
                  <option value="consult">상담 (카운슬링)</option>
                  <option value="online">비대면 상담</option>
                  <option value="surgery">수술</option>
                  <option value="checkup">사후 체크업</option>
                  <option value="laser">시술 (레이저 등)</option>
                </select>
              </div>

              {/* 관심 시술 */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s600)', marginBottom: 6 }}>관심 시술</div>
                <select value={bmProc} onChange={e => setBmProc(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--s200)', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#fff' }}>
                  <option value="">선택</option>
                  <option>쌍꺼풀 (매몰법)</option>
                  <option>쌍꺼풀 (절개법)</option>
                  <option>코 성형</option>
                  <option>윤곽 수술</option>
                  <option>지방흡입</option>
                  <option>피부 레이저</option>
                  <option>기타</option>
                </select>
              </div>

              {/* 날짜 */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s600)', marginBottom: 6 }}>예약 날짜 <span style={{ color: 'var(--red)' }}>*</span></div>
                <input
                  type="date"
                  value={bmDate}
                  onChange={e => { setBmDate(e.target.value); setBmTime('') }}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--s200)', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                />
              </div>

              {/* 시간 슬롯 */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s600)', marginBottom: 6 }}>예약 시간 <span style={{ color: 'var(--red)' }}>*</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
                  {TIME_SLOTS.map(slot => {
                    const busy = BUSY_SLOTS.includes(slot)
                    const active = bmTime === slot
                    return (
                      <button
                        key={slot}
                        disabled={busy}
                        onClick={() => setBmTime(slot)}
                        style={{
                          padding: '6px 0', borderRadius: 8, fontSize: 12, fontFamily: 'inherit',
                          border: active ? '1.5px solid var(--navy)' : '1px solid var(--s200)',
                          background: busy ? 'var(--s100)' : active ? 'var(--navy)' : '#fff',
                          color: busy ? 'var(--s300)' : active ? '#fff' : 'var(--s700)',
                          cursor: busy ? 'not-allowed' : 'pointer',
                          textDecoration: busy ? 'line-through' : 'none',
                        }}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 담당 의사 */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s600)', marginBottom: 6 }}>담당 의사</div>
                <select value={bmDoctor} onChange={e => setBmDoctor(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--s200)', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#fff' }}>
                  <option value="">배정 없음</option>
                  <option>김민준 원장</option>
                  <option>이수진 전문의</option>
                  <option>박정호 전문의</option>
                  <option>최유리 전문의</option>
                </select>
              </div>

              {/* 내부 메모 */}
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s600)', marginBottom: 6 }}>내부 메모</div>
                <textarea
                  rows={2}
                  value={bmMemo}
                  onChange={e => setBmMemo(e.target.value)}
                  placeholder="예) 일본어 전담 스태프 배정 필요"
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--s200)', borderRadius: 10, fontSize: 12, fontFamily: 'inherit', resize: 'none', outline: 'none', lineHeight: 1.6, boxSizing: 'border-box' }}
                />
              </div>

              {/* 자동발송 체크박스 */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--s50)', borderRadius: 10, fontSize: 12, color: 'var(--s700)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={bmSendLine}
                  onChange={e => setBmSendLine(e.target.checked)}
                  style={{ width: 14, height: 14, accentColor: 'var(--navy)' }}
                />
                예약 등록 즉시 LINE/Instagram으로 확정 메시지 자동 발송
              </label>
            </div>

            {/* 모달 푸터 */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--s100)', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0, background: '#fff' }}>
              <button className="btn" onClick={() => setBookingModal(false)}>취소</button>
              <button className="btn btn-primary" onClick={submitBooking} style={{ minWidth: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                📅 예약 등록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 토스트 ──────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'success' ? '#059669' : toast.type === 'error' ? '#DC2626' : '#0D1B3E',
          color: '#fff', padding: '11px 22px', borderRadius: 10,
          fontSize: 13, fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,.2)',
          zIndex: 9999, whiteSpace: 'nowrap',
        }}>
          {toast.msg}
        </div>
      )}
    </>
  )
}
