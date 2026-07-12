import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowRight, Box, Building2, GraduationCap, Hospital, Factory, 
  PackageSearch, ArrowRightLeft, CalendarDays, Wrench, ClipboardCheck, 
  BarChart3, Shield, Users, UserCog, User
} from 'lucide-react';

export default function Landing() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* 1. Header (Part of Hero Context) */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Box className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">AssetFlow</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:block">
                  Log in
                </Link>
                <Link to="/signup" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 1. Hero Section */}
      <section className="pt-20 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                Manage Your Assets with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Ease</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Track, allocate, and maintain your organization's resources from one intuitive platform. Simplify your workflow and never lose track of an asset again.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Link to="/dashboard" className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-blue-700 transition-colors shadow-sm">
                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link to="/signup" className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-blue-700 transition-colors shadow-sm">
                      Get Started
                    </Link>
                    <button className="flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-300 px-6 py-3 rounded-lg text-base font-medium hover:bg-slate-50 transition-colors shadow-sm">
                      Request Demo
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Dashboard Mockup / Image */}
            <div className="relative rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden aspect-[4/3] flex flex-col hidden sm:flex">
              <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="p-6 flex-1 flex flex-col gap-4 bg-slate-50/50">
                <div className="flex gap-4">
                  <div className="flex-1 h-24 bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg"></div>
                    <div className="w-16 h-4 bg-slate-200 rounded"></div>
                  </div>
                  <div className="flex-1 h-24 bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                    <div className="w-8 h-8 bg-green-100 rounded-lg"></div>
                    <div className="w-20 h-4 bg-slate-200 rounded"></div>
                  </div>
                  <div className="flex-1 h-24 bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg"></div>
                    <div className="w-14 h-4 bg-slate-200 rounded"></div>
                  </div>
                </div>
                <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                  <div className="w-1/3 h-5 bg-slate-200 rounded mb-2"></div>
                  <div className="w-full h-8 bg-slate-50 rounded"></div>
                  <div className="w-full h-8 bg-slate-50 rounded"></div>
                  <div className="w-full h-8 bg-slate-50 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trusted By / Industries */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-8">Trusted across industries</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <Building2 className="w-6 h-6 text-blue-500" /> Offices
            </div>
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <GraduationCap className="w-6 h-6 text-emerald-500" /> Schools
            </div>
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <Hospital className="w-6 h-6 text-red-500" /> Hospitals
            </div>
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <Factory className="w-6 h-6 text-amber-500" /> Factories
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features (6 Cards) */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Powerful features designed to simplify every aspect of your asset management lifecycle.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Asset Management', desc: 'Centralized directory for all hardware, software, and physical assets.', icon: PackageSearch, color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: 'Asset Allocation', desc: 'Assign assets to employees and track full assignment history.', icon: ArrowRightLeft, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { title: 'Resource Booking', desc: 'Reserve shared resources like meeting rooms or company vehicles.', icon: CalendarDays, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { title: 'Maintenance', desc: 'Raise repair requests and track maintenance status in real-time.', icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50' },
              { title: 'Asset Audit', desc: 'Perform physical audits and generate discrepancy reports instantly.', icon: ClipboardCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
              { title: 'Reports & Analytics', desc: 'Beautiful dashboards providing actionable insights and KPI metrics.', icon: BarChart3, color: 'text-rose-600', bg: 'bg-rose-50' }
            ].map((f, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-lg ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">A simple, streamlined process to get your organization running smoothly.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center relative">
            <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-slate-100 -z-10"></div>
            
            {[
              { step: '1', title: 'Register Assets', desc: 'Add equipment to the central directory securely.' },
              { step: '2', title: 'Allocate Assets', desc: 'Assign them to specific employees instantly.' },
              { step: '3', title: 'Manage Maintenance', desc: 'Track repairs and bookings effortlessly.' },
              { step: '4', title: 'Generate Reports', desc: 'Analyze usage and audit effectively.' }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center mb-6 shadow-md border-4 border-white">
                  {step.step}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 px-4">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Dashboard Preview */}
      <section className="py-20 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Gain Complete Visibility</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-12">Monitor your entire infrastructure at a glance with our powerful insights dashboard.</p>
          
          <div className="bg-slate-800 p-4 sm:p-8 rounded-2xl border border-slate-700 shadow-2xl max-w-4xl mx-auto relative overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                <div className="text-2xl font-bold text-white">1,248</div>
                <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">Total Assets</div>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                <div className="text-2xl font-bold text-emerald-400">892</div>
                <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">Available</div>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                <div className="text-2xl font-bold text-blue-400">340</div>
                <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">Allocated</div>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                <div className="text-2xl font-bold text-amber-400">16</div>
                <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">Maintenance</div>
              </div>
            </div>
            
            <div className="h-48 bg-slate-700/30 rounded-xl border border-slate-600 flex items-center justify-center">
              <div className="text-slate-500 font-medium">[ Analytics Charts Render Here ]</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. User Roles */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Built for Every Role</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Role-based access ensures that your team sees exactly what they need to see.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <Shield className="w-10 h-10 text-slate-800 mb-4" />
              <h3 className="text-base font-bold text-slate-900 mb-2">Admin</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Full system access, role management, and organizational setup control.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <UserCog className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-base font-bold text-slate-900 mb-2">Asset Manager</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Registers assets, runs audits, and manages maintenance approvals.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <Users className="w-10 h-10 text-emerald-600 mb-4" />
              <h3 className="text-base font-bold text-slate-900 mb-2">Department Head</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Oversees departmental assets and handles resource bookings.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <User className="w-10 h-10 text-amber-600 mb-4" />
              <h3 className="text-base font-bold text-slate-900 mb-2">Employee</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Views assigned assets, books resources, and raises repair requests.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA (Last Section) */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-6">Ready to Simplify Asset Management?</h2>
          <p className="text-lg text-slate-600 mb-10">Join forward-thinking organizations using AssetFlow to optimize their resources.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-base font-bold hover:bg-blue-700 transition-colors shadow-sm">
              Get Started
            </Link>
            <button className="bg-white text-slate-700 border border-slate-300 px-8 py-3 rounded-lg text-base font-bold hover:bg-slate-50 transition-colors shadow-sm">
              Request Demo
            </button>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-slate-900 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-blue-500" />
            <span className="text-lg font-bold tracking-tight text-white">AssetFlow</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-400 font-medium">
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Features</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
          <div className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} AssetFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
