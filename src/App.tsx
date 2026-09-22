import { Navigate, Route, Routes } from 'react-router-dom'
import { Shell } from './components/layout/Shell'
import { Home } from './pages/Home'
import { HelpPage } from './pages/Help'
import { ContextPage } from './pages/programme/ContextPage'
import { CapabilitiesPage } from './pages/programme/CapabilitiesPage'
import { ProgressionPage } from './pages/programme/ProgressionPage'
import { PortfolioPage } from './pages/programme/PortfolioPage'
import { CoherencePage } from './pages/programme/CoherencePage'
import { ModulesPage } from './pages/modules/ModulesPage'
import { ModulePage } from './pages/modules/ModulePage'
import { AssessmentPage } from './pages/modules/AssessmentPage'
import { DashboardPage } from './pages/synthesis/DashboardPage'
import { PatternsPage } from './pages/synthesis/PatternsPage'
import { DiscussionPage } from './pages/synthesis/DiscussionPage'
import { ActionsPage } from './pages/synthesis/ActionsPage'
import { SummaryPage } from './pages/synthesis/SummaryPage'
import { StatementPage } from './pages/statement/StatementPage'
import { FullStatementPage } from './pages/statement/FullStatementPage'
import { PrintPage } from './pages/Print'

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Home />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="programme">
          <Route index element={<Navigate to="context" replace />} />
          <Route path="context" element={<ContextPage />} />
          <Route path="capabilities" element={<CapabilitiesPage />} />
          <Route path="progression" element={<ProgressionPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="coherence" element={<CoherencePage />} />
        </Route>
        <Route path="modules">
          <Route index element={<ModulesPage />} />
          <Route path=":moduleId" element={<ModulePage />} />
          <Route path=":moduleId/assessments/:assessmentId" element={<AssessmentPage />} />
        </Route>
        <Route path="synthesis">
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="patterns" element={<PatternsPage />} />
          <Route path="discussion" element={<DiscussionPage />} />
          <Route path="actions" element={<ActionsPage />} />
          <Route path="summary" element={<SummaryPage />} />
        </Route>
        <Route path="statement">
          <Route index element={<StatementPage />} />
          <Route path="full" element={<FullStatementPage />} />
        </Route>
        <Route path="print" element={<PrintPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
