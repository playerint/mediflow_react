'use client'

import Link from 'next/link'
import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import { HOSPITALS } from '@/lib/mock-data'

type SiteFilter = 'all' | 'live' | 'violation' | 'pending'

const SITE_DATA = HOSPITALS.filter(h => h.status === 'active').map((h, i) => ({
  ...h,
  compliance: (['정상', '정상', '위반', '정상', '정상', '위반', '정상', '정상', '위반'] as const)[i % 9],
  lastPublished: ['2일 전', '5일 전', '1일 전', '12일 전', '3일 전', '7일 전', '4일 전', '1일 전', '9일 전'][i % 9],
  lcp: [1.2, 2.1, 0.9, 3.4, 1.8, 2.5, 1.1, 0.8, 2.9][i % 9],
  pending: [false, false, false, true, false, false, true, false, false][i % 9],
}))

export default function SitePage() {
  const [filter, setFilter] = useState<SiteFilter>('all')

  const liveCount     = SITE_DATA.length
  const violationCount = SITE_DATA.filter(h => h.compliance === '위반').length
  const pendingCount  = SITE_DATA.filter(h => h.pending).length

  const filtered = SITE_DATA.filter(h => {
    if (filter === 'live')      return h.compliance !== '위반' && !h.pending
    if (filter === 'violation') return h.compliance === '위반'
    if (filter === 'pending')   return h.pending
    return true
  })

  return (
    <>
      <PageHeader title="사이트 관리">
        <div className="filter-pills" style={{ margin: 0 }}>
          {([
            { key: 'all',       label: `전체 ${liveCount}` },
            { key: 'live',      label: `게시 중 ${liveCount - violationCount - pendingCount}` },
            { key: 'violation', label: `위반 ${violationCount}` },
            { key: 'pending',   label: `검수 대기 ${pendingCount}` },
          ] as { key: SiteFilter; label: string }[]).map(f => (
            <button
              key={f.key}
              className={`pill${filter === f.key ? ' on' : ''}`}
              onClick={() => setFilter(f.key)}
            >{f.label}</button>
          ))}
        </div>
      </PageHeader>
      <div className="content fade">

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: '🌐 전체 사이트',        value: liveCount,      unit: '개' },
            { label: '✅ 게시 중',             value: liveCount - violationCount - pendingCount, unit: '개' },
            { label: '⚠ 컴플라이언스 위반',   value: violationCount, unit: '건' },
            { label: '📝 검수 대기',           value: pendingCount,   unit: '건' },
          ].map(k => (
            <div key={k.label} className="kpi-card">
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">{k.value}<span className="kpi-unit">{k.unit}</span></div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>병원명</th>
                <th>사이트 URL</th>
                <th>게시 상태</th>
                <th>컴플라이언스</th>
                <th>마지막 게시</th>
                <th>Core Web Vitals (LCP)</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(h => (
                <tr key={h.id}>
                  <td style={{ fontWeight: 600 }}>{h.name}</td>
                  <td style={{ fontSize: 12, color: 'var(--blue)' }}>{h.url}</td>
                  <td>
                    {h.pending
                      ? <span className="badge bdg-blue">검수 대기</span>
                      : <span className="badge bdg-green">게시 중</span>
                    }
                  </td>
                  <td>
                    <span className={h.compliance === '위반' ? 'badge bdg-red' : 'badge bdg-green'}>
                      {h.compliance}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--s500)' }}>{h.lastPublished}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: h.lcp <= 1.5 ? 'var(--green)' : h.lcp <= 2.5 ? '#D97706' : 'var(--red)' }}>
                      {h.lcp}s
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link href={`/hospitals/${h.id}`} className="btn btn-sm">상세</Link>
                      <a href={`https://${h.url}`} target="_blank" rel="noreferrer" className="btn btn-sm">🔗 방문</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
