'use client'

import Link from 'next/link'
import { useState } from 'react'
import { HOSPITAL_INFO } from '@/lib/mock-data'

type Device = 'desktop' | 'mobile'

const CHECKLIST = [
  { id: 1, label: '콘텐츠 검수 완료',      icon: '✓', cls: 'ci-pass', href: '' },
  { id: 2, label: '컴플라이언스 경고 1건',  icon: '!', cls: 'ci-fail', href: '/site/content' },
  { id: 3, label: '이미지 업로드 완료',     icon: '✓', cls: 'ci-pass', href: '' },
  { id: 4, label: 'Schema.org 9종 적용',   icon: '✓', cls: 'ci-pass', href: '' },
  { id: 5, label: 'LINE CTA 연결됨',        icon: '✓', cls: 'ci-pass', href: '' },
  { id: 6, label: '눈 성형 섹션 검수 대기', icon: '⚡', cls: 'ci-warn', href: '/site/content' },
]

export default function SitePreviewPage() {
  const [device, setDevice] = useState<Device>('desktop')

  const allPass = CHECKLIST.every(c => c.cls === 'ci-pass')

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/" className="topbar-back">← 대시보드</Link>
          <span className="topbar-sep">/</span>
          <span className="topbar-title">사이트 관리</span>
          <span className="topbar-sep">/</span>
          <span style={{ fontSize: 14, color: 'var(--s600)' }}>미리보기 &amp; 게시</span>
        </div>
        <div className="topbar-right">
          <Link href="/site/content" className="btn">✏ 편집으로</Link>
          <button className="btn btn-navy">🚀 게시하기</button>
        </div>
      </div>

      <div className="content fade">
        {/* 탭 바 */}
        <div className="tab-bar">
          <Link href="/site/content" className="tab">콘텐츠 편집</Link>
          <Link href="/site/assets"  className="tab">이미지 관리</Link>
          <button className="tab active">미리보기 &amp; 게시</button>
        </div>

        <div className="layout-preview">
          {/* 좌측: 미리보기 */}
          <div>
            <div className="device-bar">
              <button
                className={`dev-btn${device === 'desktop' ? ' active' : ''}`}
                onClick={() => setDevice('desktop')}
              >🖥 데스크탑</button>
              <button
                className={`dev-btn${device === 'mobile' ? ' active' : ''}`}
                onClick={() => setDevice('mobile')}
              >📱 모바일</button>
              <span style={{ fontSize: 12, color: 'var(--s400)', marginLeft: 8 }}>
                {device === 'desktop' ? '1280 × 800' : '375 × 812'}
              </span>
            </div>

            <div className="preview-wrap">
              <div className="preview-bar">
                <div className="preview-dots">
                  <span style={{ background: '#FC5858' }} />
                  <span style={{ background: '#FBBD2D' }} />
                  <span style={{ background: '#27C940' }} />
                </div>
                <div className="preview-url">{HOSPITAL_INFO.siteUrl}</div>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'center',
                padding: device === 'mobile' ? 20 : 0,
                background: device === 'mobile' ? 'var(--s100)' : '#fff',
                minHeight: 500,
              }}>
                <iframe
                  src={`https://${HOSPITAL_INFO.siteUrl}`}
                  style={{
                    width:        device === 'mobile' ? 375 : '100%',
                    height:       500,
                    border:       'none',
                    borderRadius: device === 'mobile' ? 16 : 0,
                  }}
                  title="사이트 미리보기"
                />
              </div>
            </div>
          </div>

          {/* 우측 패널 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* 배포 상태 */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>🌐 배포 상태</div>
              <div className="deploy-status">
                <div className="ds-dot" />
                <div className="ds-text">게시 중 · 정상 운영</div>
                <a className="ds-url" href="#">↗ 열기</a>
              </div>
              <div style={{ fontSize: 12, color: 'var(--s500)', lineHeight: 1.9 }}>
                {[
                  { label: '마지막 게시',     value: '2026-06-07 14:22' },
                  { label: 'SSL 인증서',      value: '✓ 유효' },
                  { label: 'Core Web Vitals', value: '✓ 1.2s' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{r.label}</span>
                    <span style={{ color: 'var(--s700)' }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 게시 전 체크리스트 */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>✅ 게시 전 체크리스트</div>
              <div className="check-list" style={{ marginBottom: 14 }}>
                {CHECKLIST.map(c => (
                  <div key={c.id} className="check-item">
                    <div className={`check-icon ${c.cls}`}>{c.icon}</div>
                    <span className="check-label">{c.label}</span>
                    {c.href && (
                      <Link href={c.href} className="check-action">
                        {c.cls === 'ci-fail' ? '수정' : '검수'}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
              <button
                className={`btn btn-navy`}
                style={{ width: '100%', justifyContent: 'center', fontSize: 14, padding: 10 }}
                disabled={!allPass}
              >
                🚀 지금 게시하기
              </button>
            </div>
          </div>
        </div>

        <footer className="site-footer">© 2026 MEDIFLOW. All rights reserved.</footer>
      </div>
    </>
  )
}
