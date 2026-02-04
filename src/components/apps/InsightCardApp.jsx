import React, { useEffect, useState } from 'react'
import './InsightCardApp.css'

const sampleStats = {
  channel: 'Your Channel',
  period: 'Last 28 days',
  segments: [
    { name: 'US • 18-24 • Mobile', share: '32%', best: 'Shorts 30-45s', hook: '“3 hacks in 30 seconds”', time: 'Sat 11am PT' },
    { name: 'IN • 25-34 • Mobile', share: '24%', best: 'Shorts 20-30s', hook: '“Before/After in 20s”', time: 'Sun 7pm IST' },
    { name: 'US/UK • 35-44 • Desktop', share: '18%', best: '10–12 min', hook: 'Case study w/ charts', time: 'Tue 6pm PT' },
  ],
  winners: [
    { title: 'AI editing workflow', retention: '72%', ctr: '6.1%' },
    { title: '5 Shorts mistakes', retention: '68%', ctr: '7.4%' },
  ],
  nextWeek: [
    { idea: '“60s edit stack”', type: 'Short', time: 'Sat 11am PT' },
    { idea: '“Client case breakdown”', type: 'Long 10m', time: 'Tue 6pm PT' },
    { idea: '“Hook swipe file”', type: 'Carousel', time: 'Thu 8am PT' },
  ],
}

const InsightCardApp = () => {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    // If redirected back with connected flag, mark as connected
    if (window.location.search.includes('connected=1')) {
      setConnected(true)
    }
  }, [])

  const handleConnect = () => {
    window.location.href = '/api/googleAuth'
  }

  const handleRun = async () => {
    setLoading(true)
    setError('')
    try {
      const resp = await fetch('/api/profile')
      if (!resp.ok) {
        throw new Error('Auth expired or not connected. Please reconnect.')
      }
      const data = await resp.json()
      // TODO: replace mapping with real segmentation logic
      const channelTitle = data.channel?.snippet?.title || 'Your Channel'
      const period = 'Last 28 days'
      setStats({
        ...sampleStats,
        channel: channelTitle,
        period,
        raw: data,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    window.print()
  }

  return (
    <div className="insight-app">
      <header className="insight-header">
        <div>
          <p className="eyebrow">InsightCard</p>
          <h1>Know what to post next week</h1>
          <p className="lede">Connect YouTube, fetch fresh stats, auto-cluster your audience, and get a one-page shareable card.</p>
        </div>
        <div className="cta-row">
          {!connected ? (
            <button className="btn primary" onClick={handleConnect}>Connect Google</button>
          ) : (
            <button className="btn ghost" disabled>Google connected</button>
          )}
          <button className="btn secondary" onClick={handleRun} disabled={!connected || loading}>
            {loading ? 'Running…' : 'Fetch & run analytics'}
          </button>
          <button className="btn ghost" onClick={handleExport} disabled={!stats}>Export card</button>
        </div>
      </header>

      <section className="insight-body">
        {error && <div className="error-banner">{error}</div>}
        {!stats && (
          <div className="empty-state">
            <p>Connect Google, then fetch your latest audience and performance data to generate the card.</p>
          </div>
        )}

        {stats && (
          <div className="card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Channel</p>
                <h2>{stats.channel}</h2>
                <p className="muted">{stats.period}</p>
              </div>
              <div className="badge">Shareable</div>
            </div>

            <div className="grid">
              <div className="panel">
                <p className="eyebrow">Top audience segments</p>
                <ul className="list">
                  {stats.segments.map((s) => (
                    <li key={s.name}>
                      <div className="row">
                        <span className="label">{s.name}</span>
                        <span className="pill">{s.share}</span>
                      </div>
                      <p className="muted">Best: {s.best} · Hook: {s.hook} · Time: {s.time}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="panel">
                <p className="eyebrow">Winners</p>
                <ul className="list">
                  {stats.winners.map((w) => (
                    <li key={w.title}>
                      <div className="row">
                        <span className="label">{w.title}</span>
                        <span className="pill">Retention {w.retention}</span>
                      </div>
                      <p className="muted">CTR {w.ctr}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="panel">
              <p className="eyebrow">Next week suggestions</p>
              <div className="suggestions">
                {stats.nextWeek.map((n) => (
                  <div className="suggestion" key={n.idea}>
                    <p className="label">{n.idea}</p>
                    <p className="muted">{n.type} · {n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default InsightCardApp
