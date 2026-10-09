import { useEffect, useMemo, useState } from 'react'
import PortfolioBuilder from './PortfolioBuilder'
import { ArrowDownRight, ArrowRight, Github, Linkedin, Mail, Menu, X, ExternalLink, Code2, Layers3, Smartphone, Terminal, Sparkles, Sun, Moon, Pencil, Trash2, XCircle, FileText, Download } from 'lucide-react'

type Project = {
  id?: number; title: string; slug: string; summary: string; description?: string
  technologies: string; githubUrl?: string; demoUrl?: string; imageUrl?: string; featured?: boolean; status?: string
}
const samples: Project[] = [
  { title: 'AxeMax API Monitor', slug: 'axemax-api-monitor', summary: 'A real-time view into API health, latency, and service reliability.', technologies: 'Java, Spring Boot, React, PostgreSQL', githubUrl: 'https://github.com/', featured: true },
  { title: 'Personal Finance Hub', slug: 'personal-finance-hub', summary: 'A calm, data-first dashboard for spending, savings, and investment goals.', technologies: 'TypeScript, React, Spring Boot', githubUrl: 'https://github.com/' },
  { title: 'Commerce Engine', slug: 'commerce-engine', summary: 'A modular commerce foundation for catalog, cart, orders, and inventory.', technologies: 'Java, REST API, PostgreSQL, Docker', githubUrl: 'https://github.com/' },
]
const skills = [
  { title: 'Backend engineering', items: 'Java · Spring Boot · REST APIs · JUnit', icon: Code2 },
  { title: 'Frontend development', items: 'React · TypeScript · Responsive UI', icon: Layers3 },
  { title: 'Mobile experiences', items: 'React Native · Expo · API integration', icon: Smartphone },
  { title: 'Engineering workflow', items: 'Git · Docker · CI/CD · Playwright', icon: Terminal },
]
const techs = ['Java', 'Spring Boot', 'React', 'TypeScript', 'PostgreSQL', 'Docker', 'Playwright', 'GitHub Actions']

export default function App() {
  const [projects, setProjects] = useState<Project[]>(samples)
  const [filter, setFilter] = useState('All')
  const [menuOpen, setMenuOpen] = useState(false)
  const [apiStatus, setApiStatus] = useState<'loading' | 'connected' | 'demo'>('loading')
  const [adminOpen, setAdminOpen] = useState(false)
  const [builderOpen, setBuilderOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('axemax-theme') as 'dark' | 'light') || 'dark')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('admin@axemax.local')
  const [password, setPassword] = useState('')
  const [notice, setNotice] = useState('')
  const [projectTitle, setProjectTitle] = useState('')
  const [projectSlug, setProjectSlug] = useState('')
  const [projectSummary, setProjectSummary] = useState('')
  const [projectTech, setProjectTech] = useState('Java, Spring Boot, React')
  const [projectDescription, setProjectDescription] = useState('')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('axemax-theme', theme)
  }, [theme])

  useEffect(() => {
    fetch('/api/v1/projects?page=0&size=20')
      .then(r => { if (!r.ok) throw new Error('API not ready'); return r.json() })
      .then(data => { setProjects(data.content ?? []); setApiStatus('connected') })
      .catch(() => setApiStatus('demo'))
  }, [])

  const categories = useMemo(() => ['All', ...Array.from(new Set(projects.flatMap(p => p.technologies.split(',').map(t => t.trim()).filter(Boolean))))], [projects])
  const visible = filter === 'All' ? projects : projects.filter(p => p.technologies.toLowerCase().includes(filter.toLowerCase()))

  async function login(e: React.FormEvent) {
    e.preventDefault(); setNotice('')
    try {
      const r = await fetch('/api/v1/auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({email, password}) })
      if (!r.ok) throw new Error('Login failed. Check the API and credentials.')
      const data = await r.json(); setToken(data.accessToken); setNotice('Admin session started.')
    } catch (err) { setNotice(err instanceof Error ? err.message : 'Could not log in.') }
  }
  function startEditing(project: Project) {
    if (project.id == null) { setNotice('This sample project is read-only. Connect the API to edit saved projects.'); return }
    setEditingId(project.id); setProjectTitle(project.title); setProjectSlug(project.slug); setProjectSummary(project.summary)
    setProjectDescription(project.description ?? project.summary); setProjectTech(project.technologies); setNotice('Editing project — save your changes when ready.')
    document.querySelector('.admin-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  function resetProjectForm() {
    setEditingId(null); setProjectTitle(''); setProjectSlug(''); setProjectSummary(''); setProjectDescription(''); setProjectTech('Java, Spring Boot, React')
  }
  async function deleteProject(project: Project) {
    if (project.id == null) { setNotice('Sample projects cannot be deleted.'); return }
    if (!window.confirm(`Delete “${project.title}”? This cannot be undone.`)) return
    try {
      const r = await fetch(`/api/v1/admin/projects/${project.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (!r.ok) throw new Error('Could not delete project. Check API logs.')
      setProjects(old => old.filter(p => p.id !== project.id)); setNotice('Project deleted.')
      if (editingId === project.id) resetProjectForm()
    } catch (err) { setNotice(err instanceof Error ? err.message : 'Could not delete project.') }
  }
  async function createProject(e: React.FormEvent) {
    e.preventDefault(); setNotice('')
    const slug = projectSlug || projectTitle.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    try {
      const r = await fetch(editingId == null ? '/api/v1/admin/projects' : `/api/v1/admin/projects/${editingId}`, { method: editingId == null ? 'POST' : 'PUT', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body: JSON.stringify({
        title: projectTitle, slug, summary: projectSummary, description: projectDescription || projectSummary,
        technologies: projectTech, status:'PUBLISHED', featured:false
      }) })
      if (!r.ok) throw new Error('Could not create project. Check required fields and API logs.')
      const saved = r.status === 204 ? null : await r.json();
      if (editingId == null) { if (saved) setProjects(old => [saved, ...old]); setNotice('Project published.') }
      else { setProjects(old => old.map(p => p.id === editingId ? (saved ?? { ...p, title: projectTitle, slug, summary: projectSummary, description: projectDescription || projectSummary, technologies: projectTech }) : p)); setNotice('Project updated.') }
      resetProjectForm()
    } catch (err) { setNotice(err instanceof Error ? err.message : 'Could not save project.') }
  }

  if (builderOpen) return <PortfolioBuilder onClose={() => setBuilderOpen(false)} initialTheme={theme} />

  return <div className="site-shell" data-theme={theme}>
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <header className="topbar">
      <a className="brand" href="#home" aria-label="AxeMax Studio home"><span className="brand-mark">A<span>M</span></span><span className="brand-name">AXEMAX<span>STUDIO</span></span></a>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X/> : <Menu/>}</button>
      <nav className={menuOpen ? 'nav-links nav-open' : 'nav-links'}>
        <a onClick={() => setMenuOpen(false)} href="#work">Work</a><a onClick={() => setMenuOpen(false)} href="#about">About</a><a onClick={() => setMenuOpen(false)} href="#stack">Stack</a><a onClick={() => setMenuOpen(false)} href="#contact">Contact</a>
        <button className="nav-builder" onClick={() => { setBuilderOpen(true); setMenuOpen(false) }}>Build portfolio <ArrowRight size={14}/></button>
        <button className="theme-toggle" onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>{theme === 'dark' ? <Sun size={15}/> : <Moon size={15}/>}<span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span></button>
        <button className="nav-cta" onClick={() => {setAdminOpen(!adminOpen); setMenuOpen(false)}}>Studio admin <ArrowRight size={15}/></button>
      </nav>
    </header>

    <main>
      <section className="hero section-wrap" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot"/>{apiStatus === 'connected' ? 'CONNECTED TO AXEMAX API' : 'INDEPENDENT IDEAS. THOUGHTFUL ENGINEERING.'}</div>
          <h1>Build beyond<br/><span>the expected.</span></h1>
          <p className="hero-text">Create a professional portfolio that tells your story. Bring your skills, experience, and projects together, choose a style, and export a polished PDF—all in one simple workspace.</p>
          <div className="hero-actions"><button className="button button-primary" onClick={() => setBuilderOpen(true)}>Build your portfolio <ArrowRight size={16}/></button><a className="button button-quiet" href="#work">Explore the platform <ArrowDownRight size={17}/></a></div>
          <div className="hero-meta"><span><i/> Full-stack development</span><span><i/> Web & mobile</span><span><i/> API-first thinking</span></div>
        </div>
        <div className="hero-visual" aria-label="Abstract AxeMax brand graphic">
          <div className="orbit orbit-a"/><div className="orbit orbit-b"/><div className="orbit orbit-c"/>
          <div className="hero-emblem"><span className="emblem-a">A</span><span className="emblem-x">X</span><span className="emblem-m">M</span></div>
          <div className="float-card float-card-top"><span className="card-icon"><Code2 size={15}/></span><span><b>Clean architecture</b><small>Built to evolve</small></span><span className="tiny-check">✓</span></div>
          <div className="float-card float-card-bottom"><span className="pulse-bars"><i/><i/><i/><i/><i/></span><span><b>Systems in motion</b><small>From concept to product</small></span></div>
          <div className="visual-caption">AXEMAX / DIGITAL STUDIO <span>001 — 025</span></div>
        </div>
        <div className="hero-index"><span>01</span><span className="index-line"/><span>SCROLL TO EXPLORE</span></div>
      </section>

      <section className="platform-section section-wrap" id="platform">
        <div className="section-heading"><div><div className="eyebrow">YOUR STORY, BEAUTIFULLY PRESENTED</div><h2>From experience to <span>opportunity.</span></h2></div><p>One place to shape your story,<br/>showcase your work, and move forward.</p></div>
        <div className="platform-grid">
          <article className="platform-card"><span className="platform-number">01</span><span className="platform-icon"><FileText size={20}/></span><h3>Build your story</h3><p>Bring your professional profile, experience, skills, education, certifications and projects together in one clear portfolio.</p><span className="platform-tag">GUIDED EDITOR</span></article>
          <article className="platform-card"><span className="platform-number">02</span><span className="platform-icon"><Layers3 size={20}/></span><h3>Make it yours</h3><p>Choose a visual style, switch between light and dark preview, and refine your content while seeing the result live.</p><span className="platform-tag">LIVE PREVIEW</span></article>
          <article className="platform-card"><span className="platform-number">03</span><span className="platform-icon"><Download size={20}/></span><h3>Take it anywhere</h3><p>Export a print-ready PDF you can attach to job applications, share with clients, or keep as your career snapshot.</p><span className="platform-tag">PDF EXPORT</span></article>
        </div>
        <div className="platform-banner"><div><div className="eyebrow">START WITH WHAT YOU HAVE</div><h3>Your next opportunity deserves a better introduction.</h3><p>No design skills required. Start with a sample, personalize it, and make it yours.</p></div><button className="button button-primary" onClick={() => setBuilderOpen(true)}>Create my portfolio <ArrowRight size={15}/></button></div>
      </section>

      {adminOpen && <section className="admin-panel section-wrap">
        <div className="section-heading"><div><div className="eyebrow">PRIVATE WORKSPACE</div><h2>Studio admin</h2></div><button className="icon-button" onClick={() => {setAdminOpen(false);setNotice('')}}><X/></button></div>
        {!token ? <form className="admin-form" onSubmit={login}><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label><button className="button button-primary">Sign in <ArrowRight size={15}/></button></form> :
        <form className="admin-form admin-grid" onSubmit={createProject}><label>Project title<input value={projectTitle} onChange={e=>setProjectTitle(e.target.value)} required/></label><label>Slug (optional)<input value={projectSlug} onChange={e=>setProjectSlug(e.target.value)} placeholder="auto-generated"/></label><label className="wide">Summary<input value={projectSummary} onChange={e=>setProjectSummary(e.target.value)} required/></label><label className="wide">Description<textarea value={projectDescription} onChange={e=>setProjectDescription(e.target.value)} /></label><label className="wide">Technologies (comma-separated)<input value={projectTech} onChange={e=>setProjectTech(e.target.value)} required/></label><button className="button button-primary">{editingId == null ? 'Publish project' : 'Save changes'} <ArrowRight size={15}/></button>{editingId != null && <button type="button" className="button button-quiet" onClick={resetProjectForm}>Cancel edit <XCircle size={15}/></button>}<button type="button" className="button button-quiet" onClick={()=>{setToken('');setPassword('');setEditingId(null);setNotice('Signed out.')}}>Sign out</button></form>}
        {token && <div className="admin-projects"><div className="admin-list-heading"><div><div className="eyebrow">CONTENT MANAGEMENT</div><h3>Manage projects <span>{projects.length}</span></h3></div><button type="button" className="button button-quiet" onClick={resetProjectForm}>New project <ArrowRight size={14}/></button></div><div className="admin-project-list">{projects.map(project => <article className="admin-project-row" key={project.id ?? project.slug}><div className="admin-project-copy"><strong>{project.title}</strong><span>{project.technologies}</span></div><div className="admin-project-actions"><button type="button" className="icon-button" aria-label={`Edit ${project.title}`} title="Edit project" onClick={() => startEditing(project)}><Pencil size={15}/></button><button type="button" className="icon-button danger" aria-label={`Delete ${project.title}`} title="Delete project" onClick={() => deleteProject(project)}><Trash2 size={15}/></button></div></article>)}</div></div>}
        {notice && <p className="form-notice" role="status">{notice}</p>}
      </section>}

      <section className="work-section section-wrap" id="work">
        <div className="section-heading"><div><div className="eyebrow">SELECTED EXPERIMENTS & BUILDS</div><h2>Work with <span>purpose.</span></h2></div><p>Small details. Clear intent.<br/>Useful outcomes.</p></div>
        <div className="project-toolbar"><span className="project-count">{String(visible.length).padStart(2,'0')} PROJECTS</span><div className="filters">{categories.slice(0,8).map(c=><button key={c} onClick={()=>setFilter(c)} className={filter===c?'filter active':'filter'}>{c}</button>)}</div></div>
        <div className="project-grid">{visible.map((p,i)=><article className="project-card" key={p.id ?? p.slug}>
          <div className={`project-art art-${i%3}`}><div className="art-topline"><span>AXM / {String(i+1).padStart(2,'0')}</span><span>{p.featured?'FEATURED':'CASE STUDY'}</span></div>
            {i%3===0?<div className="dashboard-art"><div className="dash-sidebar"/><div className="dash-main"><div className="dash-line"/><div className="dash-line short"/><div className="dash-chart"><i/><i/><i/><i/><i/><i/><i/></div><div className="dash-cards"><i/><i/><i/></div></div></div>:i%3===1?<div className="orb-art"><div className="orb-core"/><div className="orb-ring ring1"/><div className="orb-ring ring2"/><div className="orb-ring ring3"/></div>:<div className="code-art"><span>01&nbsp; const build = () =&gt; {'{'}</span><span>02&nbsp;&nbsp; return <b>"better"</b>;</span><span>03&nbsp; {'}'}</span><span className="code-cursor">▍</span></div>}
            <span className="project-arrow"><ArrowUpRightIcon/></span>
          </div>
          <div className="project-content"><div className="project-number">0{i+1} / PORTFOLIO</div><h3>{p.title}</h3><p>{p.summary}</p><div className="tag-list">{p.technologies.split(',').map(t=><span key={t}>{t.trim()}</span>)}</div><div className="project-links">{p.githubUrl&&<a href={p.githubUrl} target="_blank" rel="noreferrer"><Github size={15}/> Source <ExternalLink size={12}/></a>}{p.demoUrl&&<a href={p.demoUrl} target="_blank" rel="noreferrer">Live preview <ExternalLink size={12}/></a>}</div></div>
        </article>)}</div>
        {apiStatus==='demo' && <p className="api-note"><span className="live-dot"/> Preview mode — sample projects are shown until the Spring Boot API is running.</p>}
      </section>

      <section className="about-section section-wrap" id="about"><div className="about-left"><div className="eyebrow">THE STUDIO APPROACH</div><h2>Make it useful.<br/><span>Make it last.</span></h2></div><div className="about-right"><p className="about-lead">AxeMax Studio is a digital workspace that helps people present their skills, experience, and ideas with clarity and confidence.</p><p>We believe a great portfolio should be accessible to everyone—not only people who know how to design or code a website. Our goal is to make professional self-presentation simpler with guided content, thoughtful templates, live previews, and portable PDF exports.</p><p>Built with a practical engineering mindset, AxeMax Studio brings together clean design, useful tools, and a learning-led approach. We are growing toward a platform where creators can build their professional identity, showcase meaningful work, and share it with the world.</p><a className="text-link" href="#platform">Explore what you can create <ArrowRight size={16}/></a></div></section>

      <section className="stack-section section-wrap" id="stack"><div className="section-heading"><div><div className="eyebrow">TOOLS OF THE TRADE</div><h2>Built with <span>intention.</span></h2></div><p>Reliable foundations for<br/>ideas that keep growing.</p></div><div className="skill-grid">{skills.map(({title,items,icon:Icon},i)=><article className="skill-card" key={title}><div className="skill-top"><span className="skill-icon"><Icon size={20}/></span><span>0{i+1}</span></div><h3>{title}</h3><p>{items}</p></article>)}</div><div className="tech-strip">{techs.map(t=><span key={t}>{t}</span>)}</div></section>

      <section className="contact-section section-wrap" id="contact"><div className="contact-panel"><div className="contact-glow"/><div className="eyebrow"><Sparkles size={13}/> OPEN TO BUILDING</div><h2>Have a good idea?<br/><span>Let’s make it real.</span></h2><p>Questions, collaboration, or a project worth exploring—start a conversation.</p><div className="contact-actions"><a className="button button-primary" href="mailto:axemax.hq@gmail.com"><Mail size={16}/> axemax.hq@gmail.com <ArrowRight size={15}/></a><button className="button button-quiet" onClick={()=>navigator.clipboard?.writeText('axemax.hq@gmail.com')}>Copy email</button></div></div></section>
    </main>
    <footer className="footer section-wrap"><a className="brand" href="#home"><span className="brand-mark">A<span>M</span></span><span className="brand-name">AXEMAX<span>STUDIO</span></span></a><span>© {new Date().getFullYear()} AXEMAX STUDIO. BUILT WITH INTENTION.</span><div className="footer-social"><a href="https://github.com/" aria-label="GitHub"><Github size={17}/></a><a href="https://linkedin.com/" aria-label="LinkedIn"><Linkedin size={17}/></a></div></footer>
  </div>
}
function ArrowUpRightIcon(){ return <ArrowRight size={17}/> }\nfunction FileTextIcon(){ return <Mail size={20}/> }\nfunction DownloadIcon(){ return <ArrowDownRight size={20}/> }
