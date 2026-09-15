'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Wallet,
  ClipboardList,
  Building2,
  BookOpen,
  Search,
  ChevronRight,
  Menu,
  X,
  Command,
  Database,
  LayoutGrid,
  History,
  FileText,
  UserPlus,
  ArrowRight,
  Info,
  Calendar,
  Layers,
  GraduationCap,
  Settings
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const ARTICLES = [
  {
    category: 'GETTING STARTED',
    items: [
      { id: 'system-overview', title: 'System Overview', icon: Command },
      { id: 'auth-protocol', title: 'Access & Security', icon: ShieldCheck },
      { id: 'dashboard-basics', title: 'Interface Navigation', icon: LayoutGrid },
    ]
  },
  {
    category: 'EXECUTIVE COMMAND',
    items: [
      { id: 'garrison-director', title: 'Garrison Director', icon: Building2 },
      { id: 'audit-intelligence', title: 'Audit & Intelligence', icon: Database },
      { id: 'regional-web', title: 'Regional Management', icon: FileText },
    ]
  },
  {
    category: 'SCHOOL MANAGEMENT',
    items: [
      { id: 'school-admin', title: 'School Administrator', icon: Settings },
      { id: 'user-ops', title: 'Staff Onboarding', icon: UserPlus },
      { id: 'academic-setup', title: 'Academic Setup', icon: Calendar },
    ]
  },
  {
    category: 'STAFF OPERATIONS',
    items: [
      { id: 'registrar-ops', title: 'Registrar & Front Desk', icon: ClipboardList },
      { id: 'financial-treasury', title: 'Bursar & Finance', icon: Wallet },
      { id: 'academic-staff', title: 'Teacher & Grading', icon: BookOpen },
    ]
  },
  {
    category: 'UTILITIES',
    items: [
      { id: 'id-generator', title: 'ID Card System', icon: GraduationCap },
      { id: 'store-inventory', title: 'Provisions & Store', icon: Layers },
      { id: 'attendance-exeat', title: 'Exeat & Attendance', icon: History },
    ]
  }
];

const CONTENT: Record<string, any> = {
  'system-overview': {
    title: 'System Architecture',
    subtitle: 'Understanding the command hierarchy of the Ghana Garrison Schools Management System.',
    sections: [
      {
        id: 'hierarchy',
        title: 'Command Structure',
        text: 'The system is built on a hierarchical node structure designed to mirror the military command chain. Every action is localized to a node but audited globally.',
        points: [
          'Super Admin: Global infrastructure and system-wide standard definition.',
          'Garrison Director: Regional command oversight and multi-school auditing.',
          'School Admin: Local node master controller and configuration lead.',
          'Specialized Staff: Role-specific access to Finance, Registry, or Academic modules.'
        ]
      },
      {
        id: 'node-sync',
        title: 'Data Synchronization',
        text: 'Schools operate as individual nodes. Data entered at the school level (Enrollment, Fees, Grades) syncs in real-time to the Garrison and HQ dashboards for immediate intelligence.',
        points: [
          'Automatic daily backups of all institutional records.',
          'End-to-end encryption for sensitive student and financial data.',
          'Offline-first capabilities for areas with intermittent connectivity.'
        ]
      }
    ],
    toc: [{ label: 'Command Structure', id: 'hierarchy' }, { label: 'Data Sync', id: 'node-sync' }]
  },
  'auth-protocol': {
    title: 'Access & Security',
    subtitle: 'Security protocols and user authentication standards.',
    sections: [
      {
        id: 'credentials',
        title: 'Credentials',
        text: 'Users must use their unique institutional credentials to access the portal. Multi-factor authentication is enforced for executive roles.',
        points: [
          'Login requires a registered username and password.',
          'Session timeouts occur after 60 minutes of inactivity.',
          'Password complexity: Minimum 8 characters with symbols.'
        ]
      }
    ],
    toc: [{ label: 'Credentials', id: 'credentials' }]
  },
  'dashboard-basics': {
    title: 'Interface Navigation',
    subtitle: 'Mastering the command workspace layout.',
    sections: [
      {
        id: 'layout',
        title: 'Workspace Layout',
        text: 'The system uses a standardized layout across all modules to ensure operational efficiency.',
        points: [
          'Sidebar: Quick access to authorized functional modules.',
          'Top Bar: Global search and notification node.',
          'Main View: Dynamic workspace for data entry and analysis.'
        ]
      }
    ],
    toc: [{ label: 'Workspace Layout', id: 'layout' }]
  },
  'garrison-director': {
    title: 'Garrison Director Protocol',
    subtitle: 'Strategic regional leadership and battalion-wide oversight.',
    sections: [
      {
        id: 'oversight',
        title: 'Battalion Oversight',
        text: 'The Garrison Director uses the Executive Dashboard to monitor the health of all schools within their battalion.',
        points: [
          'Monitor the "Active Command" card for real-time battalion status.',
          'Use the "Institutional Revenue" tracker to identify collection gaps.',
          'Audit the "Garrison Operational Breakdown" table for unit comparisons.'
        ]
      }
    ],
    toc: [{ label: 'Battalion Oversight', id: 'oversight' }]
  },
  'audit-intelligence': {
    title: 'Audit & Intelligence',
    subtitle: 'Data-driven decision making and integrity monitoring.',
    sections: [
      {
        id: 'reports',
        title: 'Reporting Node',
        text: 'Generate high-resolution reports for battalion-level auditing.',
        points: [
          'Export financial data to PDF/Excel for official review.',
          'Track student census growth trends by unit.',
          'Monitor staff performance and duty consistency.'
        ]
      }
    ],
    toc: [{ label: 'Reporting Node', id: 'reports' }]
  },
  'regional-web': {
    title: 'Regional Web Management',
    subtitle: 'Managing the Garrison\'s public-facing digital identity.',
    sections: [
      {
        id: 'news',
        title: 'Command Announcements',
        text: 'Publish updates that are broadcasted to parents and staff.',
        points: [
          'Post news articles and upcoming event calendars.',
          'Manage the Director\'s public leadership profile.',
          'Coordinate regional alerts for all assigned schools.'
        ]
      }
    ],
    toc: [{ label: 'Announcements', id: 'news' }]
  },
  'school-admin': {
    title: 'School Administrator Protocol',
    subtitle: 'The master configuration and operational lead for individual schools.',
    sections: [
      {
        id: 'system-init',
        title: 'System Initialization',
        text: 'Administrators are responsible for setting the "Laws of the School" before any operations begin.',
        points: [
          'Define the "Academic Year" and "Term" dates in System Settings.',
          'Configure "School Settings" with official contact and branding info.',
          'Set "Grade Governance" parameters (CA vs Exam ratios).'
        ]
      }
    ],
    toc: [{ label: 'System Initialization', id: 'system-init' }]
  },
  'user-ops': {
    title: 'Staff Onboarding',
    subtitle: 'Managing user access and role assignments.',
    sections: [
      {
        id: 'onboarding',
        title: 'Onboarding Flow',
        text: 'Creating and managing individual accounts for staff members.',
        points: [
          'Assign specific roles (Teacher, Accountant, Front Desk).',
          'Manage user status (Active/Inactive).',
          'Handle credential resets and security audits.'
        ]
      }
    ],
    toc: [{ label: 'Onboarding Flow', id: 'onboarding' }]
  },
  'academic-setup': {
    title: 'Academic Setup',
    subtitle: 'Mapping classes, subjects, and instructional layers.',
    sections: [
      {
        id: 'structure',
        title: 'Institutional Mapping',
        text: 'Configuring the educational framework of the school.',
        points: [
          'Create class units and define enrollment slots.',
          'Assign subjects to specific classes.',
          'Link teachers to their respective subject clusters.'
        ]
      }
    ],
    toc: [{ label: 'Institutional Mapping', id: 'structure' }]
  },
  'registrar-ops': {
    title: 'Registrar & Front Desk Guide',
    subtitle: 'Managing the student lifecycle from intake to active directory.',
    sections: [
      {
        id: 'registration-flow',
        title: 'Admission Pipeline',
        text: 'The Front Desk is the entry point for all data in the system.',
        points: [
          'Create "New Registrations" for prospective students.',
          'Upload required documents and bio-data images.',
          'Process "Enrollment" once admission fees are cleared.'
        ]
      }
    ],
    toc: [{ label: 'Admission Flow', id: 'registration-flow' }]
  },
  'financial-treasury': {
    title: 'Financial & Treasury Operations',
    subtitle: 'Management of school fees, debt ledgers, and store inventory.',
    sections: [
      {
        id: 'receipting',
        title: 'Receipting & Collections',
        text: 'The Accountant handles all incoming revenue accurately.',
        points: [
          'Use "Create Receipt" to search for students and log payments.',
          'Select correct payment modes (Cash, Bank, MoMo).',
          'Issue "System-Generated Receipts" for every transaction.'
        ]
      }
    ],
    toc: [{ label: 'Receipting', id: 'receipting' }]
  },
  'academic-staff': {
    title: 'Teacher & Academic Operations',
    subtitle: 'Classroom management, score entry, and terminal reporting.',
    sections: [
      {
        id: 'grading',
        title: 'Continuous Assessment & Exams',
        text: 'Teachers are responsible for the entry of all academic marks.',
        points: [
          'Use "Score Entry" to log CA marks periodically.',
          'Verify Exam marks before the "Term Lock" deadline.',
          'Calculate student averages and class rankings automatically.'
        ]
      }
    ],
    toc: [{ label: 'Grading', id: 'grading' }]
  },
  'id-generator': {
    title: 'ID Card System',
    subtitle: 'Generating official student and staff identification.',
    sections: [
      {
        id: 'cards',
        title: 'ID Generation',
        text: 'Automated card production using verified database records.',
        points: [
          'Select class or individual for card generation.',
          'Automated photo and QR code placement.',
          'Batch printing capabilities for large intakes.'
        ]
      }
    ],
    toc: [{ label: 'ID Generation', id: 'cards' }]
  },
  'store-inventory': {
    title: 'Provisions & Store',
    subtitle: 'Managing institutional physical resources.',
    sections: [
      {
        id: 'inventory',
        title: 'Resource Control',
        text: 'Tracking physical items like uniforms and textbooks.',
        points: [
          'Log new stock entries with supplier details.',
          'Track student issuance and sales history.',
          'Generate inventory reconciliation reports.'
        ]
      }
    ],
    toc: [{ label: 'Resource Control', id: 'inventory' }]
  },
  'attendance-exeat': {
    title: 'Exeat & Attendance',
    subtitle: 'Student movement and presence tracking.',
    sections: [
      {
        id: 'movement',
        title: 'Command Attendance',
        text: 'Monitoring student presence and official leaves.',
        points: [
          'Daily attendance logging by class or unit.',
          'Official Exeat issuance and return tracking.',
          'Parent notification node for authorized departures.'
        ]
      }
    ],
    toc: [{ label: 'Attendance', id: 'movement' }]
  }
};

export default function GuidePage() {
  const [activeArticle, setActiveArticle] = useState('system-overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentContent = CONTENT[activeArticle] || CONTENT['system-overview'];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeArticle]);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 bg-white/90 backdrop-blur-md z-[100]">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="size-8 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
               <ShieldCheck className="text-white size-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">Garrison <span className="text-indigo-600">Manual</span></span>
          </Link>
          <div className="hidden lg:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search command protocols..."
              className="bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-1.5 text-sm w-96 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Portal Login</Link>
          <Button size="sm" asChild className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-6 h-9 shadow-lg shadow-indigo-100">
             <Link href="/register">Request Access</Link>
          </Button>
          <button className="md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X className="size-6 text-slate-900" /> : <Menu className="size-6 text-slate-900" />}
          </button>
        </div>
      </header>

      <div className="flex justify-center max-w-[1500px] mx-auto">
        <div className="flex w-full relative">

          {/* Left Sidebar - CLEANER & FIXED */}
          <aside className={cn(
            "fixed md:sticky top-16 left-0 w-72 bg-white border-r border-slate-100 h-[calc(100vh-4rem)] z-[90] transition-transform md:translate-x-0 overflow-y-auto no-scrollbar",
            isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
          )}>
            <div className="p-8 space-y-10">
              {ARTICLES.map((cat, idx) => (
                <div key={idx}>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">{cat.category}</h3>
                  <div className="space-y-1">
                    {cat.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveArticle(item.id);
                          setIsSidebarOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group text-left",
                          activeArticle === item.id
                            ? "bg-indigo-50 text-indigo-700 shadow-sm"
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        )}
                      >
                        <item.icon className={cn("size-4 shrink-0", activeArticle === item.id ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
                        {item.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 p-8 md:p-16 lg:p-24 bg-white">
            <div className="max-w-[800px]">
               <div className="mb-16">
                 <div className="size-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                    {React.createElement((ARTICLES.flatMap(c => c.items).find(i => i.id === activeArticle) as any)?.icon || Command, { size: 24 })}
                 </div>
                 <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">{currentContent.title}</h1>
                 <p className="text-xl text-slate-500 font-medium leading-relaxed italic border-l-4 border-indigo-100 pl-6 py-2">
                   {currentContent.subtitle}
                 </p>

                 <div className="mt-12 p-6 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-2xl">
                    <div className="flex items-center gap-4">
                       <div className="size-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                          <Info className="size-5" />
                       </div>
                       <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Node Status</p>
                          <p className="text-sm font-semibold">Verified Operational Protocol</p>
                       </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                       <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[10px] font-black uppercase text-emerald-400">Stable</span>
                    </div>
                 </div>
               </div>

               <div className="space-y-24">
                  {currentContent.sections.map((section: any) => (
                    <section key={section.id} id={section.id} className="scroll-mt-24 group">
                      <div className="flex items-center gap-3 mb-8">
                         <Link href={`#${section.id}`} className="text-indigo-200 hover:text-indigo-600 transition-colors">
                           <span className="text-2xl font-normal rotate-90 inline-block">∞</span>
                         </Link>
                         <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{section.title}</h2>
                      </div>
                      <p className="text-lg text-slate-600 leading-relaxed font-medium mb-10">
                         {section.text}
                      </p>
                      <div className="grid gap-4">
                         {section.points.map((point: string, pIdx: number) => (
                           <div key={pIdx} className="flex gap-5 items-start p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all group/point">
                              <div className="size-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover/point:bg-indigo-600 group-hover/point:border-indigo-600 transition-colors shrink-0 mt-0.5">
                                 <ArrowRight className="size-3.5 text-slate-400 group-hover/point:text-white" />
                              </div>
                              <p className="text-base font-semibold text-slate-700 leading-relaxed tracking-tight">{point}</p>
                           </div>
                         ))}
                      </div>
                    </section>
                  ))}
               </div>
            </div>
          </main>

          {/* Right Sidebar - TOC */}
          <aside className="hidden xl:block w-72 sticky top-16 h-[calc(100vh-4rem)] p-12 overflow-y-auto no-scrollbar">
            <div className="space-y-8">
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">In this article</h4>
                 <nav className="space-y-3 border-l-2 border-slate-50 ml-1">
                   {currentContent.toc.map((item: any) => (
                     <Link
                       key={item.id}
                       href={`#${item.id}`}
                       className="block pl-4 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-600 border-l-2 border-transparent -ml-[2px] transition-all leading-relaxed"
                     >
                       {item.label}
                     </Link>
                   ))}
                 </nav>
              </div>

              <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-4 shadow-sm shadow-indigo-100/50">
                 <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Protocol Support</p>
                 <p className="text-[11px] font-semibold text-indigo-700 leading-relaxed italic">
                   Need clarification on a command protocol?
                 </p>
                 <Button variant="link" className="p-0 h-auto text-xs font-bold text-indigo-600">
                    Open Support Ticket
                 </Button>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
