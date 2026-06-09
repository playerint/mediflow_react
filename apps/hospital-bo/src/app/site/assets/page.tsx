'use client'

import Link from 'next/link'
import { useState } from 'react'

interface ImgItem {
  id:       string
  thumb:    string
  name:     string
  size:     string
  badge?:   string
  badgeCls?: string
}

const BA_IMAGES: ImgItem[] = [
  { id: 'ba1', thumb: '👁', name: '눈성형_전후_01.jpg', size: '2.1MB', badge: 'B/A',  badgeCls: 'badge-ba'  },
  { id: 'ba2', thumb: '👁', name: '눈성형_전후_02.jpg', size: '1.8MB', badge: 'B/A',  badgeCls: 'badge-ba'  },
  { id: 'ba3', thumb: '👃', name: '코성형_전후_01.jpg', size: '2.4MB', badge: 'B/A',  badgeCls: 'badge-ba'  },
  { id: 'ba4', thumb: '👃', name: '코성형_전후_02.jpg', size: '1.9MB', badge: 'B/A',  badgeCls: 'badge-ba'  },
  { id: 'ba5', thumb: '✨', name: '윤곽_전후_01.jpg',   size: '2.2MB', badge: 'B/A',  badgeCls: 'badge-ba'  },
  { id: 'ba6', thumb: '🌟', name: '피부_전후_01.jpg',   size: '1.6MB', badge: 'NEW', badgeCls: 'badge-new' },
]

const DOCTOR_IMAGES: ImgItem[] = [
  { id: 'd1', thumb: '👨‍⚕️', name: '김원장_프로필.jpg',   size: '1.1MB' },
  { id: 'd2', thumb: '👩‍⚕️', name: '이수진_원장.jpg',     size: '0.9MB' },
  { id: 'd3', thumb: '👨‍⚕️', name: '박의사_프로필.jpg',   size: '1.0MB', badge: 'NEW', badgeCls: 'badge-new' },
]

const FACILITY_IMAGES: ImgItem[] = [
  { id: 'f1', thumb: '🏥', name: '외관_정면.jpg',    size: '3.2MB' },
  { id: 'f2', thumb: '🛋', name: '상담실_01.jpg',    size: '2.8MB' },
  { id: 'f3', thumb: '💊', name: '수술실_01.jpg',    size: '2.1MB' },
  { id: 'f4', thumb: '🌿', name: '대기실_01.jpg',    size: '1.9MB', badge: 'AI', badgeCls: 'badge-ai' },
]

function ImageGrid({ items }: { items: ImgItem[] }) {
  return (
    <div className="img-grid">
      {items.map(img => (
        <div key={img.id} className="img-card">
          <div className="img-thumb">{img.thumb}</div>
          <div className="img-meta">
            <div className="img-name">{img.name}</div>
            <div className="img-size">{img.size}</div>
          </div>
          {img.badge && (
            <span className={`img-badge ${img.badgeCls}`}>{img.badge}</span>
          )}
          <div className="img-actions">
            <button className="img-btn" title="편집">✏</button>
            <button className="img-btn" title="삭제">🗑</button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function SiteAssetsPage() {
  const [dragging, setDragging] = useState(false)
  const [gateOn,   setGateOn]   = useState(false)

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/" className="topbar-back">← 대시보드</Link>
          <span className="topbar-sep">/</span>
          <span className="topbar-title">사이트 관리</span>
          <span className="topbar-sep">/</span>
          <span style={{ fontSize: 14, color: 'var(--s600)' }}>이미지 관리</span>
        </div>
        <div className="topbar-right">
          <span style={{ fontSize: 12, color: 'var(--s400)' }}>총 107개 · 234MB</span>
          <button className="btn btn-primary">+ 업로드</button>
        </div>
      </div>

      <div className="content fade">
        {/* 탭 바 */}
        <div className="tab-bar">
          <Link href="/site/content" className="tab">콘텐츠 편집</Link>
          <button className="tab active">이미지 관리</button>
          <Link href="/site/preview" className="tab">미리보기 &amp; 게시</Link>
        </div>

        {/* 업로드 존 */}
        <div
          className={`upload-zone${dragging ? ' dragging' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false) }}
        >
          <div className="uz-icon">📁</div>
          <div className="uz-title">사진 또는 이미지를 드래그하거나 클릭하여 업로드</div>
          <div className="uz-sub">PNG, JPG, WebP · 최대 10MB · AI Agent가 자동 분류</div>
        </div>

        {/* B/A 게이팅 패널 */}
        <div className="gating-panel">
          <div className="gp-left">
            <span style={{ fontSize: 20, marginTop: 2 }}>🔒</span>
            <div>
              <div className="gp-title">B/A 사진 노출 정책</div>
              <div className="gp-desc">
                현재: {gateOn ? '로그인 필요 (게이팅 적용 중)' : '로그인 없이 공개'} — 분쟁 발생 시 토글로 즉시 게이팅 적용 가능
              </div>
            </div>
          </div>
          <div className="gp-right">
            <span className="gp-status">{gateOn ? '게이팅 중' : '공개 중'}</span>
            <div
              onClick={() => setGateOn(!gateOn)}
              style={{
                width: 36, height: 20, borderRadius: 10,
                background: gateOn ? 'var(--teal)' : 'var(--s300)',
                position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background .2s',
              }}
            >
              <div style={{
                position: 'absolute', top: 3,
                left: gateOn ? 19 : 3,
                width: 14, height: 14, borderRadius: '50%', background: '#fff',
                transition: 'left .15s', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
              }} />
            </div>
          </div>
        </div>

        {/* B/A 사진 */}
        <div className="cat-section">
          <div className="cat-head">
            <div className="cat-title">✦ B/A 사진 <span className="cat-count">87장</span></div>
            <button className="btn btn-sm" style={{ fontSize: 12 }}>🤖 AI 재분류</button>
          </div>
          <ImageGrid items={BA_IMAGES} />
        </div>

        {/* 의료진 사진 */}
        <div className="cat-section">
          <div className="cat-head">
            <div className="cat-title">👨‍⚕️ 의료진 사진 <span className="cat-count">5장</span></div>
          </div>
          <ImageGrid items={DOCTOR_IMAGES} />
        </div>

        {/* 시설 사진 */}
        <div className="cat-section">
          <div className="cat-head">
            <div className="cat-title">🏥 시설 사진 <span className="cat-count">10장</span></div>
          </div>
          <ImageGrid items={FACILITY_IMAGES} />
        </div>

        <footer className="site-footer">© 2026 MEDIFLOW. All rights reserved.</footer>
      </div>
    </>
  )
}
