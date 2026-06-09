'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  BOOKINGS,
  BOOKING_STATUS_LABEL, BOOKING_STATUS_BADGE, BOOKING_TYPE_COLOR,
  type Booking, type BookingStatus, type BookingType,
} from '@/lib/mock-data'

// ────────────────────────────────────────
// 로컬 타입
// ────────────────────────────────────────
type BookingFilter = 'all' | 'consult' | 'online' | 'visit' | 'auto'

// prototype booking-data.js 기반 타입
interface BookingRow {
  id:     number
  date:   string   // 'M/D' 형식 (예: '6/8')
  time:   string   // 'HH:MM'
  name:   string
  proc:   string   // 시술명
  type:   string   // 'consult' | 'online' | 'visit' | 'auto'
  doctor: string
  line:   boolean  // LINE 발송 여부
  status: string   // '확정' | '대기' | '완료' | '취소'
  note?:  string
}

interface PatientSuggestion {
  name: string
  ch:   string
  proc: string
  init: string
  bg:   string
  tc:   string
}

// ────────────────────────────────────────
// 타입 컬러 / 레이블 (prototype TYPE_COLORS / TYPE_LABELS)
// ────────────────────────────────────────
const TYPE_COLORS: Record<string, { bg: string; tc: string }> = {
  consult: { bg: '#EFF6FF', tc: '#2563EB' },
  online:  { bg: '#F0FDFA', tc: '#0D9488' },
  visit:   { bg: '#F0FDF4', tc: '#16A34A' },
  auto:    { bg: '#FEF3C7', tc: '#D97706' },
}
const TYPE_LABELS: Record<string, string> = {
  consult: '상담',
  online:  '비대면',
  visit:   '내원',
  auto:    '시술',
}

// ────────────────────────────────────────
// 상태 배지 스타일
// ────────────────────────────────────────
function statusChipStyle(status: string): { sbc: string; stc: string } {
  switch (status) {
    case '확정': return { sbc: '#DBEAFE', stc: '#1D4ED8' }
    case '대기': return { sbc: '#EDE9FE', stc: '#6D28D9' }
    case '완료': return { sbc: '#D1FAE5', stc: '#065F46' }
    case '취소': return { sbc: '#F3F4F6', stc: '#6B7280' }
    default:     return { sbc: '#F3F4F6', stc: '#6B7280' }
  }
}

// ────────────────────────────────────────
// BOOKINGS → BookingRow 변환 (prototype 데이터 구조로)
// ────────────────────────────────────────
function toBookingRow(b: Booking, idx: number): BookingRow {
  const typeMap: Record<BookingType, string> = {
    '무료상담': 'consult',
    '유료상담': 'consult',
    '수술':     'auto',
    '시술':     'auto',
    '경과확인': 'visit',
  }
  const statusMap: Record<BookingStatus, string> = {
    confirmed: '확정',
    pending:   '대기',
    completed: '완료',
    cancelled: '취소',
  }
  // 날짜 변환: 'YYYY-MM-DD' → 'M/D'
  const parts = b.date.split('-')
  const dateKey = `${parseInt(parts[1])}/${parseInt(parts[2])}`

  const doctors = ['김지현', '박소연', '이민준']
  return {
    id:     b.id,
    date:   dateKey,
    time:   b.time,
    name:   b.name,
    proc:   b.type,
    type:   typeMap[b.type] || 'consult',
    doctor: doctors[idx % doctors.length],
    line:   b.channel === 'LINE',
    status: statusMap[b.status] || '대기',
    note:   b.note,
  }
}

const INITIAL_BOOKINGS: BookingRow[] = BOOKINGS.map(toBookingRow)

// ────────────────────────────────────────
// 주간 날짜 생성
// ────────────────────────────────────────
function getCurrentWeekDays(weekOffset = 0) {
  const today = new Date(2026, 5, 8) // 2026-06-08 기준 (월요일)
  // 현재 주의 월요일 찾기
  const dow = today.getDay()
  const diff = (dow === 0 ? -6 : 1 - dow)
  const monday = new Date(today)
  monday.setDate(today.getDate() + diff + weekOffset * 7)

  const dayNames = ['월', '화', '수', '목', '금', '토', '일']
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const realToday = new Date(2026, 5, 8)
    realToday.setHours(0, 0, 0, 0)
    d.setHours(0, 0, 0, 0)
    return {
      dayName: dayNames[i],
      dateKey: `${d.getMonth() + 1}/${d.getDate()}`,
      dateNum: String(d.getDate()),
      isToday: d.toDateString() === realToday.toDateString(),
      isSat:   i === 5,
      isSun:   i === 6,
    }
  })
}

// ────────────────────────────────────────
// KPI 계산
// ────────────────────────────────────────
function computeKPI(bookings: BookingRow[]) {
  const realToday = new Date(2026, 5, 8)
  // 이번 주
  const weekDays = getCurrentWeekDays(0).map(d => d.dateKey)
  const weekCount = bookings.filter(b => weekDays.includes(b.date)).length
  // 이번 달
  const monthCount = bookings.filter(b => {
    const parts = b.date.split('/')
    return parseInt(parts[0]) === (realToday.getMonth() + 1)
  }).length
  // 취소율
  const total    = bookings.length
  const cancelled = bookings.filter(b => b.status === '취소').length
  const cancelRate = total > 0 ? `${Math.round((cancelled / total) * 100)}%` : '0%'
  // 평균 리드타임 (목업)
  const leadTime = '3.2일'
  return { weekCount, monthCount, cancelRate, leadTime }
}

// ────────────────────────────────────────
// 환자 목록 (기존 예약에서 추출)
// ────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: '#EEF2FF', tc: '#3730A3' },
  { bg: '#FDF4FF', tc: '#7E22CE' },
  { bg: '#FFF7ED', tc: '#C2410C' },
  { bg: '#ECFDF5', tc: '#065F46' },
  { bg: '#EFF6FF', tc: '#1E40AF' },
]

function getPatientsFromBookings(bookings: BookingRow[]): PatientSuggestion[] {
  const seen = new Set<string>()
  const result: PatientSuggestion[] = []
  bookings.forEach((b, i) => {
    if (!seen.has(b.name)) {
      seen.add(b.name)
      const col = AVATAR_COLORS[i % AVATAR_COLORS.length]
      result.push({
        name: b.name,
        ch:   b.line ? 'LINE' : '사이트폼',
        proc: b.proc,
        init: b.name.charAt(0),
        bg:   col.bg,
        tc:   col.tc,
      })
    }
  })
  return result
}

// ────────────────────────────────────────
// 시간 슬롯
// ────────────────────────────────────────
const SLOT_TIMES: Record<string, string[]> = {
  consult: ['10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'],
  online:  ['09:00','09:30','10:00','10:30','11:00','14:00','14:30','15:00','15:30','16:00'],
  surgery: ['09:00','10:00','11:00','13:00','14:00'],
  checkup: ['10:00','10:30','11:00','14:00','14:30','15:00','16:00'],
  laser:   ['10:00','10:30','11:00','13:00','13:30','14:00','15:00','16:00'],
}

const PROCEDURES = [
  '쌍꺼풀 수술', '코 수술', '눈매교정', '지방흡입', '리프팅',
  '보톡스', '피부 레이저', '성형 수술 기타', '모니터 시술', '경과 확인',
]

const DOCTORS = ['김지현', '박소연', '이민준', '최다은']

// ────────────────────────────────────────
// 메인 컴포넌트
// ────────────────────────────────────────
export default function BookingPage() {
  const [allBookings, setAllBookings] = useState<BookingRow[]>(INITIAL_BOOKINGS)
  const [weekOffset, setWeekOffset]   = useState(0)
  const [filter, setFilter]           = useState<BookingFilter>('all')
  const [toast, setToast]             = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)

  // 상세 모달
  const [detailIdx, setDetailIdx]   = useState<number | null>(null)
  // 편집 모달
  const [editIdx, setEditIdx]       = useState<number | null>(null)
  const [editName, setEditName]     = useState('')
  const [editProc, setEditProc]     = useState('')
  const [editStatus, setEditStatus] = useState('')
  // 예약 등록 모달
  const [showBkModal, setShowBkModal] = useState(false)

  // 예약 등록 폼 상태
  const [bkPatientSearch, setBkPatientSearch] = useState('')
  const [bkPatientResults, setBkPatientResults] = useState<PatientSuggestion[]>([])
  const [bkSelPatient, setBkSelPatient] = useState<PatientSuggestion | null>(null)
  const [bkNameJa, setBkNameJa]     = useState('')
  const [bkNameKo, setBkNameKo]     = useState('')
  const [bkContact, setBkContact]   = useState('')
  const [bkChannel, setBkChannel]   = useState('')
  const [bkType, setBkType]         = useState('')
  const [bkProcedure, setBkProcedure] = useState('')
  const [bkDate, setBkDate]         = useState('')
  const [bkDoctor, setBkDoctor]     = useState('')
  const [bkSelectedTime, setBkSelectedTime] = useState('')
  const [bkMemo, setBkMemo]         = useState('')
  const [bkSendLine, setBkSendLine]     = useState(true)
  const [bkSendReminder, setBkSendReminder] = useState(true)
  const [bkShowPatientDrop, setBkShowPatientDrop] = useState(false)

  const bkFormBodyRef = useRef<HTMLDivElement>(null)
  const [bkShowFade, setBkShowFade] = useState(true)

  function showToast(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  // 주간 날짜
  const weekDays = getCurrentWeekDays(weekOffset)
  const kpi = computeKPI(allBookings)

  // 오늘 날짜 키
  const realToday = new Date(2026, 5, 8)
  const todayKey  = `${realToday.getMonth() + 1}/${realToday.getDate()}`

  // 주간 타이틀
  const weekTitle = (() => {
    const first = weekDays[0]
    const last  = weekDays[6]
    const fParts = first.dateKey.split('/')
    const lParts = last.dateKey.split('/')
    return `2026년 ${fParts[0]}월 ${fParts[1]}일 ~ ${lParts[1]}일`
  })()

  // 테이블 필터
  const filteredBookings = allBookings.filter(b => {
    if (filter === 'all') return true
    return b.type === filter
  })

  // 오늘 일정
  const todayBookings = allBookings
    .filter(b => b.date === todayKey)
    .sort((a, b) => a.time.localeCompare(b.time))

  // 편집 열기
  function openEdit(idx: number) {
    const b = allBookings[idx]
    if (!b) return
    setEditIdx(idx)
    setEditName(b.name)
    setEditProc(b.proc)
    setEditStatus(b.status)
  }

  // 편집 저장
  function saveEdit() {
    if (editIdx === null) return
    setAllBookings(prev => {
      const next = [...prev]
      next[editIdx] = { ...next[editIdx], name: editName, proc: editProc, status: editStatus }
      return next
    })
    setEditIdx(null)
    showToast('✓ 예약이 수정되었습니다.', 'success')
  }

  // 예약 등록 모달 열기
  function openBkModal() {
    const today = new Date(2026, 5, 8)
    const yyyy = today.getFullYear()
    const mm   = String(today.getMonth() + 1).padStart(2, '0')
    const dd   = String(today.getDate()).padStart(2, '0')
    setBkDate(`${yyyy}-${mm}-${dd}`)
    setBkNameJa('')
    setBkNameKo('')
    setBkContact('')
    setBkChannel('')
    setBkType('')
    setBkProcedure('')
    setBkDoctor('')
    setBkSelectedTime('')
    setBkMemo('')
    setBkSendLine(true)
    setBkSendReminder(true)
    setBkPatientSearch('')
    setBkSelPatient(null)
    setBkPatientResults([])
    setBkShowPatientDrop(false)
    setShowBkModal(true)
  }

  // 예약 등록 폼 스크롤 페이드
  useEffect(() => {
    const el = bkFormBodyRef.current
    if (!el) return
    function checkFade() {
      if (!el) return
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10
      setBkShowFade(!atBottom)
    }
    el.addEventListener('scroll', checkFade)
    checkFade()
    return () => el.removeEventListener('scroll', checkFade)
  }, [showBkModal])

  // 환자 검색
  function bkSearchPatient(v: string) {
    setBkPatientSearch(v)
    if (!v.trim()) { setBkShowPatientDrop(false); return }
    const patients = getPatientsFromBookings(allBookings)
    const matched  = patients.filter(p => p.name.includes(v))
    setBkPatientResults(matched.slice(0, 6))
    setBkShowPatientDrop(matched.length > 0)
  }

  function bkSelectPatient(p: PatientSuggestion) {
    setBkPatientSearch(p.name)
    setBkShowPatientDrop(false)
    setBkSelPatient(p)
    setBkNameKo(p.name)
  }

  function bkClearPatient() {
    setBkPatientSearch('')
    setBkSelPatient(null)
    setBkNameJa('')
    setBkNameKo('')
  }

  // 예약된 시간 조회 (날짜+의사 기준)
  function getBookedTimes(dateKey: string, doctor: string | null): string[] {
    return allBookings
      .filter(b => b.date === dateKey && (!doctor || b.doctor === doctor))
      .map(b => b.time)
  }

  // 슬롯 시간 배열
  const currentSlotTimes = SLOT_TIMES[bkType || 'consult'] || SLOT_TIMES.consult
  const bookedTimes: string[] = (() => {
    if (!bkDate) return []
    const parts  = bkDate.split('-')
    const dateKey = `${parseInt(parts[1])}/${parseInt(parts[2])}`
    return getBookedTimes(dateKey, bkDoctor || null)
  })()

  // 예약 등록 제출
  function bkSubmitBooking() {
    if (!bkNameJa.trim()) { showToast('환자 성명(일본어)을 입력해주세요.', 'error'); return }
    if (!bkType)          { showToast('예약 유형을 선택해주세요.', 'error'); return }
    if (!bkDate)          { showToast('예약 날짜를 선택해주세요.', 'error'); return }
    if (!bkSelectedTime)  { showToast('예약 시간을 선택해주세요.', 'error'); return }

    const parts   = bkDate.split('-')
    const dateKey = `${parseInt(parts[1])}/${parseInt(parts[2])}`
    const typeMap: Record<string, string> = {
      consult: 'consult', online: 'online', surgery: 'auto', checkup: 'visit', laser: 'auto',
    }
    const newBk: BookingRow = {
      id:     allBookings.length + 1,
      date:   dateKey,
      time:   bkSelectedTime,
      name:   bkNameKo || bkNameJa,
      proc:   bkProcedure || '미정',
      type:   typeMap[bkType] || 'consult',
      doctor: bkDoctor || '미배정',
      line:   bkSendLine,
      status: '확정',
      note:   bkMemo || undefined,
    }
    setAllBookings(prev => [...prev, newBk])
    setShowBkModal(false)
    showToast(`✓ ${dateKey} ${bkSelectedTime} — ${bkNameKo || bkNameJa} 예약 등록 완료`, 'success')
  }

  // CSV 내보내기
  function exportCSV() {
    let rows = '날짜,시간,환자명,시술,유형,담당 의사,LINE 발송,상태\n'
    filteredBookings.forEach(b => {
      rows += [b.date, b.time, b.name, b.proc, TYPE_LABELS[b.type] || b.type, b.doctor, b.line ? 'O' : 'X', b.status].join(',') + '\n'
    })
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent('﻿' + rows)
    a.download = 'bookings.csv'
    a.click()
    showToast('✓ CSV 다운로드 완료', 'success')
  }

  return (
    <>
      {/* ── 탑바 ── */}
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/" className="topbar-back">← 대시보드</Link>
          <span className="topbar-sep">/</span>
          <span className="topbar-title">예약 관리</span>
        </div>
        <div className="topbar-right">
          <Link href="/crm" className="btn" style={{ fontSize: 13 }}>← CRM 인박스</Link>
          <button className="btn btn-primary" onClick={openBkModal}>+ 예약 등록</button>
        </div>
      </div>

      <div className="content fade">

        {/* ── KPI 4개 ── */}
        <div className="kpi-grid" style={{ marginBottom: 16 }}>
          {[
            { lbl: '이번 주 예약',  num: `${kpi.weekCount}건`,  dl: '',          cls: 'neu' },
            { lbl: '이번 달 예약',  num: `${kpi.monthCount}건`, dl: '',          cls: 'neu' },
            { lbl: '취소율',        num: kpi.cancelRate,        dl: '취소 기준', cls: 'down' },
            { lbl: '평균 리드타임', num: kpi.leadTime,          dl: '문의→예약', cls: 'neu' },
          ].map(item => (
            <div className="card" key={item.lbl}>
              <div style={{ fontSize: 12, color: 'var(--s400)', marginBottom: 2 }}>{item.lbl}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)', margin: '6px 0 3px', letterSpacing: '-.5px' }}>{item.num}</div>
              <div style={{ fontSize: 12, color: item.cls === 'down' ? 'var(--red)' : 'var(--s400)' }}>{item.dl}</div>
            </div>
          ))}
        </div>

        {/* ── 주간 캘린더 + 오늘 일정 ── */}
        <div className="grid2" style={{ marginBottom: 14 }}>
          {/* 캘린더 */}
          <div style={{ background: '#fff', border: '1px solid var(--s200)', borderRadius: 'var(--rl)', padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <button
                onClick={() => setWeekOffset(w => w - 1)}
                style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--s200)', background: '#fff', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >‹</button>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{weekTitle}</div>
              <button
                onClick={() => setWeekOffset(w => w + 1)}
                style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--s200)', background: '#fff', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >›</button>
            </div>
            {/* 7일 컬럼 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
              {weekDays.map(day => {
                const dayBks = allBookings.filter(b => b.date === day.dateKey)
                const nameColor = day.isSat ? '#2563EB' : day.isSun ? '#DC2626' : 'var(--s400)'
                return (
                  <div key={day.dateKey} style={{ minHeight: 80 }}>
                    <div style={{ textAlign: 'center', marginBottom: 6 }}>
                      <div style={{ fontSize: 10, color: nameColor, fontWeight: 500 }}>{day.dayName}</div>
                      <div style={{
                        fontSize: 14, fontWeight: 600, color: day.isToday ? '#fff' : 'var(--s700)',
                        width: 26, height: 26, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '2px auto',
                        background: day.isToday ? 'var(--navy)' : 'transparent',
                      }}>{day.dateNum}</div>
                    </div>
                    {dayBks.slice(0, 3).map((b, bi) => {
                      const tc = TYPE_COLORS[b.type] || { bg: '#F3F4F6', tc: '#374151' }
                      const bIdx = allBookings.indexOf(b)
                      return (
                        <div
                          key={bi}
                          onClick={() => setDetailIdx(bIdx)}
                          style={{
                            fontSize: 10, padding: '2px 5px', borderRadius: 5, marginBottom: 2,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            cursor: 'pointer', background: tc.bg, color: tc.tc,
                          }}
                        >
                          {b.time.split(':')[0]}시 {b.name.split(' ')[0]}
                        </div>
                      )
                    })}
                    {dayBks.length > 3 && (
                      <div style={{ fontSize: 10, color: 'var(--s400)', paddingLeft: 5 }}>+{dayBks.length - 3}건</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 오늘 일정 */}
          <div style={{ background: '#fff', border: '1px solid var(--s200)', borderRadius: 'var(--rl)', padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>오늘 일정</div>
              <div style={{ fontSize: 12, color: 'var(--s400)' }}>
                {realToday.getMonth() + 1}월 {realToday.getDate()}일
              </div>
            </div>
            {todayBookings.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--s400)', paddingTop: 10 }}>오늘 예약 없음</div>
            ) : (
              todayBookings.map(tb => {
                const tc   = TYPE_COLORS[tb.type] || { bg: '#F3F4F6', tc: '#374151' }
                const tIdx = allBookings.indexOf(tb)
                return (
                  <div
                    key={tb.id}
                    onClick={() => setDetailIdx(tIdx)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', minWidth: 38 }}>{tb.time}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{tb.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--s400)' }}>{tb.proc}</div>
                    </div>
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 5, background: tc.bg, color: tc.tc, fontWeight: 600 }}>
                      {TYPE_LABELS[tb.type] || tb.type}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ── 전체 예약 리스트 ── */}
        <div style={{ background: '#fff', border: '1px solid var(--s200)', borderRadius: 'var(--rl)', marginTop: 14, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--s100)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>전체 예약 리스트</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="filter-pills" style={{ margin: 0 }}>
                {([
                  ['all',     '전체'],
                  ['consult', '상담'],
                  ['online',  '비대면'],
                  ['visit',   '내원'],
                  ['auto',    '시술'],
                ] as [BookingFilter, string][]).map(([f, l]) => (
                  <button
                    key={f}
                    className={`pill${filter === f ? ' on' : ''}`}
                    onClick={() => setFilter(f)}
                  >{l}</button>
                ))}
              </div>
              <button className="btn" style={{ fontSize: 12 }} onClick={exportCSV}>📥 CSV</button>
            </div>
          </div>
          <table className="table" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: 70 }}>날짜</th>
                <th style={{ width: 60 }}>시간</th>
                <th style={{ width: 130 }}>환자명</th>
                <th style={{ width: 130 }}>시술</th>
                <th style={{ width: 80 }}>유형</th>
                <th style={{ width: 100 }}>담당 의사</th>
                <th style={{ width: 90 }}>LINE 발송</th>
                <th style={{ width: 80 }}>상태</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b, i) => {
                const tc  = TYPE_COLORS[b.type] || { bg: '#F3F4F6', tc: '#374151' }
                const sc  = statusChipStyle(b.status)
                const idx = allBookings.indexOf(b)
                return (
                  <tr
                    key={b.id}
                    onClick={() => setDetailIdx(idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 500, color: 'var(--navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.date}</td>
                    <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.time}</td>
                    <td style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</td>
                    <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.proc}</td>
                    <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 6, fontWeight: 500, background: tc.bg, color: tc.tc }}>
                        {TYPE_LABELS[b.type] || b.type}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--s600)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.doctor}</td>
                    <td style={{ textAlign: 'center' }}>
                      {b.line
                        ? <span style={{ color: '#059669', fontSize: 13 }}>✓</span>
                        : <span style={{ color: '#D1D5DB', fontSize: 13 }}>—</span>
                      }
                    </td>
                    <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 6, fontWeight: 500, background: sc.sbc, color: sc.stc }}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn"
                        style={{ fontSize: 12, padding: '3px 9px' }}
                        onClick={e => { e.stopPropagation(); openEdit(idx) }}
                      >편집</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <footer className="site-footer">© 2026 MEDIFLOW. All rights reserved.</footer>
      </div>

      {/* ── 상세 모달 ── */}
      {detailIdx !== null && allBookings[detailIdx] && (() => {
        const b  = allBookings[detailIdx]
        const sc = statusChipStyle(b.status)
        const tc = TYPE_COLORS[b.type] || { bg: '#F3F4F6', tc: '#374151' }
        return (
          <div
            onClick={() => setDetailIdx(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 14 }}>
                📅 예약 상세 — {b.name}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13, marginBottom: 20 }}>
                {[
                  ['날짜', b.date],
                  ['시간', b.time],
                  ['환자명', b.name],
                  ['시술', b.proc],
                  ['담당 의사', b.doctor],
                  ['LINE', b.line ? '발송 완료 ✓' : '미발송'],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', marginBottom: 2 }}>{label}</div>
                    <div style={{ color: '#374151' }}>{val}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 6, fontWeight: 500, background: tc.bg, color: tc.tc, marginRight: 6 }}>
                  {TYPE_LABELS[b.type] || b.type}
                </span>
                <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 6, fontWeight: 500, background: sc.sbc, color: sc.stc }}>
                  {b.status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn" onClick={() => setDetailIdx(null)}>닫기</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── 편집 모달 ── */}
      {editIdx !== null && (
        <div
          onClick={() => setEditIdx(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 14 }}>
              ✏ 예약 편집 — {allBookings[editIdx]?.name}
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>환자명</label>
              <input
                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid var(--s200)', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', color: 'var(--s700)' }}
                value={editName}
                onChange={e => setEditName(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>시술</label>
              <input
                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid var(--s200)', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', color: 'var(--s700)' }}
                value={editProc}
                onChange={e => setEditProc(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>상태</label>
              <select
                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid var(--s200)', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', color: 'var(--s700)', background: '#fff' }}
                value={editStatus}
                onChange={e => setEditStatus(e.target.value)}
              >
                {['대기', '확정', '완료', '취소'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setEditIdx(null)}>취소</button>
              <button className="btn btn-primary" onClick={saveEdit}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 예약 등록 모달 ── */}
      {showBkModal && (
        <div
          onClick={() => setShowBkModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 9000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 640, maxHeight: '90vh', margin: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.25)', display: 'flex', flexDirection: 'column', position: 'relative' }}
          >
            {/* 헤더 */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--s100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>📅 예약 등록</div>
              <button
                onClick={() => setShowBkModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--s400)', padding: 4, lineHeight: 1 }}
              >✕</button>
            </div>

            {/* 바디 */}
            <div ref={bkFormBodyRef} style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>

              {/* 환자 정보 섹션 */}
              <div style={{ background: '#fff', border: '1px solid var(--s200)', borderRadius: 'var(--rl)', padding: '18px 20px', marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 16 }}>👤 환자 정보</div>

                {/* 환자 검색 */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--s700)', marginBottom: 5 }}>
                    기존 환자 검색 <span style={{ fontSize: 12, color: 'var(--s400)', fontWeight: 400 }}>이름으로 검색</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--s200)', borderRadius: 'var(--r)', fontSize: 13, fontFamily: 'inherit', outline: 'none', color: 'var(--s700)', background: '#fff' }}
                      placeholder="예) 야마다"
                      value={bkPatientSearch}
                      onChange={e => bkSearchPatient(e.target.value)}
                      autoComplete="off"
                    />
                    {bkShowPatientDrop && bkPatientResults.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid var(--s200)', borderRadius: 'var(--r)', boxShadow: '0 4px 16px rgba(0,0,0,.08)', zIndex: 10, marginTop: 3 }}>
                        {bkPatientResults.map((p, pi) => (
                          <div
                            key={pi}
                            onClick={() => bkSelectPatient(p)}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', cursor: 'pointer', borderBottom: '1px solid var(--s100)' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--s50)')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                          >
                            <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0, background: p.bg, color: p.tc }}>
                              {p.init}
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                              <div style={{ fontSize: 12, color: 'var(--s400)' }}>{p.ch} · {p.proc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {bkSelPatient && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--navy-l)', border: '1px solid var(--blue)', borderRadius: 'var(--r)', marginTop: 6 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0, background: bkSelPatient.bg, color: bkSelPatient.tc }}>
                        {bkSelPatient.init}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--navy)' }}>{bkSelPatient.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--s500)' }}>{bkSelPatient.ch} · {bkSelPatient.proc}</div>
                      </div>
                      <button className="btn" style={{ fontSize: 12, padding: '3px 9px' }} onClick={bkClearPatient}>✕ 해제</button>
                    </div>
                  )}
                </div>

                {/* 구분선 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--s100)' }}></div>
                  <span style={{ fontSize: 12, color: 'var(--s400)' }}>또는 신규 환자 직접 입력</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--s100)' }}></div>
                </div>

                {/* 신규 입력 그리드 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--s700)', marginBottom: 5 }}>
                      성명 (일본어)<span style={{ color: 'var(--red)', marginLeft: 2 }}>*</span>
                    </div>
                    <input
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--s200)', borderRadius: 'var(--r)', fontSize: 13, fontFamily: 'inherit', outline: 'none', color: 'var(--s700)' }}
                      placeholder="山田 沙織"
                      value={bkNameJa}
                      onChange={e => setBkNameJa(e.target.value)}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--s700)', marginBottom: 5 }}>성명 (한국어)</div>
                    <input
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--s200)', borderRadius: 'var(--r)', fontSize: 13, fontFamily: 'inherit', outline: 'none', color: 'var(--s700)' }}
                      placeholder="야마다 사오리"
                      value={bkNameKo}
                      onChange={e => setBkNameKo(e.target.value)}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--s700)', marginBottom: 5 }}>연락처 (LINE ID / Instagram ID)</div>
                    <input
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--s200)', borderRadius: 'var(--r)', fontSize: 13, fontFamily: 'inherit', outline: 'none', color: 'var(--s700)' }}
                      placeholder="@yamada_saori"
                      value={bkContact}
                      onChange={e => setBkContact(e.target.value)}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--s700)', marginBottom: 5 }}>유입 채널</div>
                    <select
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--s200)', borderRadius: 'var(--r)', fontSize: 13, fontFamily: 'inherit', outline: 'none', color: 'var(--s700)', background: '#fff' }}
                      value={bkChannel}
                      onChange={e => setBkChannel(e.target.value)}
                    >
                      <option value="">선택</option>
                      <option value="LINE">LINE</option>
                      <option value="Instagram">Instagram</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 예약 정보 섹션 */}
              <div style={{ background: '#fff', border: '1px solid var(--s200)', borderRadius: 'var(--rl)', padding: '18px 20px', marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 16 }}>📅 예약 정보</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--s700)', marginBottom: 5 }}>
                      예약 유형<span style={{ color: 'var(--red)', marginLeft: 2 }}>*</span>
                    </div>
                    <select
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--s200)', borderRadius: 'var(--r)', fontSize: 13, fontFamily: 'inherit', outline: 'none', color: 'var(--s700)', background: '#fff' }}
                      value={bkType}
                      onChange={e => { setBkType(e.target.value); setBkSelectedTime('') }}
                    >
                      <option value="">선택</option>
                      <option value="consult">상담 (카운슬링)</option>
                      <option value="online">비대면 상담</option>
                      <option value="surgery">수술</option>
                      <option value="checkup">사후 체크업</option>
                      <option value="laser">시술 (레이저 등)</option>
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--s700)', marginBottom: 5 }}>관심 시술</div>
                    <select
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--s200)', borderRadius: 'var(--r)', fontSize: 13, fontFamily: 'inherit', outline: 'none', color: 'var(--s700)', background: '#fff' }}
                      value={bkProcedure}
                      onChange={e => setBkProcedure(e.target.value)}
                    >
                      <option value="">선택</option>
                      {PROCEDURES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--s700)', marginBottom: 5 }}>
                      예약 날짜<span style={{ color: 'var(--red)', marginLeft: 2 }}>*</span>
                    </div>
                    <input
                      type="date"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--s200)', borderRadius: 'var(--r)', fontSize: 13, fontFamily: 'inherit', outline: 'none', color: 'var(--s700)' }}
                      value={bkDate}
                      onChange={e => { setBkDate(e.target.value); setBkSelectedTime('') }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--s700)', marginBottom: 5 }}>담당 의사</div>
                    <select
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--s200)', borderRadius: 'var(--r)', fontSize: 13, fontFamily: 'inherit', outline: 'none', color: 'var(--s700)', background: '#fff' }}
                      value={bkDoctor}
                      onChange={e => { setBkDoctor(e.target.value); setBkSelectedTime('') }}
                    >
                      <option value="">배정 없음</option>
                      {DOCTORS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                {/* 시간 슬롯 */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--s700)', marginBottom: 5 }}>
                    예약 시간<span style={{ color: 'var(--red)', marginLeft: 2 }}>*</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6, marginTop: 6 }}>
                    {currentSlotTimes.map(t => {
                      const isBooked = bookedTimes.includes(t)
                      const isOn     = bkSelectedTime === t
                      return (
                        <div
                          key={t}
                          onClick={() => { if (!isBooked) setBkSelectedTime(t) }}
                          style={{
                            padding: '7px 4px', textAlign: 'center',
                            border: `1px solid ${isOn ? 'var(--navy)' : isBooked ? 'var(--s200)' : 'var(--s200)'}`,
                            borderRadius: 'var(--r)', fontSize: 12, cursor: isBooked ? 'not-allowed' : 'pointer',
                            color: isOn ? '#fff' : isBooked ? 'var(--s300)' : 'var(--s600)',
                            background: isOn ? 'var(--navy)' : isBooked ? 'var(--s100)' : '#fff',
                            fontWeight: isOn ? 500 : 400,
                            transition: 'all .15s',
                          }}
                        >
                          {t}
                          {isBooked && <div style={{ fontSize: 9 }}>예약됨</div>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* 메모 및 알림 섹션 */}
              <div style={{ background: '#fff', border: '1px solid var(--s200)', borderRadius: 'var(--rl)', padding: '18px 20px', marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 16 }}>📝 메모 및 알림</div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--s700)', marginBottom: 5 }}>내부 메모</div>
                  <textarea
                    rows={3}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--s200)', borderRadius: 'var(--r)', fontSize: 13, fontFamily: 'inherit', outline: 'none', color: 'var(--s700)', resize: 'vertical', lineHeight: 1.6 }}
                    placeholder="예) 일본어 전담 스탭 배정 필요 · 이전 상담 내용 참고"
                    value={bkMemo}
                    onChange={e => setBkMemo(e.target.value)}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--s700)', marginBottom: 5 }}>LINE 확정 메시지 발송</div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--s50)', borderRadius: 'var(--r)', fontSize: 12, color: 'var(--s700)', cursor: 'pointer', marginBottom: 6 }}>
                    <input
                      type="checkbox"
                      checked={bkSendLine}
                      onChange={e => setBkSendLine(e.target.checked)}
                      style={{ width: 14, height: 14, accentColor: 'var(--navy)' }}
                    />
                    예약 등록 즉시 LINE으로 확정 메시지 자동 발송
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--s50)', borderRadius: 'var(--r)', fontSize: 12, color: 'var(--s700)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={bkSendReminder}
                      onChange={e => setBkSendReminder(e.target.checked)}
                      style={{ width: 14, height: 14, accentColor: 'var(--navy)' }}
                    />
                    예약 전일 오전 10시 리마인더 발송
                  </label>
                </div>
              </div>
            </div>

            {/* 페이드 그라데이션 */}
            {bkShowFade && (
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 62, height: 64, background: 'linear-gradient(transparent,rgba(255,255,255,.97))', pointerEvents: 'none', borderRadius: '0 0 0 0' }} />
            )}

            {/* 푸터 */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--s100)', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
              <button className="btn" onClick={() => setShowBkModal(false)}>취소</button>
              <button className="btn btn-primary" onClick={bkSubmitBooking}>📅 예약 등록</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 토스트 ── */}
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
