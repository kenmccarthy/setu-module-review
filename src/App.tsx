import { Navigate, Route, Routes } from 'react-router-dom'
import { Shell } from './components/layout/Shell'
import { HomePage } from './features/home/HomePage'
import { SavedReviewsPage } from './features/home/SavedReviewsPage'
import { ReviewRoute } from './features/review/ReviewRoute'
import { HelpPage } from './pages/Help'

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<HomePage />} />
        <Route path="reviews" element={<SavedReviewsPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="programme/:reviewId">
          <Route index element={<Navigate to="context" replace />} />
          <Route path=":section" element={<ReviewRoute kind="programme" />} />
        </Route>
        <Route path="module/:reviewId">
          <Route index element={<Navigate to="context" replace />} />
          <Route path=":section" element={<ReviewRoute kind="module" />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
