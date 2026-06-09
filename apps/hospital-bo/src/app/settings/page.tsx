'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { HOSPITAL_INFO, TEAM_MEMBERS, type TeamMember, type MemberRole } from '@/lib/mock-data'

// ─────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────

const ROLE_PERMS = [
  { menu: '대시보드',    admin: true,  editor: true,  viewer: true  },
  { menu: '문의·상담',   admin: true,  editor: true,  viewer: true  },
  { menu: '답변 작성',   admin: true,  editor: true,  viewer: false },
  { menu: '예약 관리',   admin: true,  editor: true,  viewer: true  },
  { menu: '예약 수정',   admin: true,  editor: true,  viewer: false },
  { menu: '사이트 콘텐츠', admin: true, editor: true,  viewer: false },
  { menu: '이미지 에셋', admin: true,  editor: true,  viewer: false },
  { menu: 'LINE 관리',   admin: true,  editor: false, viewer: false },
  { menu: '마케팅 리포트', admin: true, editor: true,  viewer: true  },
  { menu: '팀 멤버 관리', admin: true,  editor: false, viewer: false },
  { menu: '알림 설정',   admin: true,  editor: false, viewer: false },
  { menu: '연동 설정',   admin: true,  editor: false, viewer: false },
  { menu: '도메인·플랜', admin: true,  editor: false, viewer: false },
]

const MEMBERS_MOCK: TeamMember[] = [...TEAM_MEMBERS]

const NOTIF_DEFAULTS = {
  newInquiryEmail:    true,
  newInquiryLine:     true,
  newInquiryKakao:    false,
  bookingEmail:       true,
  bookingLine:        false,
  weeklyReportEmail:  true,
  monthlyReportEmail: true,
  systemEmail:        true,
  overdueAlert:       true,
}

type SectionKey = 'hospital' | 'account' | 'team' | 'notification' | 'line' | 'instagram' | 'domain' | 'plan'

const SECTIONS: { key: SectionKey; icon: string; label: string }[] = [
  { key: 'hospital',   icon: '🏥', label: '병원 정보'       },
  { key: 'account',    icon: '👤', label: '계정'            },
  { key: 'team',       icon: '👥', label: '팀 멤버'         },
  { key: 'notification', icon: '🔔', label: '알림'          },
  { key: 'line',       icon: '💬', label: 'LINE 연동'       },
  { key: 'instagram',  icon: '📸', label: 'Instagram 연동'  },
  { key: 'domain',     icon: '🌐', label: '도메인'          },
  { key: 'plan',       icon: '💳', label: '플랜'            },
]

const PLANS = [
  {
    key: 'basic',
    name: 'Basic',
    price: '₩390,000',
    period: '/월',
    features: [
      '환자 사이트 1개',
      'LINE 봇 자동응답',
      '문의·예약 관리',
      '월간 리포트',
      '팀 멤버 최대 3명',
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '₩890,000',
    period: '/월',
    badge: '현재 플랜',
    features: [
      'Basic 모든 기능 포함',
      'AEO·SEO 최적화 도구',
      '다국어 콘텐츠 관리',
      '이미지 에셋 관리',
      '팀 멤버 최대 10명',
      '전담 상담사 배정',
    ],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: '₩1,490,000',
    period: '/월',
    features: [
      'Pro 모든 기능 포함',
      '복수 병원 통합 관리',
      '커스텀 AI 모델 학습',
      'SLA 99.9% 보장',
      '팀 멤버 무제한',
      '전담 기술 지원',
    ],
  },
]

const ROLE_BADGE: Record<MemberRole, string> = {
  '관리자': 'badge bdg-navy',
  '상담사': 'badge bdg-blue',
  '검수자': 'badge bdg-green',
}

// ─────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [section, setSection] = useState<SectionKey>('hospital')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)

  // hospital info
  const [hospitalForm, setHospitalForm] = useState({
    nameKr: HOSPITAL_INFO.name,
    nameJa: HOSPITAL_INFO.nameJa,
    phone:  '02-123-4567',
    email:  'info@oleps.co.kr',
    address: '서울시 강남구 압구정로 123',
    website: 'https://jp.oleps.co.kr',
  })

  // account
  const [accountForm, setAccountForm] = useState({
    managerName:  '김지현',
    managerEmail: 'admin@oleps.co.kr',
    currentPw: '',
    newPw: '',
    confirmPw: '',
  })

  // team
  const [members, setMembers] = useState<TeamMember[]>(MEMBERS_MOCK)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<MemberRole>('상담사')
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null)

  // role permissions
  const [rolePerms, setRolePerms] = useState(ROLE_PERMS)

  // notification
  const [notif, setNotif] = useState(NOTIF_DEFAULTS)

  // LINE
  const [lineConnected, setLineConnected] = useState(true)
  const [lineChannelId, setLineChannelId] = useState('1234567890')
  const [lineSecret, setLineSecret] = useState('••••••••••••••••')
  const [lineToken, setLineToken] = useState('••••••••••••••••••••••••••••••••')

  // Instagram
  const [igConnected, setIgConnected] = useState(false)

  // Domain
  const [customDomain, setCustomDomain] = useState('')
  const [domainStatus, setDomainStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle')

  // Plan
  const [currentPlan, setCurrentPlan] = useState<'basic' | 'pro' | 'enterprise'>('pro')
  const [planModal, setPlanModal] = useState<{ key: string; name: string; price: string } | null>(null)

  // generic confirm modal
  const [confirmModal, setConfirmModal] = useState<{
    title: string; body: string; confirmLabel: string; confirmClass: string; onConfirm: () => void
  } | null>(null)

  function showToast(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  function saveSettings() {
    showToast('✓ 설정이 저장되었습니다.')
  }

  // ── Team ──
  function handleInvite() {
    if (!inviteEmail.includes('@')) {
      showToast('올바른 이메일 주소를 입력하세요.', 'error')
      return
    }
    const next: TeamMember = {
      id: Date.now(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'invited',
    }
    setMembers(prev => [...prev, next])
    setInviteEmail('')
    setInviteRole('상담사')
    setInviteModalOpen(false)
    showToast(`${inviteEmail} 에 초대 메일을 발송했습니다.`)
  }

  function confirmDeleteMember(m: TeamMember) {
    setDeleteTarget(m)
    setConfirmModal({
      title: '멤버 삭제',
      body: `<b>${m.name}</b>(${m.email}) 멤버를 삭제하시겠습니까?`,
      confirmLabel: '삭제',
      confirmClass: 'btn-danger',
      onConfirm: () => {
        setMembers(prev => prev.filter(x => x.id !== m.id))
        setConfirmModal(null)
        showToast(`${m.name} 멤버가 삭제되었습니다.`)
      },
    })
  }

  // ── Notification toggle ──
  function toggleNotif(key: keyof typeof NOTIF_DEFAULTS) {
    setNotif(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // ── Domain check ──
  function checkDomain() {
    if (!customDomain) return
    setDomainStatus('checking')
    setTimeout(() => {
      setDomainStatus(customDomain.includes('.') ? 'ok' : 'error')
    }, 1500)
  }

  // ── Plan change ──
  function openPlanChange(p: typeof PLANS[0]) {
    if (p.key === currentPlan) return
    setPlanModal({ key: p.key, name: p.name, price: p.price })
  }

  function confirmPlanChange() {
    if (!planModal) return
    setCurrentPlan(planModal.key as typeof currentPlan)
    setPlanModal(null)
    showToast(`플랜이 ${planModal.name}으로 변경되었습니다.`)
  }

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/" className="topbar-back">← 대시보드</Link>
          <span className="topbar-sep">/</span>
          <span className="topbar-title">설정</span>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary" onClick={saveSettings}>💾 저장</button>
        </div>
      </div>

      <div className="content">
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 14, alignItems: 'start' }}>

          {/* ── LEFT NAV ── */}
          <div style={{
            background: '#fff',
            border: '1px solid var(--s200)',
            borderRadius: 'var(--rl)',
            overflow: 'hidden',
            boxShadow: 'var(--sh)',
          }}>
            {SECTIONS.map(s => (
              <button
                key={s.key}
                onClick={() => setSection(s.key)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 14px',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  border: 'none',
                  borderLeft: `3px solid ${section === s.key ? 'var(--navy)' : 'transparent'}`,
                  borderBottom: '1px solid var(--s50)',
                  background: section === s.key ? 'var(--navy-l)' : '#fff',
                  color: section === s.key ? 'var(--navy)' : 'var(--s700)',
                  fontWeight: section === s.key ? 600 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all .12s',
                }}
              >
                <span>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>

          {/* ── SECTION CONTENT ── */}
          <div>

            {/* ════════ 병원 정보 ════════ */}
            {section === 'hospital' && (
              <div className="card">
                <div className="card-head">
                  <span className="card-title">🏥 병원 기본 정보</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <FormRow label="병원명 (한국어)">
                    <input type="text" value={hospitalForm.nameKr}
                      onChange={e => setHospitalForm(p => ({ ...p, nameKr: e.target.value }))} />
                  </FormRow>
                  <FormRow label="병원명 (일본어)">
                    <input type="text" value={hospitalForm.nameJa}
                      onChange={e => setHospitalForm(p => ({ ...p, nameJa: e.target.value }))} />
                  </FormRow>
                  <FormRow label="전화번호">
                    <input type="text" value={hospitalForm.phone}
                      onChange={e => setHospitalForm(p => ({ ...p, phone: e.target.value }))} />
                  </FormRow>
                  <FormRow label="이메일">
                    <input type="email" value={hospitalForm.email}
                      onChange={e => setHospitalForm(p => ({ ...p, email: e.target.value }))} />
                  </FormRow>
                  <FormRow label="주소">
                    <input type="text" value={hospitalForm.address}
                      onChange={e => setHospitalForm(p => ({ ...p, address: e.target.value }))} />
                  </FormRow>
                  <FormRow label="웹사이트 URL">
                    <input type="text" value={hospitalForm.website}
                      onChange={e => setHospitalForm(p => ({ ...p, website: e.target.value }))} />
                  </FormRow>
                  <FormRow label="플랜">
                    <input type="text" value={HOSPITAL_INFO.plan} disabled
                      style={{ opacity: .55, cursor: 'not-allowed' }} />
                  </FormRow>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                    <button className="btn btn-primary" onClick={saveSettings}>저장</button>
                  </div>
                </div>
              </div>
            )}

            {/* ════════ 계정 ════════ */}
            {section === 'account' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="card">
                  <div className="card-head">
                    <span className="card-title">👤 계정 정보</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <FormRow label="담당자 이름">
                      <input type="text" value={accountForm.managerName}
                        onChange={e => setAccountForm(p => ({ ...p, managerName: e.target.value }))} />
                    </FormRow>
                    <FormRow label="로그인 이메일">
                      <input type="email" value={accountForm.managerEmail}
                        onChange={e => setAccountForm(p => ({ ...p, managerEmail: e.target.value }))} />
                    </FormRow>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="btn btn-primary" onClick={saveSettings}>저장</button>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-head">
                    <span className="card-title">🔑 비밀번호 변경</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <FormRow label="현재 비밀번호">
                      <input type="password" value={accountForm.currentPw} placeholder="현재 비밀번호"
                        onChange={e => setAccountForm(p => ({ ...p, currentPw: e.target.value }))} />
                    </FormRow>
                    <FormRow label="새 비밀번호">
                      <input type="password" value={accountForm.newPw} placeholder="새 비밀번호"
                        onChange={e => setAccountForm(p => ({ ...p, newPw: e.target.value }))} />
                    </FormRow>
                    <FormRow label="새 비밀번호 확인">
                      <input type="password" value={accountForm.confirmPw} placeholder="새 비밀번호 재입력"
                        onChange={e => setAccountForm(p => ({ ...p, confirmPw: e.target.value }))} />
                    </FormRow>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="btn btn-primary" onClick={() => {
                        if (!accountForm.currentPw) { showToast('현재 비밀번호를 입력하세요.', 'error'); return }
                        if (accountForm.newPw !== accountForm.confirmPw) { showToast('새 비밀번호가 일치하지 않습니다.', 'error'); return }
                        setAccountForm(p => ({ ...p, currentPw: '', newPw: '', confirmPw: '' }))
                        showToast('비밀번호가 변경되었습니다.')
                      }}>변경</button>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-head">
                    <span className="card-title">🛡 2단계 인증 (2FA)</span>
                    <span className="badge bdg-gray">미설정</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--s500)', marginBottom: 14, lineHeight: 1.6 }}>
                    2단계 인증을 활성화하면 로그인 시 추가 인증이 요구되어 계정 보안이 강화됩니다.
                  </p>
                  <button className="btn" onClick={() => showToast('2FA 설정 페이지로 이동합니다.', 'info')}>
                    2FA 설정하기
                  </button>
                </div>

                <div className="card">
                  <div className="card-head">
                    <span className="card-title">📋 로그인 기록</span>
                  </div>
                  {[
                    { time: '2026-06-09 09:22', ip: '211.xxx.xxx.10', device: 'Chrome / Windows', current: true },
                    { time: '2026-06-08 21:05', ip: '211.xxx.xxx.10', device: 'Chrome / Windows', current: false },
                    { time: '2026-06-07 14:11', ip: '121.xxx.xxx.55', device: 'Safari / iPhone',  current: false },
                  ].map((log, i, arr) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: i < arr.length - 1 ? '1px solid var(--s100)' : 'none',
                    }}>
                      <div>
                        <div style={{ fontSize: 13, color: 'var(--s700)' }}>{log.device}</div>
                        <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 2 }}>{log.ip} · {log.time}</div>
                      </div>
                      {log.current && <span className="badge bdg-green">현재 세션</span>}
                    </div>
                  ))}
                </div>

                {/* 계정 삭제 */}
                <div className="card" style={{ borderColor: 'var(--red)', opacity: .85 }}>
                  <div className="card-head">
                    <span className="card-title" style={{ color: 'var(--red)' }}>⚠️ 위험 구역</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--s500)', marginBottom: 14, lineHeight: 1.6 }}>
                    병원 계정을 삭제하면 모든 데이터(환자 문의, 예약, 사이트 콘텐츠)가 영구 삭제되며 복구할 수 없습니다.
                  </p>
                  <button
                    className="btn"
                    style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
                    onClick={() => setConfirmModal({
                      title: '계정 삭제',
                      body: '정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
                      confirmLabel: '영구 삭제',
                      confirmClass: 'btn-danger',
                      onConfirm: () => { setConfirmModal(null); showToast('계정 삭제 요청이 접수되었습니다.', 'info') },
                    })}
                  >
                    계정 삭제 요청
                  </button>
                </div>
              </div>
            )}

            {/* ════════ 팀 멤버 ════════ */}
            {section === 'team' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="card">
                  <div className="card-head">
                    <span className="card-title">👥 팀 멤버 <span style={{ color: 'var(--s400)', fontWeight: 400 }}>({members.length}명)</span></span>
                    <button className="btn btn-sm btn-primary" onClick={() => setInviteModalOpen(true)}>
                      + 멤버 초대
                    </button>
                  </div>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>이름</th>
                        <th>이메일</th>
                        <th>역할</th>
                        <th>상태</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map(m => (
                        <tr key={m.id}>
                          <td style={{ fontWeight: 500 }}>{m.name}</td>
                          <td style={{ color: 'var(--s400)', fontSize: 12 }}>{m.email}</td>
                          <td>
                            <select
                              value={m.role}
                              onChange={e => setMembers(prev =>
                                prev.map(x => x.id === m.id ? { ...x, role: e.target.value as MemberRole } : x)
                              )}
                              style={{ width: 'auto', padding: '3px 8px', fontSize: 12 }}
                              disabled={m.role === '관리자'}
                            >
                              <option>관리자</option>
                              <option>상담사</option>
                              <option>검수자</option>
                            </select>
                          </td>
                          <td>
                            <span className={`badge ${m.status === 'active' ? 'bdg-green' : 'bdg-gray'}`}>
                              {m.status === 'active' ? '활성' : '초대됨'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {m.role !== '관리자' && (
                              <button
                                className="btn btn-sm"
                                onClick={() => confirmDeleteMember(m)}
                                style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
                              >
                                삭제
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 역할별 권한 */}
                <div className="card">
                  <div className="card-head">
                    <span className="card-title">🔐 역할별 권한</span>
                  </div>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>메뉴 / 기능</th>
                        <th style={{ textAlign: 'center' }}>관리자</th>
                        <th style={{ textAlign: 'center' }}>상담사</th>
                        <th style={{ textAlign: 'center' }}>검수자</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rolePerms.map((row, i) => (
                        <tr key={i}>
                          <td style={{ fontSize: 13, color: 'var(--s700)' }}>{row.menu}</td>
                          <td style={{ textAlign: 'center' }}>
                            <PermToggle
                              checked={row.admin}
                              disabled={true}
                              onChange={() => {}}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <PermToggle
                              checked={row.editor}
                              onChange={checked => setRolePerms(prev =>
                                prev.map((r, j) => j === i ? { ...r, editor: checked } : r)
                              )}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <PermToggle
                              checked={row.viewer}
                              onChange={checked => setRolePerms(prev =>
                                prev.map((r, j) => j === i ? { ...r, viewer: checked } : r)
                              )}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                    <button className="btn btn-primary" onClick={() => showToast('역할별 권한이 저장되었습니다.')}>
                      권한 저장
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ════════ 알림 ════════ */}
            {section === 'notification' && (
              <div className="card" style={{ maxWidth: 640 }}>
                <div className="card-head">
                  <span className="card-title">🔔 알림 설정</span>
                </div>

                <NotifSectionLabel label="문의·상담" />
                <NotifRow label="신규 문의 알림 — 이메일"   on={notif.newInquiryEmail}    toggle={() => toggleNotif('newInquiryEmail')} />
                <NotifRow label="신규 문의 알림 — LINE"     on={notif.newInquiryLine}     toggle={() => toggleNotif('newInquiryLine')} />
                <NotifRow label="신규 문의 알림 — 카카오"   on={notif.newInquiryKakao}    toggle={() => toggleNotif('newInquiryKakao')} />
                <NotifRow label="48시간 미답변 초과 알림"   on={notif.overdueAlert}       toggle={() => toggleNotif('overdueAlert')} />

                <NotifSectionLabel label="예약" />
                <NotifRow label="예약 변경·취소 알림 — 이메일" on={notif.bookingEmail}   toggle={() => toggleNotif('bookingEmail')} />
                <NotifRow label="예약 변경·취소 알림 — LINE"   on={notif.bookingLine}    toggle={() => toggleNotif('bookingLine')} />

                <NotifSectionLabel label="리포트" />
                <NotifRow label="주간 리포트 — 이메일"         on={notif.weeklyReportEmail}  toggle={() => toggleNotif('weeklyReportEmail')} />
                <NotifRow label="월간 리포트 — 이메일"         on={notif.monthlyReportEmail} toggle={() => toggleNotif('monthlyReportEmail')} />

                <NotifSectionLabel label="시스템" />
                <NotifRow label="서비스 공지·업데이트 — 이메일" on={notif.systemEmail}   toggle={() => toggleNotif('systemEmail')} />

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                  <button className="btn btn-primary" onClick={saveSettings}>저장</button>
                </div>
              </div>
            )}

            {/* ════════ LINE 연동 ════════ */}
            {section === 'line' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* 연동 상태 */}
                <div className="card">
                  <div className="card-head">
                    <span className="card-title">💬 LINE Messaging API 연동</span>
                    <span className={`badge ${lineConnected ? 'bdg-green' : 'bdg-gray'}`}>
                      {lineConnected ? '연결됨' : '미연결'}
                    </span>
                  </div>
                  {lineConnected ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderRadius: 8,
                      background: '#D1FAE5', border: '1px solid #6EE7B7',
                      marginBottom: 14, fontSize: 12, color: '#065F46',
                    }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A', flexShrink: 0 }} />
                      LINE Messaging API가 정상 연결되어 있습니다. 자동 응답이 활성화되어 있습니다.
                    </div>
                  ) : (
                    <div style={{
                      padding: '10px 14px', borderRadius: 8,
                      background: 'var(--s50)', border: '1px solid var(--s200)',
                      marginBottom: 14, fontSize: 12, color: 'var(--s500)',
                    }}>
                      LINE 채널을 연결하면 자동 응답·봇 기능을 사용할 수 있습니다.
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <FormRow label="Channel ID">
                      <input type="text" value={lineChannelId}
                        onChange={e => setLineChannelId(e.target.value)} />
                    </FormRow>
                    <FormRow label="Channel Secret">
                      <input type="text" value={lineSecret}
                        onChange={e => setLineSecret(e.target.value)} />
                    </FormRow>
                    <FormRow label="Channel Access Token">
                      <input type="text" value={lineToken}
                        onChange={e => setLineToken(e.target.value)} />
                    </FormRow>
                    <FormRow label="Webhook URL (복사 전용)">
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input type="text" value="https://api.mediflow.io/webhook/line/oleps" readOnly
                          style={{ opacity: .7, cursor: 'text', flex: 1 }} />
                        <button className="btn btn-sm"
                          onClick={() => { navigator.clipboard?.writeText('https://api.mediflow.io/webhook/line/oleps'); showToast('URL이 복사되었습니다.', 'info') }}>
                          복사
                        </button>
                      </div>
                    </FormRow>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
                    {lineConnected && (
                      <button className="btn" style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
                        onClick={() => { setLineConnected(false); showToast('LINE 연동이 해제되었습니다.', 'info') }}>
                        연동 해제
                      </button>
                    )}
                    <button className="btn btn-primary"
                      onClick={() => { setLineConnected(true); showToast('LINE 연동 정보가 저장되었습니다.') }}>
                      {lineConnected ? '저장' : '연결하기'}
                    </button>
                  </div>
                </div>

                {/* Webhook 안내 */}
                <div className="card">
                  <div className="card-head">
                    <span className="card-title">📋 설정 안내</span>
                  </div>
                  <ol style={{ paddingLeft: 18, fontSize: 13, color: 'var(--s700)', lineHeight: 2 }}>
                    <li><a href="https://developers.line.biz/" target="_blank" style={{ color: 'var(--blue)' }}>LINE Developers Console</a> 에서 채널을 생성하세요.</li>
                    <li>Messaging API 채널의 <b>Channel ID</b>, <b>Channel Secret</b>, <b>Channel Access Token</b>을 복사하세요.</li>
                    <li>위 Webhook URL을 LINE 채널의 Webhook URL로 등록하세요.</li>
                    <li>저장 후 연동 상태가 <b>연결됨</b>으로 표시됩니다.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* ════════ Instagram 연동 ════════ */}
            {section === 'instagram' && (
              <div className="card">
                <div className="card-head">
                  <span className="card-title">📸 Instagram Business 연동</span>
                  <span className={`badge ${igConnected ? 'bdg-green' : 'bdg-gray'}`}>
                    {igConnected ? '연결됨' : '미연결'}
                  </span>
                </div>
                {igConnected ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 8,
                    background: '#D1FAE5', border: '1px solid #6EE7B7',
                    marginBottom: 18, fontSize: 12, color: '#065F46',
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A', flexShrink: 0 }} />
                    Instagram Business 계정이 연결되어 있습니다.
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)', marginBottom: 6 }}>
                      Instagram Business 계정을 연결하세요
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--s500)', marginBottom: 20, lineHeight: 1.6 }}>
                      Instagram DM 문의를 자동으로 수신하고<br />
                      게시물 성과를 마케팅 리포트에서 확인할 수 있습니다.
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => { setIgConnected(true); showToast('Instagram 계정이 연결되었습니다.') }}
                      style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', border: 'none', color: '#fff', fontWeight: 600 }}
                    >
                      Instagram으로 계속하기
                    </button>
                  </div>
                )}
                {igConnected && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <FormRow label="연결된 계정">
                      <input type="text" value="@oleps_clinic" readOnly style={{ opacity: .7 }} />
                    </FormRow>
                    <FormRow label="팔로워 수">
                      <input type="text" value="3,241" readOnly style={{ opacity: .7 }} />
                    </FormRow>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                      <button className="btn" style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
                        onClick={() => { setIgConnected(false); showToast('Instagram 연동이 해제되었습니다.', 'info') }}>
                        연동 해제
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ════════ 도메인 ════════ */}
            {section === 'domain' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* 기본 도메인 */}
                <div className="card">
                  <div className="card-head">
                    <span className="card-title">🌐 기본 도메인</span>
                    <span className="badge bdg-green">운영 중</span>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', background: 'var(--s50)',
                    borderRadius: 8, border: '1px solid var(--s200)',
                  }}>
                    <span style={{ fontSize: 18 }}>🌐</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)' }}>
                        {HOSPITAL_INFO.siteUrl}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 2 }}>
                        MEDIFLOW 제공 기본 도메인 · SSL 자동 적용
                      </div>
                    </div>
                  </div>
                </div>

                {/* 커스텀 도메인 */}
                <div className="card">
                  <div className="card-head">
                    <span className="card-title">🔗 커스텀 도메인 연결</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--s500)', marginBottom: 16, lineHeight: 1.6 }}>
                    소유한 도메인을 환자 사이트에 연결할 수 있습니다.
                    도메인 레지스트라에서 CNAME 레코드를 설정해야 합니다.
                  </p>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    <input
                      type="text"
                      placeholder="예: clinic.example.co.jp"
                      value={customDomain}
                      onChange={e => { setCustomDomain(e.target.value); setDomainStatus('idle') }}
                      style={{ flex: 1 }}
                    />
                    <button className="btn btn-primary" onClick={checkDomain}
                      disabled={!customDomain || domainStatus === 'checking'}>
                      {domainStatus === 'checking' ? '확인 중...' : '도메인 확인'}
                    </button>
                  </div>
                  {domainStatus === 'ok' && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 14px', background: '#D1FAE5',
                      borderRadius: 8, fontSize: 12, color: '#065F46',
                    }}>
                      ✅ 도메인이 확인되었습니다. 저장하면 연결이 완료됩니다.
                    </div>
                  )}
                  {domainStatus === 'error' && (
                    <div style={{
                      padding: '10px 14px', background: 'var(--red-l)',
                      borderRadius: 8, fontSize: 12, color: 'var(--red)',
                    }}>
                      ❌ 도메인을 확인할 수 없습니다. CNAME 설정을 확인하세요.
                    </div>
                  )}

                  {/* DNS 안내 */}
                  <div style={{
                    marginTop: 16, padding: '14px 16px',
                    background: 'var(--s50)', borderRadius: 8,
                    border: '1px solid var(--s200)',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--s500)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      DNS 설정 안내
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--s200)' }}>
                          <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--s400)', fontWeight: 700 }}>타입</th>
                          <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--s400)', fontWeight: 700 }}>호스트</th>
                          <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--s400)', fontWeight: 700 }}>값</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: '6px 8px', color: 'var(--navy)', fontFamily: 'monospace' }}>CNAME</td>
                          <td style={{ padding: '6px 8px', color: 'var(--s700)', fontFamily: 'monospace' }}>@</td>
                          <td style={{ padding: '6px 8px', color: 'var(--s700)', fontFamily: 'monospace' }}>sites.mediflow.io</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {domainStatus === 'ok' && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                      <button className="btn btn-primary" onClick={() => {
                        showToast(`${customDomain} 이 연결되었습니다.`)
                        setDomainStatus('idle')
                        setCustomDomain('')
                      }}>저장</button>
                    </div>
                  )}
                </div>

                {/* SSL */}
                <div className="card">
                  <div className="card-head">
                    <span className="card-title">🔒 SSL 인증서</span>
                    <span className="badge bdg-green">자동 갱신</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--s500)', lineHeight: 1.6 }}>
                    MEDIFLOW는 Let&#39;s Encrypt를 통해 SSL 인증서를 자동으로 발급·갱신합니다.
                    별도 설정 없이 HTTPS가 적용됩니다.
                  </p>
                </div>
              </div>
            )}

            {/* ════════ 플랜 ════════ */}
            {section === 'plan' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* 현재 플랜 요약 */}
                <div className="card">
                  <div className="card-head">
                    <span className="card-title">💳 현재 플랜</span>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', background: 'var(--navy-l)',
                    borderRadius: 10, border: '1px solid rgba(37,99,235,.15)',
                    marginBottom: 4,
                  }}>
                    <span style={{ fontSize: 32 }}>💎</span>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>Pro 플랜</div>
                      <div style={{ fontSize: 12, color: 'var(--s500)', marginTop: 2 }}>₩890,000 / 월 · 다음 결제일: 2026-07-01</div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <span className="badge bdg-navy">활성</span>
                    </div>
                  </div>
                </div>

                {/* 플랜 카드 3개 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                  {PLANS.map(p => {
                    const isCurrent = p.key === currentPlan
                    return (
                      <div key={p.key} style={{
                        background: '#fff',
                        border: `2px solid ${isCurrent ? 'var(--navy)' : 'var(--s200)'}`,
                        borderRadius: 'var(--rl)',
                        padding: '20px 18px',
                        position: 'relative',
                        boxShadow: isCurrent ? '0 4px 20px rgba(13,27,62,.1)' : 'var(--sh)',
                      }}>
                        {isCurrent && (
                          <div style={{
                            position: 'absolute', top: -11, left: 16,
                            background: 'var(--navy)', color: '#fff',
                            fontSize: 10, fontWeight: 700,
                            padding: '2px 10px', borderRadius: 20,
                          }}>현재 플랜</div>
                        )}
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>{p.name}</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy)', marginBottom: 14 }}>
                          {p.price}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--s400)' }}>{p.period}</span>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, marginBottom: 18 }}>
                          {p.features.map((f, i) => (
                            <li key={i} style={{
                              fontSize: 12, color: 'var(--s700)',
                              padding: '4px 0', display: 'flex', alignItems: 'flex-start', gap: 6,
                            }}>
                              <span style={{ color: '#16A34A', flexShrink: 0, marginTop: 1 }}>✓</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                        {isCurrent ? (
                          <button className="btn" style={{ width: '100%', justifyContent: 'center', cursor: 'not-allowed', opacity: .5 }} disabled>
                            현재 플랜
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary"
                            style={{ width: '100%', justifyContent: 'center' }}
                            onClick={() => openPlanChange(p)}
                          >
                            {p.key === 'enterprise' ? '문의하기' :
                              (p.key === 'basic' ? '다운그레이드' : '업그레이드')}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* 결제 정보 */}
                <div className="card">
                  <div className="card-head">
                    <span className="card-title">💳 결제 정보</span>
                    <button className="btn btn-sm"
                      onClick={() => showToast('결제 수단 변경 페이지로 이동합니다.', 'info')}>
                      변경
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>💳</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--s700)' }}>Visa •••• •••• •••• 4242</div>
                      <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 2 }}>만료: 2028 / 09</div>
                    </div>
                  </div>
                </div>

                {/* 청구 내역 */}
                <div className="card">
                  <div className="card-head">
                    <span className="card-title">📄 청구 내역</span>
                  </div>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>청구일</th>
                        <th>플랜</th>
                        <th>금액</th>
                        <th>상태</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { date: '2026-06-01', plan: 'Pro', amount: '₩890,000', status: '완료' },
                        { date: '2026-05-01', plan: 'Pro', amount: '₩890,000', status: '완료' },
                        { date: '2026-04-01', plan: 'Pro', amount: '₩890,000', status: '완료' },
                      ].map((b, i) => (
                        <tr key={i}>
                          <td style={{ fontSize: 13, color: 'var(--s700)' }}>{b.date}</td>
                          <td><span className="badge bdg-navy">{b.plan}</span></td>
                          <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{b.amount}</td>
                          <td><span className="badge bdg-green">{b.status}</span></td>
                          <td>
                            <button className="btn btn-sm"
                              onClick={() => showToast('영수증을 다운로드합니다.', 'info')}>
                              영수증
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>

        <footer className="site-footer">© 2026 MEDIFLOW. All rights reserved.</footer>
      </div>

      {/* ════════ INVITE MODAL ════════ */}
      {inviteModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setInviteModalOpen(false)}>
          <div style={{
            background: '#fff', borderRadius: 14, padding: '24px 28px',
            width: 420, boxShadow: '0 20px 60px rgba(0,0,0,.2)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>멤버 초대</div>
            <div style={{ fontSize: 13, color: 'var(--s500)', marginBottom: 20 }}>
              초대 이메일이 발송됩니다. 상대방이 수락하면 팀에 합류됩니다.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--s500)', display: 'block', marginBottom: 5 }}>
                  이메일 주소
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleInvite()}
                  autoFocus
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--s500)', display: 'block', marginBottom: 5 }}>
                  역할
                </label>
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value as MemberRole)}>
                  <option value="상담사">상담사</option>
                  <option value="검수자">검수자</option>
                  <option value="관리자">관리자</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn" onClick={() => setInviteModalOpen(false)}>취소</button>
              <button className="btn btn-primary" onClick={handleInvite}>초대 보내기</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ CONFIRM MODAL ════════ */}
      {confirmModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setConfirmModal(null)}>
          <div style={{
            background: '#fff', borderRadius: 14, padding: '24px 28px',
            width: 400, boxShadow: '0 20px 60px rgba(0,0,0,.2)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 12 }}>
              {confirmModal.title}
            </div>
            <div style={{ fontSize: 13, color: 'var(--s700)', lineHeight: 1.6, marginBottom: 20 }}
              dangerouslySetInnerHTML={{ __html: confirmModal.body }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setConfirmModal(null)}>취소</button>
              <button
                className="btn"
                style={{ background: 'var(--red)', borderColor: 'var(--red)', color: '#fff' }}
                onClick={confirmModal.onConfirm}
              >
                {confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ PLAN CHANGE MODAL ════════ */}
      {planModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setPlanModal(null)}>
          <div style={{
            background: '#fff', borderRadius: 14, padding: '24px 28px',
            width: 400, boxShadow: '0 20px 60px rgba(0,0,0,.2)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>
              플랜 변경
            </div>
            <div style={{ fontSize: 13, color: 'var(--s700)', lineHeight: 1.6, marginBottom: 6 }}>
              <b>{planModal.name}</b> 플랜({planModal.price}/월)으로 변경하시겠습니까?
            </div>
            <div style={{ fontSize: 12, color: 'var(--s400)', marginBottom: 20 }}>
              변경 사항은 다음 결제일부터 적용됩니다.
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setPlanModal(null)}>취소</button>
              <button className="btn btn-primary" onClick={confirmPlanChange}>변경 확인</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ TOAST ════════ */}
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

// ─────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--s500)', display: 'block', marginBottom: 5 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function NotifSectionLabel({ label }: { label: string }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: 'var(--s400)',
      letterSpacing: '.06em', textTransform: 'uppercase',
      padding: '14px 0 6px',
      borderTop: '1px solid var(--s100)',
      marginTop: 4,
    }}>
      {label}
    </div>
  )
}

function NotifRow({ label, on, toggle }: { label: string; on: boolean; toggle: () => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 0', borderBottom: '1px solid var(--s100)',
    }}>
      <span style={{ fontSize: 13, color: 'var(--s700)' }}>{label}</span>
      <button
        onClick={toggle}
        style={{
          width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
          background: on ? 'var(--navy)' : 'var(--s200)',
          position: 'relative', transition: 'background .2s', flexShrink: 0,
        }}
        aria-label={on ? '켜짐' : '꺼짐'}
      >
        <span style={{
          position: 'absolute', top: 3,
          left: on ? 21 : 3,
          width: 16, height: 16,
          borderRadius: '50%', background: '#fff',
          transition: 'left .2s',
          boxShadow: '0 1px 3px rgba(0,0,0,.2)',
        }} />
      </button>
    </div>
  )
}

function PermToggle({
  checked, disabled = false, onChange,
}: {
  checked: boolean; disabled?: boolean; onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      style={{
        width: 36, height: 20, borderRadius: 10, border: 'none',
        background: checked ? (disabled ? '#93C5FD' : 'var(--navy)') : 'var(--s200)',
        position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background .2s', opacity: disabled ? .6 : 1,
      }}
      aria-label={checked ? 'on' : 'off'}
    >
      <span style={{
        position: 'absolute', top: 2,
        left: checked ? 18 : 2,
        width: 16, height: 16,
        borderRadius: '50%', background: '#fff',
        transition: 'left .2s',
        boxShadow: '0 1px 3px rgba(0,0,0,.2)',
      }} />
    </button>
  )
}
