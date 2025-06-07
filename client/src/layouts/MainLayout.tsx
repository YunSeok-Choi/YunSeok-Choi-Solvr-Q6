import { Outlet, Link } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-600">
                🌙 수면 기록 앱
              </Link>
            </div>
            <nav className="flex space-x-4">
              <Link
                to="/"
                className="text-neutral-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                수면 기록
              </Link>
              <Link
                to="/sleep/new"
                className="text-neutral-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                새 기록
              </Link>
              <Link
                to="/sleep/statistics"
                className="text-neutral-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                📊 통계
              </Link>
              <Link
                to="/users"
                className="text-neutral-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                유저 관리
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
      <footer className="bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-neutral-500 text-sm">
            &copy; {new Date().getFullYear()} 수면 기록 앱. 건강한 수면 습관을 만들어보세요. 🌙
          </p>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout
