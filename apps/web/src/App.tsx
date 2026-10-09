import { useEffect, useMemo, useState } from 'react'
import { ArrowDownRight, ArrowRight, Github, Linkedin, Mail, Menu, X, ExternalLink, Code2, Layers3, Smartphone, Terminal, Sparkles } from 'lucide-react'

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
  async function createProject(e: React.FormEvent) {
    e.preventDefault(); setNotice('')
    const slug = projectSlug || projectTitle.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    try {
      const r = await fetch('/api/v1/admin/projects', { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body: JSON.stringify({
        title: projectTitle, slug, summary: projectSummary, description: projectDescription || projectSummary,
        technologies: projectTech, status:'PUBLISHED', featured:false
      }) })
      if (!r.ok) throw new Error('Could not create project. Check required fields and API logs.')
      const saved = await r.json(); setProjects(old => [saved, ...old]); setNotice('Project published.'); setProjectTitle(''); setProjectSlug(''); setProjectSummary(''); setProjectDescription('')
    } catch (err) { setNotice(err instanceof Error ? err.message : 'Could not save project.') }
  }

  return <div className="site-shell">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <header className="topbar">
      <a className="brand" href="#home" aria-label="AxeMax Studio home"><span className="brand-mark">A<span>M</span></span><span className="brand-name">AXEMAX<span>STUDIO</span></span></a>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X/> : <Menu/>}</button>
      <nav className={menuOpen ? 'nav-links nav-open' : 'nav-links'}>
        <a onClick={() => setMenuOpen(false)} href="#work">Work</a><a onClick={() => setMenuOpen(false)} href="#about">About</a><a onClick={() => setMenuOpen(false)} href="#stack">Stack</a><a onClick={() => setMenuOpen(false)} href="#contact">Contact</a>
        <button className="nav-cta" onClick={() => {setAdminOpen(!adminOpen); setMenuOpen(false)}}>Studio admin <ArrowRight size={15}/></button>
      </nav>
    </header>

    <main>
      <section className="hero section-wrap" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot"/>{apiStatus === 'connected' ? 'CONNECTED TO AXEMAX API' : 'INDEPENDENT IDEAS. THOUGHTFUL ENGINEERING.'}</div>
          <h1>Build beyond<br/><span>the expected.</span></h1>
          <p className="hero-text">A digital studio for useful ideas, carefully engineered products, and experiences that make complex things feel simple.</p>
          <div className="hero-actions"><a className="button button-primary" href="#work">Explore selected work <ArrowDownRight size={17}/></a><a className="button button-quiet" href="#contact">Let’s connect <ArrowRight size={16}/></a></div>
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

      {adminOpen && <section className="admin-panel section-wrap">
        <div className="section-heading"><div><div className="eyebrow">PRIVATE WORKSPACE</div><h2>Studio admin</h2></div><button className="icon-button" onClick={() => {setAdminOpen(false);setNotice('')}}><X/></button></div>
        {!token ? <form className="admin-form" onSubmit={login}><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label><button className="button button-primary">Sign in <ArrowRight size={15}/></button></form> :
        <form className="admin-form admin-grid" onSubmit={createProject}><label>Project title<input value={projectTitle} onChange={e=>setProjectTitle(e.target.value)} required/></label><label>Slug (optional)<input value={projectSlug} onChange={e=>setProjectSlug(e.target.value)} placeholder="auto-generated"/></label><label className="wide">Summary<input value={projectSummary} onChange={e=>setProjectSummary(e.target.value)} required/></label><label className="wide">Description<textarea value={projectDescription} onChange={e=>setProjectDescription(e.target.value)} /></label><label className="wide">Technologies (comma-separated)<input value={projectTech} onChange={e=>setProjectTech(e.target.value)} required/></label><button className="button button-primary">Publish project <ArrowRight size={15}/></button><button type="button" className="button button-quiet" onClick={()=>{setToken('');setPassword('');setNotice('Signed out.')}}>Sign out</button></form>}
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

      <section className="about-section section-wrap" id="about"><div className="about-left"><div className="eyebrow">THE STUDIO APPROACH</div><h2>Make it useful.<br/><span>Make it last.</span></h2></div><div className="about-right"><p className="about-lead">AxeMax Studio is a learning-led digital portfolio built around a simple idea: good software should be understandable, dependable, and a pleasure to use.</p><p>This space brings together experiments across backend engineering, modern interfaces, API design, and mobile experiences. Each project is an opportunity to build something real—and explain how it works.</p><a className="text-link" href="#contact">Have a project in mind? <ArrowRight size={16}/></a></div></section>

      <section className="stack-section section-wrap" id="stack"><div className="section-heading"><div><div className="eyebrow">TOOLS OF THE TRADE</div><h2>Built with <span>intention.</span></h2></div><p>Reliable foundations for<br/>ideas that keep growing.</p></div><div className="skill-grid">{skills.map(({title,items,icon:Icon},i)=><article className="skill-card" key={title}><div className="skill-top"><span className="skill-icon"><Icon size={20}/></span><span>0{i+1}</span></div><h3>{title}</h3><p>{items}</p></article>)}</div><div className="tech-strip">{techs.map(t=><span key={t}>{t}</span>)}</div></section>

      <section className="contact-section section-wrap" id="contact"><div className="contact-panel"><div className="contact-glow"/><div className="eyebrow"><Sparkles size={13}/> OPEN TO BUILDING</div><h2>Have a good idea?<br/><span>Let’s make it real.</span></h2><p>Questions, collaboration, or a project worth exploring—start a conversation.</p><div className="contact-actions"><a className="button button-primary" href="mailto:axemax.hq@gmail.com"><Mail size={16}/> axemax.hq@gmail.com <ArrowRight size={15}/></a><button className="button button-quiet" onClick={()=>navigator.clipboard?.writeText('axemax.hq@gmail.com')}>Copy email</button></div></div></section>
    </main>
    <footer className="footer section-wrap"><a className="brand" href="#home"><span className="brand-mark">A<span>M</span></span><span className="brand-name">AXEMAX<span>STUDIO</span></span></a><span>© {new Date().getFullYear()} AXEMAX STUDIO. BUILT WITH INTENTION.</span><div className="footer-social"><a href="https://github.com/" aria-label="GitHub"><Github size={17}/></a><a href="https://linkedin.com/" aria-label="LinkedIn"><Linkedin size={17}/></a></div></footer>
  </div>
}
function ArrowUpRightIcon(){ return <ArrowRight size={17}/> }
