'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { login, setToken, getToken } from '@/lib/api'

const DEMO_ACCOUNTS = [
  { role: '관리자', icon: '👑', email: 'h1@mediflow.io', password: 'hospital1234' },
  { role: '스탭',   icon: '👤', email: 'h2@mediflow.io', password: 'hospital1234' },
]

export default function LoginPage() {
  const router   = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)

  useEffect(() => {
    if (getToken()) router.replace('/')
  }, [router])

  async function doLogin(em: string, pw: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await login(em, pw)
      if (!res.hospitalId) {
        setError('병원 관리자 계정으로만 로그인할 수 있습니다.')
        setLoading(false)
        return
      }
      setToken(res.token, res.hospitalId)
      router.replace('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '이메일 또는 비밀번호가 올바르지 않습니다.')
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.')
      return
    }
    doLogin(email, password)
  }

  function handleDemoClick(demo: typeof DEMO_ACCOUNTS[0]) {
    setEmail(demo.email)
    setPassword(demo.password)
    doLogin(demo.email, demo.password)
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'var(--navy)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      {/* 배경 라디얼 그라디언트 */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: `
          radial-gradient(circle at 15% 25%, rgba(37,99,235,.07) 0%, transparent 50%),
          radial-gradient(circle at 85% 75%, rgba(37,99,235,.05) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{ width: '100%', maxWidth: 400, padding: 20, position: 'relative', zIndex: 1 }}>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: '40px 36px',
          boxShadow: '0 20px 60px rgba(0,0,0,.3)',
        }}>
          {/* 로고 */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 44, height: 44,
              background: 'var(--navy)',
              borderRadius: 10,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M4 11h4l2-5 4 10 2-5h4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--navy)', letterSpacing: '0.04em' }}>
              MEDIFLOW
            </div>
            <div style={{ fontSize: 10, color: 'var(--s400)', marginTop: 3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              글로벌 메디컬 플로우
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#EEF2FF',
              border: '1px solid rgba(37,99,235,.25)',
              borderRadius: 8, padding: '5px 12px',
              fontSize: 12, color: 'var(--navy)', fontWeight: 600,
              marginTop: 8,
            }}>
              🏥 올래성형외과
            </div>
          </div>

          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>로그인</div>
          <div style={{ fontSize: 13, color: 'var(--s500)', marginBottom: 22 }}>병원 관리자 전용 시스템입니다.</div>

          {/* 에러 */}
          {error && (
            <div style={{
              fontSize: 12, color: '#DC2626',
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: 8, padding: '8px 12px',
              marginBottom: 12,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5, display: 'block' }}>
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@oleps.co.kr"
              autoFocus
              style={{
                width: '100%', padding: '10px 14px',
                border: '1.5px solid var(--s200)',
                borderRadius: 10, fontSize: 14,
                outline: 'none', color: '#111827',
                marginBottom: 12, display: 'block',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
              onFocus={e => e.target.style.borderColor = '#2563EB'}
              onBlur={e => e.target.style.borderColor = 'var(--s200)'}
            />
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5, display: 'block' }}>
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '10px 14px',
                border: '1.5px solid var(--s200)',
                borderRadius: 10, fontSize: 14,
                outline: 'none', color: '#111827',
                marginBottom: 12, display: 'block',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
              onFocus={e => e.target.style.borderColor = '#2563EB'}
              onBlur={e => e.target.style.borderColor = 'var(--s200)'}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: 12,
                background: loading ? '#6B7280' : 'var(--navy)',
                color: '#fff', border: 'none',
                borderRadius: 10, fontSize: 14, fontWeight: 700,
                fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background .15s',
              }}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* 데모 계정 */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--s100)' }}>
            <div style={{ fontSize: 12, color: 'var(--s400)', textAlign: 'center', marginBottom: 8 }}>
              데모 계정으로 시작
            </div>
            {DEMO_ACCOUNTS.map(demo => (
              <div
                key={demo.email}
                onClick={() => !loading && handleDemoClick(demo)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'var(--s50)',
                  borderRadius: 8, marginBottom: 5,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  border: '1px solid transparent',
                  transition: 'background .1s, border-color .1s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = '#EEF2FF'
                  ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(37,99,235,.2)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'var(--s50)'
                  ;(e.currentTarget as HTMLDivElement).style.borderColor = 'transparent'
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)' }}>
                  {demo.icon} {demo.role}
                </span>
                <span style={{ fontSize: 12, color: 'var(--s500)', fontFamily: 'monospace' }}>
                  {demo.email}
                </span>
                <span style={{ fontSize: 12, color: 'var(--s400)' }}>→</span>
              </div>
            ))}
          </div>

          {/* 입점 신청 영역 */}
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--s100)', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--s400)', marginBottom: 12 }}>
              아직 MEDIFLOW 계정이 없으신가요?
            </div>
            <a
              href="/register"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '11px 20px',
                background: 'var(--navy)',
                color: '#fff', borderRadius: 10,
                fontSize: 13, fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 2px 12px rgba(13,27,62,.2)',
                transition: 'all .2s',
              }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLAnchorElement).style.background = '#162952'
                ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)'
                ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 18px rgba(13,27,62,.3)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLAnchorElement).style.background = 'var(--navy)'
                ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 12px rgba(13,27,62,.2)'
              }}
            >
              🏥 병원 입점 신청하기
              <span style={{
                fontSize: 10,
                background: 'rgba(37,99,235,.15)',
                color: '#93C5FD',
                padding: '2px 7px', borderRadius: 5, fontWeight: 600,
              }}>
                무료 상담
              </span>
            </a>
            <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 16, lineHeight: 1.6 }}>
              반나절에 일본어 글로벌 홈페이지 완성<br />
              Global Medical <strong style={{ color: '#2563EB', fontWeight: 700 }}>OS</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
