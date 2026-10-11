import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2, Eye, EyeOff, ShieldCheck, X } from 'lucide-react'
import './AccountAccess.css'

type Props = {
  onClose: () => void
  onAuthenticated: (token: string, username: string) => void
}

type ApiMessage = { message?: string; detail?: string; title?: string; username?: string; accountVerified?: boolean; emailVerified?: boolean; phoneVerified?: boolean; accessToken?: string }

export default function AccountAccess({ onClose, onAuthenticated }: Props) {
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [legalPage, setLegalPage] = useState<'terms' | 'privacy' | null>(null)
  const [code, setCode] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token')
    if (!token || window.location.pathname !== '/verify-email') return
    setMode('verify')
    setBusy(true)
    fetch('/api/v1/auth/user/verify-email?token=' + encodeURIComponent(token))
      .then(async response => {
        const data = await response.json().catch(() => ({})) as ApiMessage
        if (!response.ok) throw new Error(data.message ?? data.detail ?? 'This verification link is invalid or expired.')
        setNotice(data.message ?? 'Email confirmed. Continue with phone verification.')
        setMode(data.accountVerified ? 'login' : 'verify')
        window.history.replaceState({}, '', '/')
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Could not verify email.'))
      .finally(() => setBusy(false))
  }, [])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (mode === 'register' && !acceptedTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy to continue.')
      return
    }
    setBusy(true)
    try {
      let url = ''
      let body: Record<string, string> = {}
      if (mode === 'register') {
        url = '/api/v1/auth/user/register'
        body = { username, email, phoneNumber, password, confirmPassword }
      } else if (mode === 'verify') {
        url = '/api/v1/auth/user/verify-phone'
        body = { identifier: username, code }
      } else {
        url = '/api/v1/auth/user/login'
        body = { identifier: username, password }
      }
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await response.json().catch(() => ({})) as ApiMessage
      if (!response.ok) throw new Error(data.message ?? data.detail ?? 'Request failed. Please try again.')
      if (mode === 'login' && data.accessToken) {
        onAuthenticated(data.accessToken, data.username ?? username)
        onClose()
        return
      }
      if (mode === 'register') {
        setMode('verify')
        setUsername(data.username ?? username)
        setNotice(data.message ?? 'Account created. Confirm your email and phone number before signing in.')
      } else {
        setNotice(data.message ?? 'Verification completed.')
        if (data.accountVerified) setMode('login')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return <div className="auth-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <button className="auth-close" type="button" aria-label="Close account panel" onClick={onClose}><X size={18}/></button>
      <div className="auth-brand"><span className="auth-mark">A<span>M</span></span><span>AXEMAX <b>STUDIO</b></span></div>
      <div className="auth-eyebrow"><ShieldCheck size={14}/> YOUR ACCOUNT, YOUR WORKSPACE</div>
      <h2 id="auth-title">{mode === 'register' ? 'Create your account.' : mode === 'verify' ? 'Verify your account.' : 'Welcome back.'}</h2>
      <p className="auth-subtitle">{mode === 'register'
        ? 'Join AxeMax Studio to start building your professional portfolio.'
        : mode === 'verify'
          ? 'Confirm your email from the link we sent, then verify your phone with the SMS code.'
          : 'Sign in with your username or email and password.'}</p>

      <div className="auth-tabs">
        <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); setNotice('') }}>Sign in</button>
        <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError(''); setNotice('') }}>Create account</button>
        {mode === 'verify' && <button type="button" className="active">Verify</button>}
      </div>

      <form className="auth-form" onSubmit={submit}>
        {mode === 'register' && <>
          <label>Username <span className="auth-required">*</span><input value={username} onChange={e => setUsername(e.target.value)} minLength={3} maxLength={40} pattern="[A-Za-z0-9_.-]+" autoComplete="username" required placeholder="e.g. alex_dev"/></label>
          <label>Email address <span className="auth-required">*</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required placeholder="you@example.com"/></label>
          <label>Phone number <span className="auth-required">* Required for SMS verification</span><input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} pattern="\+[1-9][0-9]{7,14}" required placeholder="+919876543210"/><small>Use international format including country code.</small></label>
          <label>Password <span className="auth-required">*</span><span className="auth-password-wrap"><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} minLength={10} maxLength={72} autoComplete="new-password" required placeholder="At least 10 characters"/><button type="button" className="auth-eye" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></span><small>Use at least 10 characters. Never reuse a password from another site.</small></label>
          <label>Confirm password <span className="auth-required">*</span><span className="auth-password-wrap"><input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={10} maxLength={72} autoComplete="new-password" required placeholder="Re-enter your password" aria-invalid={confirmPassword.length > 0 && password !== confirmPassword}/><button type="button" className="auth-eye" onClick={() => setShowConfirmPassword(v => !v)} aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}>{showConfirmPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></span>{confirmPassword.length > 0 && password !== confirmPassword && <small className="auth-inline-error">Passwords do not match.</small>}</label>
          <label className="auth-consent"><input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} required/><span>I agree to the <button type="button" onClick={() => setLegalPage('terms')}>Terms of Service</button> and <button type="button" onClick={() => setLegalPage('privacy')}>Privacy Policy</button>. <span className="auth-required">*</span></span></label>
        </>}
        {mode === 'login' && <>
          <label>Username or email<input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" required placeholder="Your username or email"/></label>
          <label>Password <span className="auth-required">*</span><span className="auth-password-wrap"><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required placeholder="Your password"/><button type="button" className="auth-eye" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></span></label>
        </>}
        {mode === 'verify' && <>
          <label>Username or email<input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" required placeholder="Your registered username"/></label>
          <label>SMS verification code<input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required placeholder="6-digit code"/></label>
          <p className="auth-help"><CheckCircle2 size={14}/> Open the confirmation link sent to your email. SMS codes expire after 10 minutes.</p>
        </>}
        {error && <p className="auth-message error" role="alert">{error}</p>}
        {notice && <p className="auth-message success" role="status">{notice}</p>}
        <button className="auth-submit" type="submit" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'register' ? 'Create account' : mode === 'verify' ? 'Verify phone' : 'Sign in'}
          {!busy && <ArrowRight size={16}/>}
        </button>
      </form>
      {mode === 'login' && <p className="auth-footnote">New to AxeMax Studio? <button type="button" onClick={() => { setMode('register'); setError(''); setNotice('') }}>Create an account</button></p>}
      {mode === 'register' && <p className="auth-footnote">Already registered? <button type="button" onClick={() => { setMode('login'); setError(''); setNotice('') }}>Sign in</button></p>}
      <p className="auth-privacy">Fields marked * are required. We use your email and phone for account verification and essential account messages.</p>
      {legalPage && <div className="auth-legal-overlay" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setLegalPage(null) }}><section className="auth-legal" role="dialog" aria-modal="true" aria-labelledby="auth-legal-title"><button type="button" className="auth-close" onClick={() => setLegalPage(null)} aria-label="Close"><X size={18}/></button><h3 id="auth-legal-title">{legalPage === 'terms' ? 'Terms of Service' : 'Privacy Policy'}</h3>{legalPage === 'terms' ? <><p>Use AxeMax Studio lawfully and provide accurate registration information. Keep your password confidential and do not attempt to access another person's account or disrupt the service.</p><p>Portfolio drafts are currently stored in your browser. Creating an account does not yet sync drafts across devices. The service is provided as available and may change while in development.</p><p>Contact the AxeMax Studio team for questions about these terms.</p></> : <><p>AxeMax Studio collects your username, email address and phone number to create and verify your account and send essential account messages, including the verification and welcome emails.</p><p>Passwords are stored as secure password hashes. Verification tokens and phone codes are stored as hashes. Do not enter information you do not have permission to share.</p><p>Account data is stored in the application's database. Contact the AxeMax Studio team to request help with your account or personal data.</p></>}<button className="auth-submit" type="button" onClick={() => setLegalPage(null)}>Close</button></section></div>}
    </section>
  </div>
}
