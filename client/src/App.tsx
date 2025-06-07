import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './routes/HomePage'
import UsersPage from './routes/UsersPage'
import UserDetailPage from './routes/UserDetailPage'
import CreateUserPage from './routes/CreateUserPage'
import EditUserPage from './routes/EditUserPage'
import SleepListPage from './routes/sleep/SleepListPage'
import SleepCreatePage from './routes/sleep/SleepCreatePage'
import SleepEditPage from './routes/sleep/SleepEditPage'
import SleepStatisticsPage from './routes/sleep/SleepStatisticsPage'
import { SleepBadgesPage } from './routes/sleep/SleepBadgesPage'
import { SleepDashboard } from './routes/SleepDashboard'
import { AIAdvicePage } from './pages/AIAdvicePage'
import NotFoundPage from './routes/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<SleepDashboard />} />
        <Route path="dashboard" element={<SleepDashboard />} />
        <Route path="records" element={<SleepListPage />} />
        <Route path="sleep">
          <Route index element={<Navigate to="/" replace />} />
          <Route path="new" element={<SleepCreatePage />} />
          <Route path="edit/:id" element={<SleepEditPage />} />
          <Route path="statistics" element={<SleepStatisticsPage />} />
          <Route path="badges" element={<SleepBadgesPage />} />
          <Route path="ai-advice" element={<AIAdvicePage />} />
        </Route>
        <Route path="users">
          <Route index element={<UsersPage />} />
          <Route path="new" element={<CreateUserPage />} />
          <Route path=":id" element={<UserDetailPage />} />
          <Route path=":id/edit" element={<EditUserPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
