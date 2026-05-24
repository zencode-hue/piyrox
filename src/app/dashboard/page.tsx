import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      {/* Background gradients */}
      <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
      <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[150px] pointer-events-none"></div>
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Piyrox
              </span>
              <span className="text-gray-500 text-sm border-l border-gray-700 pl-4">Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="http://localhost:3001" className="text-sm text-gray-300 hover:text-white transition-colors">
                Launch Chat App
              </Link>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                J
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="mt-2 text-gray-400">Welcome back, John. Here's what's happening with your account.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#111]/80 backdrop-blur-md rounded-2xl p-6 border border-white/[0.05] hover:border-white/[0.1] transition-colors shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-medium">API Calls</h3>
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-white">24,592</p>
            <p className="mt-2 text-sm text-green-400 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              <span>12% from last month</span>
            </p>
          </div>
          
          <div className="bg-[#111]/80 backdrop-blur-md rounded-2xl p-6 border border-white/[0.05] hover:border-white/[0.1] transition-colors shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-medium">Chat Sessions</h3>
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-white">1,402</p>
            <p className="mt-2 text-sm text-green-400 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              <span>8% from last month</span>
            </p>
          </div>

          <div className="bg-[#111]/80 backdrop-blur-md rounded-2xl p-6 border border-white/[0.05] hover:border-white/[0.1] transition-colors shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-medium">Active Plan</h3>
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-white">Pro</p>
            <p className="mt-2 text-sm text-gray-500">
              Renews on Jun 24, 2026
            </p>
          </div>
        </div>

        {/* Subscription / Billing Section */}
        <div className="bg-[#111]/80 backdrop-blur-md rounded-3xl border border-white/[0.05] overflow-hidden shadow-2xl">
          <div className="px-6 py-8 md:p-10 border-b border-white/[0.05]">
            <h2 className="text-2xl font-bold mb-2">Subscription Details</h2>
            <p className="text-gray-400">Manage your billing and payment methods.</p>
          </div>
          <div className="px-6 py-8 md:p-10 bg-black/20 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <p className="text-lg font-medium">Pro Plan - $20/month</p>
              <p className="text-sm text-gray-400 mt-1">Includes GPT-4, Claude 3 Opus, and unlimited IDE usage.</p>
            </div>
            <div className="flex gap-4">
              <button className="px-6 py-2.5 rounded-xl border border-gray-600 text-sm font-medium hover:bg-gray-800 transition-colors">
                Cancel Plan
              </button>
              <button className="px-6 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                Upgrade to Team
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
