import { useEffect, useState } from 'react'
import { ArrowLeft, Download, Eye, FileText, Plus, Sparkles, Trash2 } from 'lucide-react'
import './PortfolioBuilder.css'

type Project = { name: string; description: string; technologies: string; link: string }
type Experience = { role: string; company: string; dates: string; details: string }
type Portfolio = {
  name: string; role: string; email: string; phone: string; location: string; website: string; linkedin: string; github: string
  summary: string; skills: string; education: string; certifications: string; projects: Project[]; experience: Experience[]
}
const initialPortfolio: Portfolio = {
  name: 'Alex Morgan', role: 'Full-stack Software Engineer', email: 'alex.morgan@email.com', phone: '', location: 'Bengaluru, India',
  website: '', linkedin: '', github: '', summary: 'Software engineer who enjoys building reliable products, thoughtful user experiences, and scalable systems. I turn complex problems into clear, useful solutions.',
  skills: 'Java, Spring Boot, React, TypeScript, PostgreSQL, REST APIs, Docker, Git',
  education: 'B.Tech / B.E. in Computer Science — University Name (Year)',
  certifications: 'Add relevant certifications, courses, or awards',
  projects: [
    { name: 'Project Atlas', description: 'Built a responsive application that simplifies a real-world workflow and provides clear, actionable insights.', technologies: 'React, TypeScript, Spring Boot', link: '' },
    { name: 'API Platform', description: 'Designed secure REST APIs with validation, database persistence, and automated tests.', technologies: 'Java, PostgreSQL, JUnit', link: '' },
  ],
  experience: [{ role: 'Software Engineer', company: 'Company Name', dates: '2023 — Present', details: 'Built and maintained product features, collaborated across teams, and improved application reliability.' }],
}
const storageKey = 'axemax-portfolio-draft-v1'

export default function PortfolioBuilder({ onClose, initialTheme = 'dark' }: { onClose: () => void; initialTheme?: 'dark' | 'light' }) {
  const [portfolio, setPortfolio] = useState<Portfolio>(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? { ...initialPortfolio, ...JSON.parse(saved) } : initialPortfolio
    } catch { return initialPortfolio }
  })
  const [theme, setTheme] = useState<'dark' | 'light'>(initialTheme)
  const [template, setTemplate] = useState<'modern' | 'minimal' | 'developer'>('modern')
  const [activeTab, setActiveTab] = useState<'profile' | 'experience' | 'projects' | 'education'>('profile')
  const [savedLabel, setSavedLabel] = useState('Saved in this browser')

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(portfolio)); setSavedLabel('Draft saved automatically') }
    catch { setSavedLabel('Draft stays in this session') }
  }, [portfolio])

  function update<K extends keyof Portfolio>(key: K, value: Portfolio[K]) {
    setPortfolio(current => ({ ...current, [key]: value }))
  }
  function updateProject(index: number, key: keyof Project, value: string) {
    setPortfolio(current => ({ ...current, projects: current.projects.map((project, i) => i === index ? { ...project, [key]: value } : project) }))
  }
  function updateExperience(index: number, key: keyof Experience, value: string) {
    setPortfolio(current => ({ ...current, experience: current.experience.map((item, i) => i === index ? { ...item, [key]: value } : item) }))
  }
  function exportPdf() {
    document.title = (portfolio.name.trim() || 'My') + ' — Portfolio'
    window.print()
  }
  const fields: Array<{ key: keyof Portfolio; label: string; placeholder: string; multiline?: boolean }> = [
    { key: 'name', label: 'Full name', placeholder: 'Your full name' },
    { key: 'role', label: 'Professional title', placeholder: 'e.g. Frontend Developer' },
    { key: 'email', label: 'Email address', placeholder: 'you@example.com' },
    { key: 'phone', label: 'Phone (optional)', placeholder: '+91 ...' },
    { key: 'location', label: 'Location', placeholder: 'City, Country' },
    { key: 'website', label: 'Portfolio / website URL', placeholder: 'https://...' },
    { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...' },
    { key: 'github', label: 'GitHub URL', placeholder: 'https://github.com/...' },
    { key: 'summary', label: 'Professional summary', placeholder: 'Write a short introduction about your strengths and goals...', multiline: true },
    { key: 'skills', label: 'Skills (comma-separated)', placeholder: 'Java, React, SQL, communication...', multiline: true },
  ]
  return <div className={`builder-shell theme-${theme}`}>
    <header className="builder-topbar no-print"><button className="builder-back" onClick={onClose}><ArrowLeft size={16}/> Back to AxeMax</button><div className="builder-brand"><span className="builder-brand-mark">A<span>M</span></span><span><strong>AXEMAX</strong><small>PORTFOLIO BUILDER</small></span></div><div className="builder-top-actions"><span className="save-indicator">● {savedLabel}</span><button className="builder-theme" onClick={() => setTheme(value => value === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? 'Light preview' : 'Dark preview'}</button><button className="builder-export" onClick={exportPdf}><Download size={15}/> Download PDF</button></div></header>
    <div className="builder-intro no-print"><div><div className="builder-eyebrow"><Sparkles size={13}/> YOUR NEXT CHAPTER STARTS HERE</div><h1>Build a portfolio that<br/><span>opens doors.</span></h1><p>Add your details, preview your story, and export a polished portfolio PDF. Your draft is saved in this browser.</p></div><div className="builder-step-note"><FileText size={22}/><span><strong>Made for your next opportunity</strong><small>Recruiters · Clients · Collaborators</small></span></div></div>
    <main className="builder-workspace">
      <section className="builder-editor no-print"><div className="editor-heading"><div><span className="builder-eyebrow">STEP 01 — YOUR CONTENT</span><h2>Tell your story</h2></div><span className="completion-pill">{[portfolio.name, portfolio.role, portfolio.summary, portfolio.skills].filter(v => v.trim()).length}/4 essentials</span></div>
        <div className="builder-tabs" role="tablist"><button className={activeTab==='profile'?'selected':''} onClick={()=>setActiveTab('profile')}>Profile</button><button className={activeTab==='experience'?'selected':''} onClick={()=>setActiveTab('experience')}>Experience</button><button className={activeTab==='projects'?'selected':''} onClick={()=>setActiveTab('projects')}>Projects</button><button className={activeTab==='education'?'selected':''} onClick={()=>setActiveTab('education')}>Education</button></div>
        {activeTab === 'profile' && <div className="builder-fields">{fields.map(field => <label key={field.key} className={field.multiline ? 'field-wide' : ''}>{field.label}{field.multiline ? <textarea value={String(portfolio[field.key])} placeholder={field.placeholder} rows={field.key==='summary'?4:3} onChange={e=>update(field.key,e.target.value as never)}/> : <input value={String(portfolio[field.key])} placeholder={field.placeholder} onChange={e=>update(field.key,e.target.value as never)}/>}</label>)}</div>}
        {activeTab === 'experience' && <div className="builder-repeater">{portfolio.experience.map((item,index)=><div className="repeater-card" key={index}><div className="repeater-heading"><strong>Experience {index+1}</strong><button aria-label="Remove experience" onClick={()=>update('experience',portfolio.experience.filter((_,i)=>i!==index))}><Trash2 size={14}/></button></div><label>Job title<input value={item.role} onChange={e=>updateExperience(index,'role',e.target.value)} placeholder="Software Engineer"/></label><label>Company<input value={item.company} onChange={e=>updateExperience(index,'company',e.target.value)} placeholder="Company name"/></label><label>Dates<input value={item.dates} onChange={e=>updateExperience(index,'dates',e.target.value)} placeholder="2022 — Present"/></label><label>Key contributions<textarea rows={3} value={item.details} onChange={e=>updateExperience(index,'details',e.target.value)} placeholder="What did you build, improve, or achieve?"/></label></div>)}<button className="add-entry" onClick={()=>update('experience',[...portfolio.experience,{role:'',company:'',dates:'',details:''}])}><Plus size={15}/> Add experience</button></div>}
        {activeTab === 'projects' && <div className="builder-repeater">{portfolio.projects.map((item,index)=><div className="repeater-card" key={index}><div className="repeater-heading"><strong>Project {index+1}</strong><button aria-label="Remove project" onClick={()=>update('projects',portfolio.projects.filter((_,i)=>i!==index))}><Trash2 size={14}/></button></div><label>Project name<input value={item.name} onChange={e=>updateProject(index,'name',e.target.value)} placeholder="Project name"/></label><label>Description<textarea rows={3} value={item.description} onChange={e=>updateProject(index,'description',e.target.value)} placeholder="What problem does it solve? What was your contribution?"/></label><label>Technologies<input value={item.technologies} onChange={e=>updateProject(index,'technologies',e.target.value)} placeholder="React, Java, PostgreSQL"/></label><label>Project URL (optional)<input value={item.link} onChange={e=>updateProject(index,'link',e.target.value)} placeholder="https://..."/></label></div>)}<button className="add-entry" onClick={()=>update('projects',[...portfolio.projects,{name:'',description:'',technologies:'',link:''}])}><Plus size={15}/> Add project</button></div>}
        {activeTab === 'education' && <div className="builder-fields"><label className="field-wide">Education<textarea rows={5} value={portfolio.education} onChange={e=>update('education',e.target.value)} placeholder="Degree, institution, graduation year"/></label><label className="field-wide">Certifications and achievements<textarea rows={5} value={portfolio.certifications} onChange={e=>update('certifications',e.target.value)} placeholder="Certifications, awards, courses, publications"/></label><div className="editor-tip"><Sparkles size={16}/><span><strong>Keep it focused.</strong> Lead with the most relevant qualification and achievements for the role you want.</span></div></div>}
        <div className="template-picker"><span className="builder-eyebrow">STEP 02 — CHOOSE A STYLE</span><div className="template-options"><button className={template==='modern'?'chosen':''} onClick={()=>setTemplate('modern')}><span className="template-swatch swatch-modern"><i/><i/><i/></span><strong>Modern</strong><small>Balanced & polished</small></button><button className={template==='minimal'?'chosen':''} onClick={()=>setTemplate('minimal')}><span className="template-swatch swatch-minimal"><i/><i/><i/></span><strong>Minimal</strong><small>Clean & editorial</small></button><button className={template==='developer'?'chosen':''} onClick={()=>setTemplate('developer')}><span className="template-swatch swatch-developer"><i/><i/><i/></span><strong>Developer</strong><small>Technical & bold</small></button></div></div>
        <button className="builder-export builder-export-wide" onClick={exportPdf}><Download size={16}/> Download portfolio as PDF</button><p className="export-help">Your browser's print dialog will open. Choose <strong>Save as PDF</strong> as the destination.</p>
      </section>
      <section className="builder-preview-area"><div className="preview-toolbar no-print"><span><Eye size={15}/> LIVE PREVIEW</span><span>A4 DOCUMENT · UPDATES AS YOU TYPE</span></div><article className={`portfolio-paper template-${template}`}>
        <div className="paper-header"><div className="paper-monogram">{(portfolio.name.trim().split(/\s+/).map(word=>word[0]).join('').slice(0,2)||'AM').toUpperCase()}</div><div className="paper-title"><h2>{portfolio.name || 'Your Name'}</h2><h3>{portfolio.role || 'Your Professional Title'}</h3><div className="paper-contact">{[portfolio.location,portfolio.email,portfolio.phone,portfolio.website,portfolio.linkedin,portfolio.github].filter(Boolean).map((item,i)=><span key={i}>{item}</span>)}</div></div></div>
        <section className="paper-section"><h4>PROFILE</h4><p>{portfolio.summary || 'Add a short professional introduction to tell people what you do and what makes your work valuable.'}</p></section>
        {portfolio.skills.trim() && <section className="paper-section"><h4>CORE SKILLS</h4><div className="paper-skills">{portfolio.skills.split(',').map(s=>s.trim()).filter(Boolean).map((skill,i)=><span key={i}>{skill}</span>)}</div></section>}
        {portfolio.experience.some(x=>x.role||x.company) && <section className="paper-section"><h4>EXPERIENCE</h4>{portfolio.experience.filter(x=>x.role||x.company).map((item,i)=><div className="paper-entry" key={i}><div className="paper-entry-head"><strong>{item.role || 'Role'}</strong><span>{item.dates}</span></div><div className="paper-subtitle">{item.company}</div>{item.details && <p>{item.details}</p>}</div>)}</section>}
        {portfolio.projects.some(x=>x.name||x.description) && <section className="paper-section"><h4>SELECTED PROJECTS</h4>{portfolio.projects.filter(x=>x.name||x.description).map((item,i)=><div className="paper-entry" key={i}><div className="paper-entry-head"><strong>{item.name || 'Project'}</strong>{item.link && <span>{item.link}</span>}</div>{item.description && <p>{item.description}</p>}{item.technologies && <div className="paper-tech">{item.technologies}</div>}</div>)}</section>}
        {portfolio.education.trim() && <section className="paper-section"><h4>EDUCATION</h4><p className="preserve-lines">{portfolio.education}</p></section>}
        {portfolio.certifications.trim() && <section className="paper-section"><h4>CERTIFICATIONS & ACHIEVEMENTS</h4><p className="preserve-lines">{portfolio.certifications}</p></section>}
        <footer className="paper-footer">CREATED WITH AXEMAX STUDIO <span>PORTFOLIO · {new Date().getFullYear()}</span></footer>
      </article><p className="preview-footnote no-print">Preview reflects your current draft. Longer portfolios may span multiple PDF pages.</p></section>
    </main>
  </div>
}
