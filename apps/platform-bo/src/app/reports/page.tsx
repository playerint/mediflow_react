'use client'

import { useState } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend,
} from 'chart.js'
import PageHeader from '@/components/PageHeader'
import { HOSPITALS } from '@/lib/mock-data'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const MONTHS = ['2026년 6월', '2026년 5월', '2026년 4월', '2026년 3월']

const REPORT_DATA = HOSPITALS.filter(h => h.status === 'active').map((h, i) => ({
  ...h,
  visitors:   [1240, 980, 2100, 540, 870, 760, 430, 1100, 310][i % 9],
  conversion: [1.9, 1.8, 1.5, 1.7, 1.6, 1.4, 1.6, 1.5, 1.6][i % 9],
  aeo:        [58, 44, 94, 9, 31, 22, 7, 16, 5][i % 9],
  lineRate:   [78, 65, 88, 52, 71, 60, 48, 73, 41][i % 9],
  revenue:    [980000, 980000, 2500000, 490000, 980000, 980000, 490000, 980000, 490000][i % 9],
  delta:      [+31, +18, +23, -4, +12, +7, -2, +15, -8][i % 9],
}))

const COLORS = ['#0D1B3E','#2563EB','#0D9488','#7C3AED','#D97706','#059669','#DC2626','#0891B2','#65A30D']

export default function ReportsPage() {
  const [month, setMonth] = useState(MONTHS[0])

  const totalInq = REPORT_DATA.reduce((s, h) => s + h.inq, 0)
  const totalAeo = REPORT_DATA.reduce((s, h) => s + h.aeo, 0)
  const totalRev = REPORT_DATA.reduce((s, h) => s + h.revenue, 0)

  const shortName = (name: string) => name.replace('성형외과','').replace('클리닉','').replace('뷰티','뷰')

  const visitorChart = {
    labels: REPORT_DATA.map(h => shortName(h.name)),
    datasets: [{
      label: '방문자 수',
      data: REPORT_DATA.map(h => h.visitors),
      backgroundColor: COLORS,
      borderRadius: 4,
    }],
  }

  const revenueChart = {
    labels: REPORT_DATA.map(h => shortName(h.name)),
    datasets: [{
      data: REPORT_DATA.map(h => h.revenue),
      backgroundColor: COLORS,
      borderWidth: 0,
    }],
  }

  return (
    <>
      <PageHeader title="리포트">
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            value={month}
            onChange={e => setMonth(e.target.value)}
            style={{ fontSize: 12, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--s200)', background: '#fff' }}
          >
            {MONTHS.map(m => <option key={m}>{m}</option>)}
          </select>
          <button className="btn btn-primary">PDF 생성</button>
        </div>
      </PageHeader>
      <div className="content fade">

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: '📊 전체 문의 합계',   value: totalInq,                            unit: '건' },
            { label: '🧠 전체 AEO 인용',    value: totalAeo,                            unit: '회' },
            { label: '📣 LINE 팔로워 합계', value: '6.2K',                              unit: '' },
            { label: '💳 이번 달 매출',     value: `${(totalRev/1000000).toFixed(1)}M`, unit: '₩' },
          ].map(k => (
            <div key={k.label} className="kpi-card">
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">{k.value}<span className="kpi-unit">{k.unit}</span></div>
            </div>
          ))}
        </div>

        <div className="grid2" style={{ marginBottom: 14 }}>
          <div className="card">
            <div className="card-head"><div className="card-title">📈 병원별 방문자 비교</div></div>
            <Bar
              data={visitorChart}
              options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }}
            />
          </div>
          <div className="card">
            <div className="card-head"><div className="card-title">💰 병원별 매출 기여</div></div>
            <Doughnut
              data={revenueChart}
              options={{ responsive: true, plugins: { legend: { position: 'right', labels: { font: { size: 11 } } } } }}
            />
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="card-head" style={{ padding: '14px 16px' }}>
            <div className="card-title">🏥 병원별 종합 성과표 ({month})</div>
            <button className="btn btn-sm">CSV 다운로드</button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>병원명</th>
                <th style={{ textAlign: 'right' }}>방문자</th>
                <th style={{ textAlign: 'right' }}>문의</th>
                <th style={{ textAlign: 'right' }}>전환율</th>
                <th style={{ textAlign: 'right' }}>AEO 인용</th>
                <th style={{ textAlign: 'right' }}>LINE 해결률</th>
                <th style={{ textAlign: 'right' }}>매출</th>
                <th style={{ textAlign: 'right' }}>전월 대비</th>
              </tr>
            </thead>
            <tbody>
              {REPORT_DATA.map(h => (
                <tr key={h.id}>
                  <td style={{ fontWeight: 600 }}>{h.name}</td>
                  <td style={{ textAlign: 'right' }}>{h.visitors.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{h.inq}건</td>
                  <td style={{ textAlign: 'right' }}>{h.conversion}%</td>
                  <td style={{ textAlign: 'right' }}>{h.aeo}회</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={h.lineRate >= 70 ? 'badge bdg-green' : h.lineRate >= 55 ? 'badge bdg-blue' : 'badge bdg-gray'}>
                      {h.lineRate}%
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>₩{(h.revenue/10000).toFixed(0)}만</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    <span style={{ color: h.delta >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {h.delta >= 0 ? '+' : ''}{h.delta}%
                    </span>
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
