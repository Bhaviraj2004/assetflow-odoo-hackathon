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
      <section className="pt-20 pb-24 overflow-hidden relative">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-100/50 blur-3xl"></div>
          <div className="absolute top-40 -left-40 w-96 h-96 rounded-full bg-indigo-100/50 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                AssetFlow 2.0 is here
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                Manage Your Assets with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Ease</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed">
                Track, allocate, and maintain your organization's resources from one intuitive platform. Simplify your workflow and never lose track of an asset again.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {user ? (
                  <Link to="/dashboard" className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/20 hover:-translate-y-0.5">
                    Go to Dashboard <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <>
                    <Link to="/signup" className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/20 hover:-translate-y-0.5">
                      Get Started
                    </Link>
                    <button 
                      onClick={() => alert("Thank you for your interest! Our team will contact you shortly to schedule a demo.")}
                      className="flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl text-base font-semibold hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      Request Demo
                    </button>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                <div className="flex -space-x-2">
                  <img className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" src="https://i.pravatar.cc/100?img=1" alt="User" />
                  <img className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" src="https://i.pravatar.cc/100?img=2" alt="User" />
                  <img className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" src="https://i.pravatar.cc/100?img=3" alt="User" />
                </div>
                <p>Trusted by 10,000+ teams worldwide</p>
              </div>
            </div>
            
            {/* Right Content - Dashboard Mockup */}
            <div className="relative rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-xl shadow-2xl overflow-hidden aspect-[4/3] flex flex-col hidden sm:flex transform transition-transform hover:-translate-y-2 duration-500">
              {/* Window Controls */}
              <div className="h-12 bg-slate-50/80 border-b border-slate-200/60 flex items-center px-4 justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
                <div className="w-32 h-4 bg-slate-200 rounded-md"></div>
              </div>
              
              {/* Mockup Body */}
              <div className="p-6 flex-1 flex gap-4 bg-slate-50/30">
                {/* Sidebar Mockup */}
                <div className="w-16 md:w-32 flex flex-col gap-3">
                  <div className="w-full h-8 bg-blue-100 rounded-lg mb-4"></div>
                  <div className="w-full h-4 bg-slate-200 rounded"></div>
                  <div className="w-3/4 h-4 bg-slate-200 rounded"></div>
                  <div className="w-full h-4 bg-slate-200 rounded"></div>
                </div>
                
                {/* Main Content Mockup */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex gap-4">
                    <div className="flex-1 h-24 bg-white border border-slate-200/60 shadow-sm rounded-xl p-4 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg"></div>
                        <div className="w-12 h-4 bg-emerald-100 rounded-full"></div>
                      </div>
                      <div className="w-16 h-4 bg-slate-200 rounded"></div>
                    </div>
                    <div className="flex-1 h-24 bg-white border border-slate-200/60 shadow-sm rounded-xl p-4 flex flex-col justify-between">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg"></div>
                      <div className="w-20 h-4 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                  
                  {/* Table Mockup */}
                  <div className="flex-1 bg-white border border-slate-200/60 shadow-sm rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="w-1/3 h-5 bg-slate-200 rounded"></div>
                      <div className="w-1/4 h-6 bg-slate-100 rounded-lg"></div>
                    </div>
                    <div className="w-full h-10 bg-slate-50 rounded-lg border border-slate-100"></div>
                    <div className="w-full h-10 bg-slate-50 rounded-lg border border-slate-100"></div>
                    <div className="w-full h-10 bg-slate-50 rounded-lg border border-slate-100"></div>
                  </div>
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
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-slate-700 font-bold shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
              <Building2 className="w-6 h-6 text-blue-500" /> Offices
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-slate-700 font-bold shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
              <GraduationCap className="w-6 h-6 text-emerald-500" /> Schools
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-slate-700 font-bold shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
              <Hospital className="w-6 h-6 text-red-500" /> Hospitals
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-slate-700 font-bold shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
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
            <button 
              onClick={() => alert("Thank you for your interest! Our team will contact you shortly to schedule a demo.")}
              className="bg-white text-slate-700 border border-slate-300 px-8 py-3 rounded-lg text-base font-bold hover:bg-slate-50 transition-colors shadow-sm"
            >
              Request Demo
            </button>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-slate-900 pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* Brand & Blurb */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Box className="w-6 h-6 text-blue-500" />
                <span className="text-xl font-bold tracking-tight text-white">AssetFlow</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                The modern, intuitive asset management platform designed to simplify workflows and bring complete visibility to your organization's resources.
              </p>
              <div className="flex gap-4">
                {/* Social placeholders */}
                <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Use Cases</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} AssetFlow. Built with ❤️ for Odoo Hackathon.
            </div>
            <div className="flex gap-4 text-sm text-slate-500">
              <span>English (US)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
