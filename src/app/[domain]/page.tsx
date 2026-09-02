import { headers } from 'next/headers';
import { Mail, Phone, MapPin, Building2, GraduationCap, ArrowRight, ShieldCheck, UserCircle, FileText, Facebook, Twitter, Instagram } from 'lucide-react';

async function getSiteData(host: string | null) {
  const domain = host?.split(':')[0] || 'default';

  // Try School first
  try {
    const schoolRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/schools/public/${domain}`, {
      next: { revalidate: 3600 }
    });
    if (schoolRes.ok) return { type: 'school', data: await schoolRes.json() };
  } catch (e) {}

  // Try Garrison
  try {
    const garrisonRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/public/garrison/${domain}`, {
      next: { revalidate: 3600 }
    });
    if (garrisonRes.ok) return { type: 'garrison', data: await garrisonRes.json() };
  } catch (e) {}

  return null;
}

export default async function DynamicHomePage() {
  const headersList = await headers();
  const host = headersList.get('host');
  const result = await getSiteData(host);

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-4 text-center px-4">
        <h1 className="text-6xl font-serif font-black italic text-slate-200">Nwoma</h1>
        <p className="text-slate-500 max-w-xs">This node in the educational network is not yet activated.</p>
      </div>
    );
  }

  if (result.type === 'school') {
    return <SchoolTemplate school={result.data} />;
  }

  return <GarrisonTemplate
    garrison={result.data.garrison}
    schools={result.data.schools}
    news={result.data.news || []}
    documents={result.data.documents || []}
  />;
}

/* --- GARRISON COMMAND VIEW TEMPLATE --- */
function GarrisonTemplate({ garrison, schools, news, documents }: any) {
  const primaryColor = garrison.primary_color || '#1e293b';

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      {/* Editorial Header */}
      <header className="border-b sticky top-0 bg-white/80 backdrop-blur-md z-50 transition-all" style={{ borderBottomColor: `${primaryColor}20` }}>
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {garrison.website_logo_url ? (
              <img src={garrison.website_logo_url} alt={garrison.name} className="h-12 w-auto" />
            ) : (
              <div className="size-10 rounded bg-slate-900 flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                <ShieldCheck size={20} />
              </div>
            )}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400">Institutional Command</p>
              <h1 className="font-serif text-lg font-black tracking-tight">{garrison.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-slate-500">
                <a href="#units" className="hover:text-primary transition-colors">Educational Units</a>
                <a href="#news" className="hover:text-primary transition-colors">Command Briefs</a>
                <a href="#leadership" className="hover:text-primary transition-colors">Leadership</a>
                <a href="#downloads" className="hover:text-primary transition-colors">Resources</a>
                <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
            </nav>
            <a href="/admissions" className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold uppercase tracking-widest transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ backgroundColor: primaryColor }}>
              Enrollment <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </header>

      {/* Command Hero: Minimalist & Dramatic */}
      <section className="relative py-32 md:py-48 bg-white overflow-hidden border-b">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full bg-slate-50 border border-slate-100">
                <span className="size-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }}></span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Active Operational Command</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-serif font-black mb-8 leading-[0.9] tracking-tighter text-slate-900">
              {garrison.hero_title || `Educational Excellence through Discipline.`}
            </h2>
            <p className="text-xl md:text-2xl text-slate-500 mb-12 leading-relaxed font-light max-w-2xl">
              {garrison.hero_subtitle || `Supervising the ${garrison.name} educational network with a focus on character, tradition, and academic rigor.`}
            </p>
            <div className="flex flex-wrap gap-4">
                <div className="px-6 py-4 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
                    <div className="size-10 rounded-lg flex items-center justify-center bg-slate-50" style={{ color: primaryColor }}>
                        <Building2 size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">{schools.length}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Educational Units</p>
                    </div>
                </div>
                <div className="px-6 py-4 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
                    <div className="size-10 rounded-lg flex items-center justify-center bg-slate-50" style={{ color: primaryColor }}>
                        <GraduationCap size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">Institutional</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Excellence Level</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
        {/* Large faint background text */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 opacity-[0.02] pointer-events-none select-none">
            <span className="text-[40rem] font-serif font-black italic">{garrison.code || 'GAF'}</span>
        </div>
      </section>

      {/* Leadership Profile */}
      {garrison.leader_name && (
        <section id="leadership" className="py-32 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-slate-50 rounded-3xl -rotate-2 group-hover:rotate-0 transition-transform duration-700"></div>
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-slate-200">
                  {garrison.leader_image_url ? (
                    <img src={garrison.leader_image_url} alt={garrison.leader_name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100"><UserCircle size={120} /></div>
                  )}
                </div>
                <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-xs hidden md:block">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1" style={{ color: primaryColor }}>Command Vision</p>
                  <p className="text-sm font-serif italic text-slate-600 leading-relaxed">
                    "Setting the standard for excellence across our regional units."
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-4 block">Garrison Leadership</span>
                  <h3 className="text-5xl font-serif font-black text-slate-900 mb-2">{garrison.leader_name}</h3>
                  <p className="text-xl font-bold uppercase tracking-widest text-primary" style={{ color: primaryColor }}>{garrison.leader_title}</p>
                </div>
                <div className="h-px w-24 bg-slate-200"></div>
                <div className="prose prose-lg text-slate-500 font-light leading-loose whitespace-pre-line italic">
                  "{garrison.leader_message}"
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* School Directory: High-End Editorial Grid */}
      <section id="units" className="py-32 bg-slate-50/50">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mb-20">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-4 block" style={{ color: primaryColor }}>The Network</span>
            <h3 className="text-5xl font-serif font-black text-slate-900 leading-tight">Constituent Academic Institutions</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {schools.map((school: any) => (
              <a
                key={school.id}
                href={school.custom_domain ? `http://${school.custom_domain}` : '#'}
                className="group relative"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-200 mb-6 border border-slate-200 shadow-sm transition-all duration-700 group-hover:shadow-2xl group-hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                    {school.website_logo_url ? (
                        <div className="absolute inset-0 flex items-center justify-center p-12">
                             <img src={school.website_logo_url} alt="" className="max-w-full max-h-full object-contain filter brightness-0 invert opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Building2 className="size-20 text-white/20" />
                        </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                        <div className="flex items-center gap-2 mb-2">
                             <span className="size-1.5 rounded-full bg-emerald-400"></span>
                             <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Official Unit</span>
                        </div>
                        <h4 className="text-2xl font-serif font-bold mb-2 leading-tight">{school.name}</h4>
                        <p className="text-xs text-slate-300 line-clamp-2 font-light">{school.hero_subtitle || 'Educational Excellence and Discipline.'}</p>
                    </div>

                    <div className="absolute top-6 right-6 size-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                        <ArrowRight size={20} />
                    </div>
                </div>
                <div className="flex items-start justify-between px-2">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Location</p>
                        <p className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                            <MapPin size={12} className="text-slate-400" />
                            {school.address}
                        </p>
                    </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Garrison News / Briefs Section */}
      <section id="news" className="py-32 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="max-w-xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-4 block" style={{ color: primaryColor }}>Intelligence & News</span>
              <h3 className="text-5xl font-serif font-black text-slate-900">Command Briefs</h3>
            </div>
            <button className="text-xs font-bold uppercase tracking-widest border-b-2 pb-2 hover:opacity-70 transition-opacity" style={{ borderBottomColor: primaryColor }}>View All Updates</button>
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            {news.length > 0 ? (
                news.map((item: any) => (
                    <article key={item.id} className="group cursor-pointer">
                        <div className="aspect-[16/10] overflow-hidden rounded-xl bg-slate-100 mb-8 border border-slate-100 shadow-sm group-hover:shadow-lg transition-all">
                            {item.image_url ? (
                                <img src={item.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                    <ShieldCheck className="size-12 text-slate-200" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            <time className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                {new Date(item.published_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </time>
                            <h5 className="text-xl font-serif font-bold group-hover:text-primary transition-colors leading-snug">{item.title}</h5>
                            <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed font-light">{item.content}</p>
                            <div className="pt-2">
                                <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900">
                                    Read Full Brief <ArrowRight size={12} />
                                </span>
                            </div>
                        </div>
                    </article>
                ))
            ) : (
                <div className="col-span-3 py-20 text-center border-2 border-dashed rounded-3xl">
                    <p className="text-slate-400 italic">No command briefs available at this time.</p>
                </div>
            )}
          </div>
        </div>
      </section>

      {/* Resource Library / Download Center */}
      {documents.length > 0 && (
        <section id="downloads" className="py-32 bg-slate-900 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-4 block">Official Documentation</span>
              <h3 className="text-5xl font-serif font-black mb-12">Resource Library</h3>
              <div className="grid gap-4">
                {documents.map((doc: any) => (
                  <a
                    key={doc.id}
                    href={doc.file_url}
                    target="_blank"
                    className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText className="text-white/60" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{doc.title}</p>
                        <p className="text-xs text-white/40 uppercase tracking-widest">{doc.file_type || 'Document'}</p>
                      </div>
                    </div>
                    <div className="size-10 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight size={18} />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Command Footer */}
      <footer id="contact" className="bg-slate-950 text-white py-32 mt-auto relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="text-3xl font-serif font-black mb-4 tracking-tighter">{garrison.name}</h3>
                <p className="text-slate-400 max-w-sm leading-relaxed font-light">{garrison.location}</p>
              </div>
              <div className="flex gap-4">
                <a href="#" className="size-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-slate-950 transition-all">
                  <Facebook size={18} />
                </a>
                <a href="#" className="size-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-slate-950 transition-all">
                  <Twitter size={18} />
                </a>
                <a href="#" className="size-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-slate-950 transition-all">
                  <Instagram size={18} />
                </a>
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Command HQ</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li className="flex items-center gap-3 text-slate-300">
                  <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40"><Mail size={14} /></div>
                  {garrison.contact_email}
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40"><Phone size={14} /></div>
                  {garrison.contact_phone}
                </li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Quick Access</h4>
              <ul className="space-y-3 text-sm font-bold uppercase tracking-widest text-slate-500">
                <li><a href="/admissions" className="hover:text-white transition-colors">Enrollment Portal</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Unit Directory</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Governance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 mt-24 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
              \u0026copy; {new Date().getFullYear()} Ghana Armed Forces Education Unit. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Powered by</span>
                <span className="text-sm font-serif font-black italic text-white/40">Nwoma</span>
            </div>
          </div>
        </div>
        {/* Background Decorative element */}
        <div className="absolute -bottom-24 -right-24 size-96 rounded-full bg-white/5 blur-3xl"></div>
      </footer>
    </div>
  );
}

/* --- SCHOOL WEBSITE TEMPLATE (Original Layout) --- */
function SchoolTemplate({ school }: any) {
  const primaryColor = school.primary_color || '#0f172a';
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="border-b sticky top-0 bg-white z-50 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {school.website_logo_url ? (
              <img src={school.website_logo_url} alt={school.name} className="h-12 w-auto" />
            ) : (
              <div className="size-10 rounded bg-primary flex items-center justify-center text-white font-bold" style={{ backgroundColor: primaryColor }}>{school.name[0]}</div>
            )}
            <span className="font-serif font-bold text-xl">{school.name}</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-medium">
            <a href="#about" className="hover:text-primary transition-colors">About</a>
            <a href="#leadership" className="hover:text-primary transition-colors">Leadership</a>
            <a href="#downloads" className="hover:text-primary transition-colors">Downloads</a>
            <a href="/admissions" className="px-5 py-2 rounded-full text-white" style={{ backgroundColor: primaryColor }}>Admissions</a>
          </nav>
        </div>
      </header>

      <section className="py-32 bg-slate-50">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-6xl md:text-8xl font-serif font-black mb-8 leading-tight italic" style={{ color: primaryColor }}>
            {school.hero_title || school.name}
          </h2>
          <p className="text-xl text-slate-500 leading-relaxed mb-12">
            {school.hero_subtitle || 'A tradition of excellence in education and character.'}
          </p>
          <div className="flex justify-center gap-4">
            <a href="/admissions" className="px-8 py-4 rounded-xl text-white font-bold shadow-lg" style={{ backgroundColor: primaryColor }}>Apply Now</a>
            <a href="#about" className="px-8 py-4 rounded-xl bg-white border font-bold">Our Story</a>
          </div>
        </div>
      </section>

      {/* Meet the Head of School */}
      {school.leader_name && (
        <section id="leadership" className="py-24 bg-white border-y">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-12 gap-16 items-center">
                    <div className="md:col-span-4">
                        <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-xl bg-slate-100">
                            {school.leader_image_url ? (
                                <img src={school.leader_image_url} alt={school.leader_name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-200"><UserCircle size={80} /></div>
                            )}
                        </div>
                    </div>
                    <div className="md:col-span-8 space-y-6">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Head of Institution</span>
                        <h3 className="text-4xl font-serif font-black text-slate-900">{school.leader_name}</h3>
                        <p className="text-lg font-bold text-primary" style={{ color: primaryColor }}>{school.leader_title}</p>
                        <div className="relative">
                            <span className="absolute -top-4 -left-6 text-6xl text-slate-100 font-serif">"</span>
                            <p className="text-lg text-slate-500 font-serif italic leading-relaxed relative z-10">
                                {school.leader_message}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
      )}

      {/* Download Center */}
      {school.documents && school.documents.length > 0 && (
        <section id="downloads" className="py-24 bg-slate-50 border-y">
            <div className="container mx-auto px-4">
                <div className="max-w-xl mx-auto text-center mb-16">
                    <h3 className="text-3xl font-serif font-black mb-4">Official Downloads</h3>
                    <p className="text-slate-500 italic">Access and download important school documents, prospectuses, and policies.</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {school.documents.map((doc: any) => (
                        <a key={doc.id} href={doc.file_url} target="_blank" className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                            <div className="size-12 rounded-xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors" style={{ '--primary': primaryColor } as any}>
                                <FileText size={24} />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="font-bold text-sm truncate">{doc.title}</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Download PDF</p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
      )}

      <section id="about" className="py-24 container mx-auto px-4">
        <div className="max-w-3xl mx-auto prose prose-xl text-slate-600 font-serif leading-loose">
           {school.about_text}
        </div>
      </section>
    </div>
  );
}
