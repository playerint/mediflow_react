'use client'

import { useState } from 'react'

interface RtMsg {
  day:   string
  label: string
  stats: string[]
  ja:    string
  ko:    string
}

const RT_MESSAGES: RtMsg[] = [
  {
    day: 'd3', label: 'D+3 발송',
    stats: ['발송 18건', '클릭률 44%', '전환율 11%'],
    ja: '先日のカウンセリングはいかがでしたか？ご不明な点がございましたら、いつでもお気軽にご相談ください。',
    ko: '지난번 상담은 어떠셨나요? 궁금한 점이 있으시면 언제든지 편하게 상담해 주세요.',
  },
  {
    day: 'd7', label: 'D+7 발송',
    stats: ['발송 15건', '클릭률 38%', '전환율 13%'],
    ja: '二重整形のビフォーアフター症例をご用意しました。ご参考にぜひご覧ください。',
    ko: '쌍꺼풀 성형 Before&After 사례를 준비했습니다.',
  },
  {
    day: 'd14', label: 'D+14 발송',
    stats: ['발송 12건', '클릭률 29%', '전환율 8%'],
    ja: '今月末まで初回カウンセリング割引キャンペーン実施中！お早めにご予約ください。',
    ko: '이달 말까지 첫 상담 할인 캠페인 진행 중!',
  },
]

const LINE_RULES = [
  { label: '폼 제출',  action: 'LINE 환영 메시지 발송', timing: '즉시',      enabled: true },
  { label: '예약 확정 시', action: '확정 메시지 LINE 발송', timing: '즉시',   enabled: true },
  { label: '예약 D-1', action: '리마인더 LINE 발송',   timing: '전일 10:00', enabled: true },
]

const LOG_ITEMS = [
  { time: '오늘 14:23', who: '김지현', what: 'D+3 메시지 수정' },
  { time: '어제 10:05', who: '김지현', what: 'LINE CTA 순서 변경' },
  { time: '5월 18일',   who: '김지현', what: '웹훅 URL 변경' },
]

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: 32, height: 18, borderRadius: 9, flexShrink: 0,
        background: on ? 'var(--teal)' : 'var(--s300)',
        position: 'relative', cursor: 'pointer', transition: 'background .2s',
      }}
    >
      <div style={{
        position: 'absolute', top: 2,
        left: on ? 14 : 2,
        width: 14, height: 14, borderRadius: '50%',
        background: '#fff', transition: 'left .15s',
        boxShadow: '0 1px 3px rgba(0,0,0,.2)',
      }} />
    </div>
  )
}

export default function FunnelPage() {
  const [rtLang, setRtLang] = useState<'ja' | 'ko'>('ja')
  const [rtOpen, setRtOpen] = useState<Record<string, boolean>>({})
  const [rules,  setRules]  = useState(LINE_RULES)
  const [ctaItems, setCtaItems] = useState([
    { icon: '💬', name: 'LINE 채팅',  cnt: '月 12건', enabled: true },
    { icon: '📸', name: '인스타그램', cnt: '月 11건', enabled: true },
  ])

  function toggleRule(i: number) {
    setRules(r => r.map((x, idx) => idx === i ? { ...x, enabled: !x.enabled } : x))
  }
  function toggleCta(i: number) {
    setCtaItems(c => c.map((x, idx) => idx === i ? { ...x, enabled: !x.enabled } : x))
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-title">채널 &amp; 자동 발송</span>
        </div>
        <div className="topbar-right">
          <button className="btn">🕐 변경 이력</button>
          <button className="btn btn-primary">💾 저장</button>
        </div>
      </div>

      <div className="content fade" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* CTA + CRM 웹훅 */}
        <div className="grid2">
          {/* CTA 버튼 카드 */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 6 }}>📱 CTA 버튼</div>
            <div style={{ fontSize: 12, color: 'var(--s400)', marginBottom: 12 }}>드래그로 순서 변경 · 토글로 ON/OFF</div>

            {ctaItems.map((item, i) => (
              <div key={item.name} className="cta-item">
                <span className="cta-handle">⠿</span>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span className="cta-name">{item.name}</span>
                <span className="cta-cnt">{item.cnt}</span>
                <Toggle on={item.enabled} onToggle={() => toggleCta(i)} />
              </div>
            ))}

            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--s100)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s500)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.04em' }}>LINE 설정</div>
              {[{ label: 'LINE ID', value: '@oleps' }, { label: '버튼 텍스트', value: 'LINEで相談する' }].map(f => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--s600)', minWidth: 72 }}>{f.label}</span>
                  <input type="text" defaultValue={f.value} style={{ flex: 1, fontSize: 12 }} />
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--s100)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s500)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.04em' }}>인스타그램 설정</div>
              {[{ label: '계정 ID', value: '@oleps_official' }, { label: '버튼 텍스트', value: 'Instagramで見る' }].map(f => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--s600)', minWidth: 72 }}>{f.label}</span>
                  <input type="text" defaultValue={f.value} style={{ flex: 1, fontSize: 12 }} />
                </div>
              ))}
            </div>
          </div>

          {/* CRM 웹훅 카드 */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>🔗 CRM 웹훅 연결</div>
            <div className="wh-row">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--s700)' }}>웹훅 URL</div>
                <input type="text" defaultValue="https://crm.example.com/webhook/oleps" style={{ marginTop: 6 }} />
              </div>
            </div>
            <div className="wh-row">
              <div style={{ flex: 1, fontSize: 12, fontWeight: 500, color: 'var(--s700)' }}>연결 상태</div>
              <span>
                <span className="st-dot" style={{ background: 'var(--green)' }} />
                <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 500 }}>정상 연결</span>
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              <button className="btn" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}>테스트 발송</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}>저장</button>
            </div>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--s100)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s700)', marginBottom: 8 }}>CRM 웹훅 연결이란?</div>
              <div style={{ fontSize: 12, color: 'var(--s500)', lineHeight: 1.7 }}>
                병원에서 <b style={{ color: 'var(--s700)' }}>기존에 사용 중인 CRM</b>(예: HubSpot, Salesforce, 자체 시스템)과 MEDIFLOW를 연결하는 기능입니다. 환자가 폼을 제출하거나 예약이 확정될 때 해당 URL로 자동 알림을 전송합니다.
              </div>
              <div style={{ marginTop: 10, padding: '9px 12px', background: 'var(--red-l)', borderRadius: 'var(--r)', fontSize: 12, color: 'var(--red)', fontWeight: 500 }}>
                ⚠ 웹훅 URL 발급 및 연동은 <b>개발 작업이 필요</b>합니다. MEDIFLOW 기술팀에 요청하세요.
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s700)', marginTop: 12, marginBottom: 6 }}>연결하지 않아도 되는 경우</div>
              <div style={{ fontSize: 12, color: 'var(--s500)', lineHeight: 1.8 }}>
                • MEDIFLOW의 CRM 인박스와 예약 관리만으로 충분한 경우<br />
                • 별도 외부 CRM 툴을 사용하지 않는 경우<br />
                • MEDIFLOW 플랫폼이 자동화를 대신 처리하는 경우
              </div>
            </div>
          </div>
        </div>

        {/* D+3/7/14 리타게팅 */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div className="card-title">⚡ D+3/7/14 리타게팅 메시지</div>
            <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--s200)' }}>
              <button
                onClick={() => setRtLang('ja')}
                style={{
                  padding: '4px 12px', fontSize: 12, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  background: rtLang === 'ja' ? 'var(--navy)' : '#fff',
                  color:      rtLang === 'ja' ? '#fff'       : 'var(--s500)',
                  fontWeight: rtLang === 'ja' ? 500 : 400,
                }}
              >日</button>
              <button
                onClick={() => setRtLang('ko')}
                style={{
                  padding: '4px 12px', fontSize: 12, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  background: rtLang === 'ko' ? 'var(--blue)' : '#fff',
                  color:      rtLang === 'ko' ? '#fff'        : 'var(--s500)',
                }}
              >한</button>
            </div>
          </div>
          {RT_MESSAGES.map(msg => (
            <div key={msg.day} className="rt-item">
              <div
                className="rt-head"
                onClick={() => setRtOpen(o => ({ ...o, [msg.day]: !o[msg.day] }))}
              >
                <div className="rt-day">{msg.label}</div>
                <div className="rt-stats">
                  {msg.stats.map(s => <span key={s}>{s}</span>)}
                  <span>{rtOpen[msg.day] ? '▴' : '▾'}</span>
                </div>
              </div>
              {rtOpen[msg.day] && (
                <div className="rt-body">
                  <div className="rt-msg">{rtLang === 'ko' ? msg.ko : msg.ja}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm" style={{ fontSize: 12 }}>✏ 편집</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 자동 LINE 발송 규칙 */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>
            🤖 자동 LINE 발송 설정
            <button className="btn btn-sm" style={{ fontSize: 12, padding: '4px 10px', marginLeft: 6 }}>+ 추가</button>
          </div>
          {rules.map((r, i) => (
            <div key={r.label} className="rule-item">
              <span style={{ fontSize: 16 }}>⚡</span>
              <span className="rule-tr">{r.label}</span>
              <span className="rule-ar">→</span>
              <span className="rule-ac">{r.action}</span>
              <span style={{ fontSize: 12, color: 'var(--s400)', marginLeft: 'auto' }}>{r.timing}</span>
              <Toggle on={r.enabled} onToggle={() => toggleRule(i)} />
            </div>
          ))}
        </div>

        {/* 설정 변경 이력 */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>🕐 설정 변경 이력</div>
          {LOG_ITEMS.map((item, i) => (
            <div key={i} className="log-item">
              <span className="log-time">{item.time}</span>
              <span className="log-who">{item.who}</span>
              <span className="log-what">{item.what}</span>
              <span className="log-rb">롤백</span>
            </div>
          ))}
        </div>

        <footer className="site-footer">© 2026 MEDIFLOW. All rights reserved.</footer>
      </div>
    </>
  )
}
