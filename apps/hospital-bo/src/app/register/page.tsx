'use client'

import { useState } from 'react'
import Link from 'next/link'

const SPECIALTIES = ['성형외과', '피부과', '치과', '한방 클리닉', '안과', '비뇨의학과', '기타']
const JP_PATIENT_OPTIONS = ['없음 (처음 도전)', '1~10명', '11~30명', '31~100명', '100명 이상']

const FEATURES = [
  { icon: '⚡', title: '반나절 완성',         desc: 'URL 입력 → 자동 분석 → 게시까지 최단 4시간' },
  { icon: '🤖', title: 'AI 일본어 재집필',    desc: '번역이 아닌 재집필 — 일본 환자 의사결정 언어로' },
  { icon: '🧠', title: 'AEO 최적화',          desc: 'ChatGPT·Perplexity 답변에 병원이 인용되도록' },
  { icon: '💬', title: 'LINE 자동상담 24/7',  desc: 'Claude AI가 일본어로 자동 응답·예약 전환' },
]

const NEXT_STEPS = [
  '담당자 배정 및 킥오프 미팅 일정 조율 (1영업일 이내)',
  '병원 홈페이지 자동 분석 시작 — URL 크롤링·전략 기획안 도출',
  '일본어 사이트 초안 공유 → 검수 → 게시 (목표: 반나절)',
]

interface FormState {
  hospitalName: string
  specialty: string
  hospitalUrl: string
  jpDomain: string
  address: string
  jpPatients: string
  contactName: string
  contactTitle: string
  contactEmail: string
  contactPhone: string
  message: string
}

const EMPTY_FORM: FormState = {
  hospitalName: '', specialty: '', hospitalUrl: '', jpDomain: '',
  address: '', jpPatients: '', contactName: '', contactTitle: '',
  contactEmail: '', contactPhone: '', message: '',
}

export default function RegisterPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [agrees, setAgrees] = useState({ agree1: true, agree2: true, agree3: false })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [refNo, setRefNo] = useState('')
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | 'agrees', string>>>({})

  function set(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm(f => ({ ...f, [key]: e.target.value }))
      setErrors(err => ({ ...err, [key]: undefined }))
    }
  }

  function toggleAgree(key: keyof typeof agrees) {
    setAgrees(a => ({ ...a, [key]: !a[key] }))
    setErrors(err => ({ ...err, agrees: undefined }))
  }

  function validate(): boolean {
    const e: typeof errors = {}
    if (!form.hospitalName)  e.hospitalName  = '병원명을 입력해주세요.'
    if (!form.specialty)     e.specialty     = '진료 분야를 선택해주세요.'
    if (!form.hospitalUrl)   e.hospitalUrl   = '병원 홈페이지 URL을 입력해주세요.'
    if (!form.contactName)   e.contactName   = '담당자 성명을 입력해주세요.'
    if (!form.contactEmail)  e.contactEmail  = '이메일을 입력해주세요.'
    if (!form.contactPhone)  e.contactPhone  = '연락처를 입력해주세요.'
    if (!agrees.agree1 || !agrees.agree2) e.agrees = '필수 약관에 동의해주세요.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    setLoading(true)
    const ref = 'MF-' + String(Math.floor(Math.random() * 900000 + 100000))
    setTimeout(() => {
      setRefNo(ref)
      setLoading(false)
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 1500)
  }

  /* ── 인풋 공통 스타일 ── */
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid rgba(255,255,255,.12)',
    borderRadius: 10, fontSize: 13,
    fontFamily: 'inherit', outline: 'none',
    color: '#fff', background: 'rgba(255,255,255,.06)',
    transition: 'all .15s', display: 'block', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600,
    color: 'rgba(255,255,255,.6)',
    marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4,
  }
  const sectionStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,.05)',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: 16, padding: '24px 26px',
    marginBottom: 14,
  }

  /* ── 성공 화면 ── */
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--navy)', padding: '40px 20px' }}>
        <div style={{ maxWidth: 520, margin: '60px auto', textAlign: 'center', padding: 20 }}>
          <div style={{ fontSize: 60, marginBottom: 20, animation: 'pop .4s ease both' }}>🎉</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 10 }}>입점 신청 완료!</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', lineHeight: 1.7, marginBottom: 28 }}>
            빠른 신청 감사합니다.<br />
            MEDIFLOW 담당자가 <strong style={{ color: '#93C5FD' }}>1영업일 이내</strong>로 연락드릴 예정입니다.
          </div>

          {/* 신청 요약 카드 */}
          <div style={{
            background: 'rgba(255,255,255,.05)',
            border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 14, padding: '18px 20px',
            marginBottom: 20, textAlign: 'left',
          }}>
            {[
              ['신청번호', refNo],
              ['병원명',   form.hospitalName],
              ['진료 분야', form.specialty],
              ['담당자',   form.contactName],
              ['연락처',   form.contactEmail],
            ].map(([label, val]) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,.07)',
              }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{val}</span>
              </div>
            ))}
          </div>

          {/* 다음 단계 */}
          <div style={{
            background: 'rgba(37,99,235,.08)',
            border: '1px solid rgba(37,99,235,.25)',
            borderRadius: 12, padding: '14px 18px',
            textAlign: 'left', marginBottom: 20,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#93C5FD', marginBottom: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              다음 단계
            </div>
            {NEXT_STEPS.map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: i < NEXT_STEPS.length - 1 ? 8 : 0 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'var(--blue)', color: '#fff',
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', lineHeight: 1.5 }}>{text}</div>
              </div>
            ))}
          </div>

          <Link href="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '11px 28px',
            border: '1.5px solid rgba(255,255,255,.2)',
            borderRadius: 10,
            color: 'rgba(255,255,255,.6)', fontSize: 13, fontWeight: 500,
            textDecoration: 'none', transition: 'all .15s',
          }}>
            ← 로그인 화면으로
          </Link>
        </div>

        <style>{`@keyframes pop { from { transform:scale(.5);opacity:0 } to { transform:scale(1);opacity:1 } }`}</style>
      </div>
    )
  }

  /* ── 신청 폼 ── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', padding: '40px 20px', fontFamily: 'inherit' }}>

      {/* 배경 그라디언트 */}
      <div style={{
        position: 'fixed', inset: 0,
        background: `
          radial-gradient(circle at 15% 25%, rgba(37,99,235,.07) 0%, transparent 50%),
          radial-gradient(circle at 85% 75%, rgba(37,99,235,.05) 0%, transparent 50%)
        `,
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* 상단 바 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 960, margin: '0 auto 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '0.04em' }}>MEDIFLOW</span>
            <span style={{
              fontSize: 12, color: 'rgba(255,255,255,.4)',
              background: 'rgba(255,255,255,.08)',
              padding: '2px 8px', borderRadius: 5,
            }}>
              Global Medical <strong style={{ color: 'var(--blue)' }}>OS</strong>
            </span>
          </div>
          <Link href="/login" style={{
            fontSize: 13, color: 'rgba(255,255,255,.5)',
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5,
          }}>
            ← 로그인으로
          </Link>
        </div>

        {/* 히어로 */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(37,99,235,.15)',
            border: '1px solid rgba(37,99,235,.3)',
            borderRadius: 20, padding: '5px 14px',
            fontSize: 12, color: '#93C5FD', fontWeight: 500, marginBottom: 16,
          }}>
            🌐 일본 환자 유치 특화 플랫폼
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#fff', lineHeight: 1.3, marginBottom: 10 }}>
            반나절 만에,<br />일본이 주목하는 <span style={{ color: '#93C5FD' }}>병원</span>이 됩니다
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', lineHeight: 1.7, maxWidth: 500, margin: '0 auto' }}>
            URL 하나면 충분합니다. 기획·일본어 재집필·SEO·AEO·LINE 자동상담까지<br />
            MEDIFLOW가 전부 완성합니다.
          </div>
        </div>

        {/* 특장점 4개 */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
          gap: 10, maxWidth: 960, margin: '0 auto 32px',
        }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              background: 'rgba(255,255,255,.04)',
              border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 12, padding: '16px 14px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* 폼 영역 */}
        <div style={{ maxWidth: 960, margin: '0 auto' }}>

          {/* 병원 기본 정보 */}
          <div style={sectionStyle}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              🏥 병원 기본 정보
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>병원명 (한국어) <span style={{ color: '#F87171' }}>*</span></label>
                <input style={{ ...inputStyle, borderColor: errors.hospitalName ? '#F87171' : 'rgba(255,255,255,.12)' }}
                  value={form.hospitalName} onChange={set('hospitalName')} placeholder="예) 올래성형외과" />
                {errors.hospitalName && <div style={{ fontSize: 11, color: '#F87171', marginTop: 4 }}>{errors.hospitalName}</div>}
              </div>
              <div>
                <label style={labelStyle}>진료 분야 <span style={{ color: '#F87171' }}>*</span></label>
                <select style={{ ...inputStyle, appearance: 'auto' } as React.CSSProperties}
                  value={form.specialty} onChange={set('specialty')}>
                  <option value="">선택</option>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.specialty && <div style={{ fontSize: 11, color: '#F87171', marginTop: 4 }}>{errors.specialty}</div>}
              </div>
              <div>
                <label style={labelStyle}>병원 홈페이지 URL <span style={{ color: '#F87171' }}>*</span></label>
                <input style={{ ...inputStyle, borderColor: errors.hospitalUrl ? '#F87171' : 'rgba(255,255,255,.12)' }}
                  type="url" value={form.hospitalUrl} onChange={set('hospitalUrl')} placeholder="예) https://www.oleps.co.kr" />
                {errors.hospitalUrl && <div style={{ fontSize: 11, color: '#F87171', marginTop: 4 }}>{errors.hospitalUrl}</div>}
              </div>
              <div>
                <label style={labelStyle}>희망 일본어 도메인</label>
                <input style={inputStyle} value={form.jpDomain} onChange={set('jpDomain')} placeholder="예) jp.oleps.co.kr" />
              </div>
              <div>
                <label style={labelStyle}>소재지 (주소)</label>
                <input style={inputStyle} value={form.address} onChange={set('address')} placeholder="예) 서울시 강남구 역삼동" />
              </div>
              <div>
                <label style={labelStyle}>월 평균 일본인 환자 수</label>
                <select style={{ ...inputStyle, appearance: 'auto' } as React.CSSProperties}
                  value={form.jpPatients} onChange={set('jpPatients')}>
                  <option value="">선택 (선택사항)</option>
                  {JP_PATIENT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* 담당자 정보 */}
          <div style={sectionStyle}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              👤 담당자 정보
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>담당자 성명 <span style={{ color: '#F87171' }}>*</span></label>
                <input style={{ ...inputStyle, borderColor: errors.contactName ? '#F87171' : 'rgba(255,255,255,.12)' }}
                  value={form.contactName} onChange={set('contactName')} placeholder="예) 김지현" />
                {errors.contactName && <div style={{ fontSize: 11, color: '#F87171', marginTop: 4 }}>{errors.contactName}</div>}
              </div>
              <div>
                <label style={labelStyle}>직책</label>
                <input style={inputStyle} value={form.contactTitle} onChange={set('contactTitle')} placeholder="예) 원장, 실장, 마케터" />
              </div>
              <div>
                <label style={labelStyle}>이메일 <span style={{ color: '#F87171' }}>*</span></label>
                <input style={{ ...inputStyle, borderColor: errors.contactEmail ? '#F87171' : 'rgba(255,255,255,.12)' }}
                  type="email" value={form.contactEmail} onChange={set('contactEmail')} placeholder="예) admin@oleps.co.kr" />
                {errors.contactEmail && <div style={{ fontSize: 11, color: '#F87171', marginTop: 4 }}>{errors.contactEmail}</div>}
              </div>
              <div>
                <label style={labelStyle}>연락처 <span style={{ color: '#F87171' }}>*</span></label>
                <input style={{ ...inputStyle, borderColor: errors.contactPhone ? '#F87171' : 'rgba(255,255,255,.12)' }}
                  type="tel" value={form.contactPhone} onChange={set('contactPhone')} placeholder="예) 010-1234-5678" />
                {errors.contactPhone && <div style={{ fontSize: 11, color: '#F87171', marginTop: 4 }}>{errors.contactPhone}</div>}
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={labelStyle}>문의 사항 또는 요청 내용</label>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, minHeight: 80 }}
                value={form.message} onChange={set('message')}
                placeholder="일본 환자 유치 목표, 특별 요청 사항, 궁금한 점 등을 자유롭게 적어주세요."
              />
            </div>
          </div>

          {/* 약관 동의 */}
          <div style={{ ...sectionStyle, padding: '18px 26px' }}>
            {([
              { key: 'agree1' as const, text: '[필수] 서비스 이용약관', required: true },
              { key: 'agree2' as const, text: '[필수] 개인정보 수집 및 이용', required: true },
              { key: 'agree3' as const, text: '[선택] 마케팅 정보 수신', required: false },
            ]).map((item, i) => (
              <div
                key={item.key}
                onClick={() => toggleAgree(item.key)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginTop: i > 0 ? 8 : 0 }}
              >
                <div style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: agrees[item.key] ? 'var(--blue)' : 'transparent',
                  border: `1.5px solid ${agrees[item.key] ? 'var(--blue)' : 'rgba(255,255,255,.3)'}`,
                  transition: 'all .15s', fontSize: 10, color: '#fff', fontWeight: 700,
                }}>
                  {agrees[item.key] ? '✓' : ''}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', lineHeight: 1.6 }}>
                  <span style={{ color: '#93C5FD', textDecoration: 'underline' }}>{item.text}</span>
                  {item.required ? '에 동의합니다.' : '에 동의합니다.'}
                </div>
              </div>
            ))}
            {errors.agrees && (
              <div style={{ fontSize: 12, color: '#F87171', marginTop: 10 }}>{errors.agrees}</div>
            )}
          </div>

          {/* 제출 버튼 */}
          <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 40px',
                background: loading ? '#374151' : 'var(--navy)',
                color: '#fff', border: '1px solid rgba(255,255,255,.12)',
                borderRadius: 12, fontSize: 15, fontWeight: 700,
                fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 20px rgba(13,27,62,.4)',
                transition: 'all .2s',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? '⏳ 신청 중...' : '🚀 입점 신청하기'}
            </button>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', marginTop: 10 }}>
              신청 후 1영업일 이내 MEDIFLOW 담당자가 연락드립니다.
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
