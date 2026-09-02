import { headers } from 'next/headers';
import { Search, ArrowRight, CheckCircle2, Clock, ShieldCheck, User, MapPin, GraduationCap } from 'lucide-react';

async function getSchoolData(host: string | null) {
  const domain = host?.split(':')[0] || 'default';
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/schools/public/${domain}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) { return null; }
}

export default async function AdmissionsPage() {
  const headersList = await headers();
  const host = headersList.get('host');
  const school = await getSchoolData(host);

  if (!school) return <div>School not found</div>;

  const primaryColor = school.primary_color || '#0f172a';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Editorial Header */}
      <header className="py-12 bg-white border-b">
        <div className="container mx-auto px-4 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 mb-4 block">Institutional Enrollment</span>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-slate-900 mb-6">
            Admissions & <span className="italic text-primary" style={{ color: primaryColor }}>Tracking</span>
          </h1>
          <p className="max-w-xl mx-auto text-slate-500 leading-relaxed">
            Welcome to the {school.name} enrollment portal. Join a tradition of excellence and character.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 flex-grow">
        <div className="grid lg:grid-cols-12 gap-12">

          {/* Tracking Section */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" style={{ backgroundColor: `${primaryColor}10` }}></div>

              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <ShieldCheck className="text-primary" style={{ color: primaryColor }} />
                Track Application
              </h2>

              <p className="text-sm text-slate-500 mb-6">Enter your Registration ID to check your status.</p>

              <div className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="e.g. REG-123456"
                    className="h-14 pl-12 rounded-2xl border-slate-200 focus:ring-primary/20"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                </div>
                <button
                  className="w-full h-14 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all hover:gap-4"
                  style={{ backgroundColor: primaryColor }}
                >
                  Check Status <ArrowRight size={18} />
                </button>
              </div>

              {/* Status Visualizer (Empty State Example) */}
              <div className="mt-12 space-y-6 opacity-40 grayscale pointer-events-none">
                <div className="flex gap-4">
                  <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold italic">1</div>
                  <div className="flex-1 border-b pb-4">
                    <p className="font-bold text-sm">Submission Received</p>
                    <p className="text-xs text-slate-400">Waiting for review</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold italic">2</div>
                  <div className="flex-1 border-b pb-4">
                    <p className="font-bold text-sm">Entrance Assessment</p>
                    <p className="text-xs text-slate-400">Not scheduled</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Garrison Badge */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl flex items-center gap-6">
                <div className="size-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                    <GraduationCap className="size-8" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Part of</p>
                    <p className="text-lg font-serif">Ghana Armed Forces Education Unit</p>
                </div>
            </div>
          </div>

          {/* Start Application Section */}
          <div className="lg:col-span-7">
            <div className="grid md:grid-cols-2 gap-6">

                <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-primary/50 transition-colors cursor-pointer group">
                    <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                        <User size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-slate-900">New Student</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-6">For first-time enrollments into Basic or Junior High levels.</p>
                    <div className="flex items-center text-primary font-bold text-sm gap-1" style={{ color: primaryColor }}>
                        Start Application <ArrowRight size={14} />
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-primary/50 transition-colors cursor-pointer group">
                    <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                        <Clock size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-slate-900">Transfer Student</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-6">Moving from another garrison or civilian institution mid-cycle.</p>
                    <div className="flex items-center text-primary font-bold text-sm gap-1" style={{ color: primaryColor }}>
                        Initiate Transfer <ArrowRight size={14} />
                    </div>
                </div>

                <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-200">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <MapPin size={18} className="text-primary" style={{ color: primaryColor }} />
                        Required Documents
                    </h3>
                    <ul className="grid sm:grid-cols-2 gap-4">
                        {[
                            'Original Birth Certificate',
                            'Previous Academic Reports',
                            'Garrison Affiliation ID (If applicable)',
                            'Recent Passport Photographs',
                            'Immunization Records',
                            'BECE Results (For SHS Entry)'
                        ].map((item) => (
                            <li key={item} className="flex items-center gap-3 text-sm text-slate-600">
                                <div className="size-1.5 rounded-full bg-emerald-500"></div>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Help Center */}
            <div className="mt-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <CheckCircle2 size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-emerald-900">Need Assistance?</p>
                        <p className="text-xs text-emerald-700">Contact the Registrar at {school.contact_phone}</p>
                    </div>
                </div>
                <button className="text-xs font-bold uppercase tracking-wider text-emerald-600 hover:underline">FAQ</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Minimal Input shim since we are setting up packages/ui
function Input({ className, ...props }: any) {
    return (
        <input
            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
        />
    )
}
