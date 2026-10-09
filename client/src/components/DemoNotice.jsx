import { USING_MOCK_API } from '../api'

export default function DemoNotice() {
  if (!USING_MOCK_API) return null
  return <div className="demo-notice" role="status"><strong>Interactive demo mode.</strong> GradePulse is using sample courses stored in this browser, so you can try adding courses, categories, and scores without a database. To use shared, persistent data, configure the Express API and PostgreSQL connection. Browser demo data is not shared with other visitors.</div>
}
