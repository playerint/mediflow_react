'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

/* ── 타입 ── */
type SecStatus   = 'collected' | 'ai_gen' | 'no_image' | 'done' | 'pending'
type TransStatus = 'none' | 'ai' | 'review' | 'done'

interface LangOption { code: string; flag: string; label: string; name: string }
const LANG_OPTIONS: LangOption[] = [
  { code: 'ja',    flag: '🇯🇵', label: '日本語',    name: '일본어'      },
  { code: 'en',    flag: '🇺🇸', label: 'English',   name: '영어'        },
  { code: 'th',    flag: '🇹🇭', label: 'ภาษาไทย', name: '태국어'      },
  { code: 'zh-CN', flag: '🇨🇳', label: '简体中文',  name: '중국어 간체' },
  { code: 'zh-TW', flag: '🇹🇼', label: '繁體中文',  name: '중국어 번체' },
]

interface Field {
  id:    string
  label: string
  ko:    string
  ja:    string
  ts:    TransStatus
}
interface Section {
  id:     string
  num:    string
  name:   string
  icon:   string
  status: SecStatus
  hasImage?: boolean   // 대표 이미지 업로드 존 표시 여부
  noImageWarning?: boolean  // 이미지 없음 경고 배너 표시
  fields: Field[]
}

/* ── 상태 맵 ── */
const STATUS_MAP: Record<SecStatus, { cls: string; label: string }> = {
  collected: { cls: 'chip-gray',  label: '수집됨'      },
  ai_gen:    { cls: 'chip-gray',  label: 'AI 생성'     },
  no_image:  { cls: 'chip-red',   label: '이미지 없음' },
  done:      { cls: 'chip-light', label: '완료'        },
  pending:   { cls: 'chip-gray',  label: '검수 대기'   },
}
const TRANS_MAP: Record<TransStatus, { cls: string; label: string }> = {
  none:   { cls: 'ts-none',   label: '미번역'    },
  ai:     { cls: 'ts-ai',     label: 'AI 의역'   },
  review: { cls: 'ts-review', label: '검수 대기' },
  done:   { cls: 'ts-done',   label: '완료'      },
}

/* ── 섹션 데이터 ── */
const SECTIONS: Section[] = [
  {
    id: 'hero', num: '01', name: 'Hero', icon: '🏠', status: 'collected', hasImage: true,
    fields: [
      { id: 'hero-headline',    label: '헤드라인 카피',    ts: 'ai',
        ko: '자연스러운 아름다움을 찾아드립니다',
        ja: '自然な美しさをお届けします' },
      { id: 'hero-subtext',     label: '서브텍스트',       ts: 'review',
        ko: '일본어 전담 상담팀이 함께합니다.',
        ja: '日本語専属スタッフがご対応します。' },
      { id: 'hero-lineBtn',     label: 'LINE 버튼 텍스트', ts: 'done',
        ko: 'LINE으로 무료 상담',
        ja: 'LINEで無料相談' },
      { id: 'hero-decisionBtn', label: '불안 선택 버튼',   ts: 'done',
        ko: '고민 유형으로 찾기',
        ja: 'お悩みから探す' },
    ],
  },
  {
    id: 'decision', num: '02', name: 'DECISION GUIDE', icon: '🧭', status: 'ai_gen',
    fields: [
      { id: 'dec1', label: '불안 요소 1', ts: 'ai',
        ko: '눈이 작아 보이고 피곤해 보인다는 말을 자주 들으신다면',
        ja: '目が小さく疲れて見えると言われることが多い方へ' },
      { id: 'dec2', label: '불안 요소 2', ts: 'ai',
        ko: '코가 낮거나 콧끝이 뭉툭해서 고민이시라면',
        ja: '鼻が低い、または鼻先が丸くてお悩みの方へ' },
    ],
  },
  {
    id: 'doctors', num: '03', name: '의사 소개', icon: '👨‍⚕️', status: 'collected',
    fields: [
      { id: 'dr1-name',  label: '원장 이름',  ts: 'done',
        ko: '김성형',       ja: 'キム・ソンヒョン' },
      { id: 'dr1-title', label: '원장 직함',  ts: 'done',
        ko: '대표원장 · 성형외과 전문의 20년',
        ja: '代表院長 · 美容外科専門医20年' },
    ],
  },
  {
    id: 'treatments', num: '04', name: '시술 메뉴', icon: '💉', status: 'pending',
    fields: [
      { id: 'treat1-name',  label: '시술명 — 쌍꺼풀',    ts: 'done',
        ko: '쌍꺼풀',            ja: '二重手術' },
      { id: 'treat1-brief', label: '한줄 요약 — 쌍꺼풀', ts: 'review',
        ko: '매몰법 ₩400,000~ / 절개법 ₩800,000~',
        ja: '埋没法 ₩400,000〜 / 切開法 ₩800,000〜' },
    ],
  },
  {
    id: 'cases', num: '05', name: 'REAL CASES', icon: '📸', status: 'no_image', noImageWarning: true,
    fields: [
      { id: 'case1-desc', label: 'CASE 1 설명', ts: 'ai',
        ko: '쌍꺼풀 절개법 · 30대 여성 · 다운타임 7일',
        ja: '切開二重 · 30代女性 · ダウンタイム7日' },
    ],
  },
  {
    id: 'reviews', num: '06', name: 'REAL REVIEWS', icon: '⭐', status: 'no_image', noImageWarning: true,
    fields: [
      { id: 'rev1', label: '후기 1', ts: 'review',
        ko: '상담부터 시술까지 일본어로 소통할 수 있어서 안심했어요.',
        ja: 'カウンセリングから施術まで日本語で安心して受けられました。' },
    ],
  },
  {
    id: 'faq', num: '07', name: 'FAQ', icon: '❓', status: 'done',
    fields: [
      { id: 'faq1-q', label: 'Q1 — 질문', ts: 'done',
        ko: '한국어를 못해도 괜찮나요?',
        ja: '韓国語が話せなくても大丈夫ですか？' },
      { id: 'faq1-a', label: 'A1 — 답변', ts: 'done',
        ko: '네, 일본어 전담 상담사가 상주합니다.',
        ja: 'はい、日本語専属スタッフが常駐しております。' },
    ],
  },
  {
    id: 'guarantee', num: '08', name: '서비스 보장', icon: '🛡', status: 'collected',
    fields: [
      { id: 'guar1', label: '보장 항목 1', ts: 'ai',
        ko: '일본어 전담 코디네이터 무료 지원',
        ja: '日本語専属コーディネーター無料サポート' },
    ],
  },
  {
    id: 'consult', num: '09', name: '무료 상담 시작', icon: '💬', status: 'collected',
    fields: [
      { id: 'consult-btn', label: 'CTA 버튼 텍스트', ts: 'done',
        ko: 'LINE으로 편하게 문의해 주세요. 24시간 접수 가능합니다.',
        ja: 'LINEでお気軽にお問い合わせください。24時間受付中です。' },
    ],
  },
  {
    id: 'footer', num: '10', name: '푸터', icon: '📌', status: 'collected',
    fields: [
      { id: 'footer-addr', label: '주소', ts: 'done',
        ko: '서울시 강남구 테헤란로 123. 강남역 3번 출구 도보 5분.',
        ja: 'ソウル市江南区テヘラン路123。江南駅3番出口から徒歩5分。' },
    ],
  },
]

/* ── 이미지 라이브러리 (mock) ── */
const MOCK_ASSETS = [
  { id: 0, em: '👁', lb: '눈성형_전후_01.jpg',  cat: 'B/A'   },
  { id: 1, em: '👁', lb: '눈성형_전후_02.jpg',  cat: 'B/A'   },
  { id: 2, em: '👃', lb: '코성형_전후_01.jpg',  cat: 'B/A'   },
  { id: 3, em: '👃', lb: '코성형_전후_02.jpg',  cat: 'B/A'   },
  { id: 4, em: '✨', lb: '윤곽_전후_01.jpg',    cat: 'B/A'   },
  { id: 5, em: '👨‍⚕️', lb: '김원장_프로필.jpg', cat: '의료진' },
  { id: 6, em: '👩‍⚕️', lb: '이수진_원장.jpg',  cat: '의료진' },
  { id: 7, em: '🏥', lb: '외관_정면.jpg',       cat: '시설'  },
  { id: 8, em: '🛋', lb: '상담실_01.jpg',       cat: '시설'  },
  { id: 9, em: '💊', lb: '수술실_01.jpg',       cat: '시설'  },
]

/* ── AI 의역 Mock 결과 ── */
const AI_MOCK: Record<string, string> = {
  'hero-headline':    '自然な美しさを、あなたへ。',
  'hero-subtext':     '日本語専属スタッフが丁寧にサポートいたします。',
  'hero-lineBtn':     'LINEで無料相談する',
  'hero-decisionBtn': 'お悩みから探す',
  'dec1': '目が小さく、疲れた印象と言われることが多い方へ',
  'dec2': '鼻が低い・鼻先が丸いとお悩みの方へ',
  'dr1-name':   'キム・ソンヒョン',
  'dr1-title':  '代表院長 · 美容外科専門医 経歴20年',
  'treat1-name':  '二重整形',
  'treat1-brief': '埋没法 ₩400,000〜 / 切開法 ₩800,000〜',
  'case1-desc': '切開二重術 · 30代女性 · ダウンタイム約7日',
  'rev1':       'カウンセリングから施術まで、日本語で安心して受けられました。スタッフの方が優しく対応してくださり、とても満足しています。',
  'faq1-q': '韓国語が話せなくても大丈夫ですか？',
  'faq1-a': 'はい、日本語専属スタッフが常駐しておりますので、ご安心ください。',
  'guar1':  '日本語専属コーディネーター、無料でご利用いただけます。',
  'consult-btn': 'LINEでお気軽にご相談ください。24時間受付中です。',
  'footer-addr': 'ソウル市江南区テヘラン路123番地。江南駅3番出口より徒歩5分。',
}

/* ════════════════════════════════════════
   Page Component
════════════════════════════════════════ */
export default function SiteContentPage() {
  const [selected,   setSelected]  = useState<Section>(SECTIONS[0])
  const [jaValues,   setJaValues]  = useState<Record<string, string>>(
    Object.fromEntries(SECTIONS.flatMap(s => s.fields.map(f => [f.id, f.ja])))
  )
  const [aiLoading,  setAiLoading] = useState<Record<string, boolean>>({})
  const [tsValues,   setTsValues]  = useState<Record<string, TransStatus>>(
    Object.fromEntries(SECTIONS.flatMap(s => s.fields.map(f => [f.id, f.ts])))
  )
  const [toast,      setToast]     = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)

  /* 언어 선택기 */
  const [curLang,  setCurLang]  = useState<LangOption>(LANG_OPTIONS[0])
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)

  /* 이미지 피커 모달 */
  const [imgPickerOpen, setImgPickerOpen] = useState(false)
  const [imgPickerSel,  setImgPickerSel]  = useState<number | null>(null)
  const [heroImage,     setHeroImage]     = useState<{ url: string; name: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* 발행 확인 모달 */
  const [publishModal, setPublishModal] = useState(false)

  /* 언어 선택기 외부 클릭 닫기 */
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  /* ── 토스트 ── */
  function showToast(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  /* ── 저장 ── */
  function handleSave() {
    showToast('✓ 저장되었습니다.')
  }

  /* ── 번역 상태 변경 ── */
  const TS_NEXT: Record<TransStatus, TransStatus> = {
    none: 'review', ai: 'review', review: 'done', done: 'review',
  }
  const TS_ACTION: Record<TransStatus, string> = {
    none: '검수 요청', ai: '검수 요청', review: '검수 완료', done: '재검수',
  }
  function handleTsChange(fieldId: string) {
    setTsValues(prev => {
      const next = TS_NEXT[prev[fieldId] ?? 'none']
      const label = next === 'done' ? '✓ 검수 완료' : '검수 대기로 변경'
      showToast(label)
      return { ...prev, [fieldId]: next }
    })
  }

  /* ── AI 의역 (단일 필드) ── */
  function handleAiTranslate(fieldId: string) {
    setAiLoading(p => ({ ...p, [fieldId]: true }))
    setTimeout(() => {
      const result = AI_MOCK[fieldId] || jaValues[fieldId] + ' (의역됨)'
      setJaValues(p => ({ ...p, [fieldId]: result }))
      setTsValues(p => ({ ...p, [fieldId]: 'ai' }))
      setAiLoading(p => ({ ...p, [fieldId]: false }))
      showToast('✓ AI 의역 완료 — 검수 후 완료로 변경하세요.')
    }, 1200)
  }

  /* ── AI 전체 의역 (현재 섹션 모든 필드) ── */
  function handleAiTranslateAll() {
    const fieldIds = selected.fields.map(f => f.id)
    const loadingMap = Object.fromEntries(fieldIds.map(id => [id, true]))
    setAiLoading(p => ({ ...p, ...loadingMap }))
    setTimeout(() => {
      const updates = Object.fromEntries(
        fieldIds.map(id => [id, AI_MOCK[id] || jaValues[id] + ' (의역됨)'])
      )
      setJaValues(p => ({ ...p, ...updates }))
      setAiLoading(p => Object.fromEntries(fieldIds.map(id => [id, false])))
      showToast(`✓ ${fieldIds.length}개 필드 AI 의역 완료`)
    }, 1500)
  }

  /* ── 이미지 피커 ── */
  function openImgPicker() {
    setImgPickerSel(null)
    setImgPickerOpen(true)
  }
  function toggleImgSel(idx: number) {
    setImgPickerSel(prev => prev === idx ? null : idx)
  }
  function confirmImgPick() {
    if (imgPickerSel === null) return
    const asset = MOCK_ASSETS[imgPickerSel]
    setHeroImage({ url: asset.em, name: asset.lb })
    setImgPickerOpen(false)
    setImgPickerSel(null)
    showToast('✓ 대표 이미지가 설정되었습니다.')
  }
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setHeroImage({ url, name: file.name })
    setImgPickerOpen(false)
    setImgPickerSel(null)
    showToast(`✓ "${file.name}" 업로드 완료`)
    e.target.value = ''
  }

  /* ── 발행 ── */
  function handlePublish() {
    setPublishModal(false)
    showToast('🚀 발행 완료! 사이트에 반영되었습니다.')
  }

  /* ── 번역 현황 집계 ── */
  const allFields = SECTIONS.flatMap(s => s.fields)
  const counts = allFields.reduce((acc, f) => {
    const ts = tsValues[f.id] ?? f.ts
    acc[ts] = (acc[ts] || 0) + 1
    return acc
  }, {} as Record<TransStatus, number>)
  const transPct = Math.round(((counts.done || 0) / allFields.length) * 100)

  const toastBg = toast?.type === 'success' ? '#059669' : toast?.type === 'error' ? '#DC2626' : '#0D1B3E'

  return (
    <>
      {/* ── 토스트 ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          background: toastBg, color: '#fff', padding: '11px 22px', borderRadius: 10,
          fontSize: 13, fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,.2)',
          zIndex: 9999, whiteSpace: 'nowrap', animation: 'fadeInUp .2s ease',
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── 이미지 피커 모달 ── */}
      {imgPickerOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 9100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) { setImgPickerOpen(false) } }}
        >
          <div style={{ background: '#fff', borderRadius: 16, width: 640, maxWidth: '95vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}>
            {/* 헤더 */}
            <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--s100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>이미지 추가</div>
              <button onClick={() => setImgPickerOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--s400)', lineHeight: 1 }}>✕</button>
            </div>
            {/* 업로드 존 */}
            <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--s100)', flexShrink: 0 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <div
                className="img-upload-opt"
                style={{ padding: 12, maxWidth: '100%' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div style={{ fontSize: 20 }}>📁</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--s700)' }}>새 이미지 업로드</div>
                <div style={{ fontSize: 11, color: 'var(--s400)' }}>PNG, JPG, WebP · 최대 10MB</div>
              </div>
            </div>
            {/* 라이브러리 */}
            <div style={{ padding: '12px 22px 0', fontSize: 10, fontWeight: 700, color: 'var(--s400)', textTransform: 'uppercase', letterSpacing: '.06em', flexShrink: 0 }}>이미지 라이브러리</div>
            <div style={{ overflowY: 'auto', padding: '10px 22px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
              {MOCK_ASSETS.map(a => {
                const sel = imgPickerSel === a.id
                return (
                  <div
                    key={a.id}
                    onClick={() => toggleImgSel(a.id)}
                    style={{ border: `2px solid ${sel ? 'var(--navy)' : 'var(--s200)'}`, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', background: sel ? 'var(--navy-l)' : '#fff', position: 'relative' }}
                  >
                    {sel && (
                      <div style={{ position: 'absolute', top: 5, right: 5, width: 16, height: 16, borderRadius: '50%', background: 'var(--navy)', color: '#fff', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
                    )}
                    <div style={{ height: 64, background: 'var(--s100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{a.em}</div>
                    <div style={{ padding: '4px 6px' }}>
                      <div style={{ fontSize: 10, color: 'var(--s700)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.lb}</div>
                      <div style={{ fontSize: 9, color: 'var(--s400)', marginTop: 1 }}>{a.cat}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            {/* 푸터 */}
            <div style={{ padding: '12px 22px', borderTop: '1px solid var(--s100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: 'var(--s50)' }}>
              <span style={{ fontSize: 12, color: 'var(--s500)' }}>
                {imgPickerSel !== null ? `"${MOCK_ASSETS[imgPickerSel].lb}" 선택됨` : '선택 없음'}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" onClick={() => setImgPickerOpen(false)}>취소</button>
                <button className="btn btn-primary" onClick={confirmImgPick} disabled={imgPickerSel === null}>선택 완료</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 발행 확인 모달 ── */}
      {publishModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) setPublishModal(false) }}
        >
          <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 14 }}>🚀 발행</div>
            <div style={{ fontSize: 13, color: 'var(--s600)', lineHeight: 1.7, marginBottom: 20 }}>
              현재 저장된 콘텐츠를 사이트에 반영합니다.<br />
              번역이 완료되지 않은 필드가 있습니다. 계속하시겠습니까?
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setPublishModal(false)}>취소</button>
              <button className="btn btn-primary" onClick={handlePublish}>발행하기</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 탑바 ── */}
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/" className="topbar-back">← 대시보드</Link>
          <span className="topbar-sep">/</span>
          <span className="topbar-title">콘텐츠 편집</span>
        </div>
        <div className="topbar-right">
          {/* 언어 선택기 */}
          <div className="lang-selector" ref={langRef}>
            <button className="lang-btn" onClick={() => setLangOpen(o => !o)}>
              <span>{curLang.flag}</span>
              <span>{curLang.label}</span>
              <span style={{ fontSize: 10, color: 'var(--s400)' }}>▾</span>
            </button>
            <div className={`lang-dropdown${langOpen ? ' open' : ''}`}>
              {LANG_OPTIONS.map(opt => (
                <div
                  key={opt.code}
                  className={`lang-option${opt.code === curLang.code ? ' active' : ''}`}
                  onClick={() => { setCurLang(opt); setLangOpen(false) }}
                >
                  {opt.flag}
                  <span>{opt.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--s400)', marginLeft: 4 }}>{opt.name}</span>
                </div>
              ))}
            </div>
          </div>
          <span className={`sec-chip ${transPct === 100 ? 'chip-light' : 'chip-gray'}`} style={{ fontSize: 11 }}>
            번역 {transPct}%
          </span>
          <button className="btn" onClick={handleSave}>💾 임시 저장</button>
          <Link href="/site/preview" className="btn">👁 미리보기</Link>
          <button className="btn btn-primary" onClick={() => setPublishModal(true)}>🚀 발행</button>
        </div>
      </div>

      <div className="content fade">
        {/* 탭 바 */}
        <div className="tab-bar">
          <button className="tab active">콘텐츠 편집</button>
          <Link href="/site/assets"  className="tab">이미지 관리</Link>
          <Link href="/site/preview" className="tab">미리보기 &amp; 게시</Link>
        </div>

        <div className="layout-site">
          {/* ── 좌측: 섹션 목록 ── */}
          <div>
            <div className="section-list">
              <div className="section-list-head">
                섹션 <span style={{ color: 'var(--s400)', fontWeight: 400 }}>({SECTIONS.length}개)</span>
              </div>
              {SECTIONS.map(s => {
                const st = STATUS_MAP[s.status]
                return (
                  <div
                    key={s.id}
                    className={`section-item${selected.id === s.id ? ' active' : ''}`}
                    onClick={() => setSelected(s)}
                  >
                    <span className="sec-num">{s.num}</span>
                    <span style={{ fontSize: 15 }}>{s.icon}</span>
                    <span className="sec-name">{s.name}</span>
                    <span className={`sec-chip ${st.cls}`}>{st.label}</span>
                  </div>
                )
              })}
            </div>

            {/* 번역 현황 */}
            <div className="card" style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--s400)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>번역 현황</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(Object.entries(TRANS_MAP) as [TransStatus, { cls: string; label: string }][]).map(([key, m]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className={`trans-status-chip ${m.cls}`}>{m.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--s700)' }}>{counts[key] ?? 0}건</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── 우측: 편집 패널 ── */}
          <div className="card edit-panel" style={{ padding: 0 }}>
            {/* 패널 헤더 */}
            <div className="edit-panel-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15 }}>{selected.icon}</span>
                <span className="ep-title">{selected.name}</span>
                <span className={`sec-chip ${STATUS_MAP[selected.status].cls}`}>
                  {STATUS_MAP[selected.status].label}
                </span>
              </div>
              <div className="ep-actions">
                <button className="btn btn-sm" onClick={handleAiTranslateAll}>✨ AI 전체 의역</button>
                <button className="btn btn-sm btn-primary" onClick={handleSave}>저장</button>
              </div>
            </div>

            {/* 상태 칩 사용법 안내 */}
            <div style={{ padding: '8px 20px', background: 'var(--s50)', borderTop: '1px solid var(--s100)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: 'var(--s400)', marginRight: 4 }}>번역 상태 칩 클릭 순서</span>
              {(['none','ai','review','done'] as TransStatus[]).map((ts, i) => {
                const m = TRANS_MAP[ts]
                return (
                  <span key={ts} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span className={`trans-status-chip ${m.cls}`}>{m.label}</span>
                    {i < 3 && <span style={{ fontSize: 11, color: 'var(--s300)' }}>›</span>}
                  </span>
                )
              })}
            </div>

            {/* AI 인라인 배너 */}
            <div className="ai-inline">
              <div className="ai-inline-dot" />
              <span>AI가 한국 사이트에서 텍스트를 수집했습니다. 내용을 확인하고 의역을 검수하세요.</span>
            </div>

            {/* Hero: 대표 이미지 업로드 존 */}
            {selected.hasImage && (
              <div style={{ padding: '14px 20px', borderTop: '1px solid var(--s100)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s500)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.04em' }}>대표 이미지</div>
                {heroImage ? (
                  <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 120, height: 120, borderRadius: 'var(--r)', background: 'var(--s100)', border: '1px solid var(--s200)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                      {heroImage.url.startsWith('blob:') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={heroImage.url} alt="대표 이미지" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: 48 }}>{heroImage.url}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--s500)', maxWidth: 120, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{heroImage.name}</div>
                    <button className="btn btn-sm" onClick={openImgPicker} style={{ fontSize: 11 }}>🔄 교체</button>
                  </div>
                ) : (
                  <div className="img-upload-opt" onClick={openImgPicker} style={{ cursor: 'pointer' }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>📁</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--s700)' }}>대표 이미지 (선택)</div>
                    <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 2 }}>PNG, JPG, WebP · 최대 10MB</div>
                  </div>
                )}
              </div>
            )}

            {/* REAL CASES / REAL REVIEWS: 이미지 없음 경고 */}
            {selected.noImageWarning && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                border: '1px solid #FECACA', borderLeft: '3px solid var(--red)',
                borderRadius: 8, padding: '10px 14px', background: '#FEF2F2',
                margin: '0 20px 14px', fontSize: 12, color: '#991B1B',
              }}>
                ⚠ <strong>이미지 없음 — 관리자 직접 등록 필요.</strong>&nbsp; AI 이미지 생성은 이 섹션에서 금지됩니다.
              </div>
            )}

            {/* 번역 필드 목록 */}
            {selected.fields.map(field => {
              const ts      = tsValues[field.id] ?? field.ts
              const tm      = TRANS_MAP[ts]
              const loading = !!aiLoading[field.id]
              return (
                <div key={field.id} className="trans-block">
                  <div className="trans-block-label">
                    <span>{field.label}</span>
                  </div>
                  <div className="trans-row">
                    {/* 한국어 원문 */}
                    <div className="trans-col">
                      <div className="trans-sublabel">🇰🇷 한국어 원문</div>
                      <div className="trans-orig">{field.ko}</div>
                    </div>
                    {/* 번역본 */}
                    <div className="trans-col">
                      <div className="trans-sublabel">
                        {curLang.flag} {curLang.label}
                        {/* 클릭하면 상태 변경 */}
                        <span
                          className={`trans-status-chip ${tm.cls}`}
                          title={TS_ACTION[ts]}
                          onClick={() => handleTsChange(field.id)}
                          style={{ cursor: 'pointer', userSelect: 'none' }}
                        >
                          {tm.label} ›
                        </span>
                        <button
                          className="btn btn-sm"
                          style={{ fontSize: 10, padding: '2px 8px', marginLeft: 'auto', opacity: loading ? .6 : 1 }}
                          onClick={() => handleAiTranslate(field.id)}
                          disabled={loading}
                        >
                          {loading ? '⏳ 번역 중…' : '✨ AI 의역'}
                        </button>
                      </div>
                      <textarea
                        className="trans-input"
                        value={loading ? '번역 중…' : (jaValues[field.id] ?? field.ja)}
                        onChange={e => setJaValues(p => ({ ...p, [field.id]: e.target.value }))}
                        rows={3}
                        disabled={loading}
                        style={{ background: loading ? 'var(--s50)' : undefined }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}

            {/* save-bar */}
            <div className="save-bar">
              <span className="save-info">자동 저장됨</span>
              <button className="btn btn-primary" onClick={handleSave}>저장</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
