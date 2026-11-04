import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, Check, Clock3, Camera, MapPin, Menu as MenuIcon, Search, Sparkles, X } from 'lucide-react'
import { createReservation, getAvailability, getMenu } from './api'
import { categories, fallbackMenu } from './data'

const money = (value) => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(value)

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function Header() {
  const [open, setOpen] = useState(false)
  const links = [['Home','/'],['Menu','/menu'],['Our story','/story'],['Visit','/visit']]
  return <header className="header">
    <Link className="brand" to="/" onClick={() => setOpen(false)} aria-label="Maison Ember home">
      <span className="brand-mark">M<span>✦</span>E</span><span className="brand-caption">MAISON EMBER</span>
    </Link>
    <nav className={open ? 'nav nav-open' : 'nav'}>
      {links.map(([label, path]) => <NavLink key={path} to={path} onClick={() => setOpen(false)}>{label}</NavLink>)}
      <Link className="nav-cta" to="/reserve" onClick={() => setOpen(false)}>Reserve a table <ArrowUpRight size={15}/></Link>
    </nav>
    <button className="mobile-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Close navigation' : 'Open navigation'}>{open ? <X/> : <MenuIcon/>}</button>
  </header>
}

function Footer() {
  return <footer className="footer">
    <div className="footer-top">
      <div><div className="brand-mark footer-mark">M<span>✦</span>E</div><p>An evening worth remembering.</p></div>
      <div className="footer-links"><Link to="/menu">Explore the menu</Link><Link to="/reserve">Reservations</Link><Link to="/visit">Find us</Link></div>
      <div className="footer-meta"><span><Clock3 size={15}/> Tue–Sun · 12 PM–10:30 PM</span><span><MapPin size={15}/> Location details coming soon</span><a target="_blank" rel="noreferrer"><Camera size={15}/> Camera</a></div>
    </div>
    <div className="footer-bottom"><span>© 2026 Maison Ember · Concept restaurant</span><span>Made for memorable evenings</span></div>
  </footer>
}

function SectionLabel({ children }) { return <div className="section-label"><span/> {children}</div> }

function DishCard({ dish }) {
  return <article className="dish-card">
    <div className="dish-image-wrap"><img src={dish.image} alt={dish.name} loading="lazy"/>{dish.featured && <span className="dish-tag">Chef's selection</span>}</div>
    <div className="dish-info"><div><h3>{dish.name}</h3><p>{dish.description}</p><div className="dish-meta">{dish.vegetarian && <span className="veg-dot"/>}{dish.vegetarian ? 'Vegetarian' : 'Signature dish'}</div></div><strong>{money(dish.price)}</strong></div>
  </article>
}

function Home({ menu }) {
  const featured = menu.filter(d => d.featured).slice(0,3)
  return <>
    <section className="hero">
      <div className="hero-image"/>
      <div className="hero-overlay"/>
      <div className="hero-content">
        <SectionLabel>Fine dining · Thoughtfully crafted</SectionLabel>
        <h1>An evening<br/><em>worth remembering.</em></h1>
        <p>Seasonal ingredients. Unhurried moments.<br/>A table made for coming together.</p>
        <div className="hero-actions"><Link className="button button-light" to="/reserve">Reserve your table <ArrowUpRight size={16}/></Link><Link className="text-link light-link" to="/menu">Explore the menu <ArrowDown size={15}/></Link></div>
      </div>
      <div className="hero-side-note">A CONSIDERED DINING EXPERIENCE <span>01 / 05</span></div>
      <div className="hero-bottom"><span>MAISON EMBER — EST. 2026</span><span>INDIA · LOCATION TO BE ANNOUNCED</span></div>
    </section>
    <section className="intro section-pad">
      <div className="intro-left"><SectionLabel>A place to linger</SectionLabel><h2>Good food is only<br/>the <em>beginning.</em></h2></div>
      <div className="intro-copy"><p className="lead">At Maison Ember, every detail is an invitation to slow down.</p><p>From the first pour to the last course, our kitchen brings together seasonal produce, thoughtful technique, and the warmth of Indian hospitality.</p><Link className="text-link" to="/story">Discover our philosophy <ArrowRight size={16}/></Link></div>
    </section>
    <section className="featured section-pad">
      <div className="section-heading"><div><SectionLabel>From our kitchen</SectionLabel><h2>Made to be <em>savoured.</em></h2></div><Link className="text-link" to="/menu">View full menu <ArrowRight size={16}/></Link></div>
      <div className="dish-grid">{featured.map(d => <DishCard key={d.id} dish={d}/>)}</div>
    </section>
    <section className="experience">
      <div className="experience-image"/>
      <div className="experience-copy"><SectionLabel>The Maison experience</SectionLabel><h2>Some moments<br/>deserve a <em>setting.</em></h2><p>Celebrate a milestone, gather your favourite people, or simply make an ordinary evening feel extraordinary.</p><Link className="button button-outline" to="/reserve">Make it a moment <ArrowUpRight size={16}/></Link></div>
    </section>
    <section className="quote-section"><span className="quote-mark">“</span><blockquote>Come as you are.<br/><em>Leave a little more connected.</em></blockquote><p>MAISON EMBER · A TABLE FOR EVERY STORY</p></section>
    <section className="reserve-banner"><div><SectionLabel>Your table is waiting</SectionLabel><h2>Make room for<br/><em>something lovely.</em></h2></div><Link className="button button-light" to="/reserve">Book an evening <ArrowUpRight size={16}/></Link></section>
  </>
}

function MenuPage({ menu }) {
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [vegOnly, setVegOnly] = useState(false)
  const filtered = useMemo(() => menu.filter(d => (category === 'All' || d.category === category) && (!vegOnly || d.vegetarian) && `${d.name} ${d.description}`.toLowerCase().includes(query.toLowerCase())), [menu, category, query, vegOnly])
  return <main className="page-shell">
    <section className="page-hero menu-hero"><SectionLabel>Seasonal, considered, generous</SectionLabel><h1>Our <em>menu.</em></h1><p>A meeting of thoughtful technique and ingredients at their best.</p></section>
    <section className="menu-section section-pad">
      <div className="menu-toolbar"><div className="category-tabs">{categories.map(c => <button className={category===c?'active':''} key={c} onClick={() => setCategory(c)}>{c}</button>)}</div><div className="menu-filters"><label className="search-box"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a dish"/></label><label className="veg-filter"><input type="checkbox" checked={vegOnly} onChange={e=>setVegOnly(e.target.checked)}/> Vegetarian</label></div></div>
      {filtered.length ? <div className="dish-grid menu-grid">{filtered.map(d => <DishCard key={d.id} dish={d}/>)}</div> : <div className="empty-state">No dishes match your search. Try another category or ingredient.</div>}
      <p className="menu-note">Please let our team know about allergies or dietary requirements before ordering. Menu items and prices are illustrative and may change seasonally.</p>
    </section>
  </main>
}

function ReservationPage() {
  const [form, setForm] = useState({ date:'', time:'', guests:'2', name:'', email:'', phone:'', notes:'' })
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState(null)
  const today = new Date()
  const minDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
  const update = (key, value) => setForm(prev => ({...prev, [key]:value}))
  useEffect(() => {
    if (!form.date || !form.guests) { setSlots([]); return }
    let alive = true
    setLoadingSlots(true); setError('')
    getAvailability(form.date, form.guests).then(data => { if(alive) setSlots(data.slots || []) }).catch(e => { if(alive) setError(e.message) }).finally(() => { if(alive) setLoadingSlots(false) })
    return () => { alive = false }
  }, [form.date, form.guests])
  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true)
    try {
      const result = await createReservation({...form, guests:Number(form.guests)})
      setConfirmation(result.reservation); setForm({date:'',time:'',guests:'2',name:'',email:'',phone:'',notes:''})
    } catch(e) { setError(e.message) } finally { setBusy(false) }
  }
  if (confirmation) return <main className="confirmation-page"><div className="confirmation-card"><div className="confirm-icon"><Check/></div><SectionLabel>Reservation received</SectionLabel><h1>We'll save you<br/><em>a seat.</em></h1><p>Your demo reservation has been recorded. Here are your details:</p><div className="confirm-details"><span>Reference</span><strong>{confirmation.reference}</strong><span>Date & time</span><strong>{confirmation.date} · {confirmation.time}</strong><span>Guests</span><strong>{confirmation.guests}</strong></div><p className="small-note">This is a local demo confirmation, not a booking with a real restaurant.</p><button className="button button-dark" onClick={()=>setConfirmation(null)}>Make another reservation</button></div></main>
  return <main className="reservation-page">
    <div className="reservation-aside"><SectionLabel>Come together</SectionLabel><h1>A table<br/>for <em>your moment.</em></h1><p>Whether it's a quiet dinner for two or a gathering worth celebrating, we'd be delighted to welcome you.</p><div className="aside-detail"><Clock3/><div><strong>Dining hours</strong><span>Tuesday–Sunday · 12 PM–10:30 PM</span></div></div><div className="aside-detail"><MapPin/><div><strong>Find us</strong><span>Location details coming soon</span></div></div></div>
    <form className="reservation-form" onSubmit={submit}>
      <div className="form-heading"><SectionLabel>Reservations</SectionLabel><h2>Plan your <em>visit.</em></h2><p>Choose your preferred date and time. We'll take care of the rest.</p></div>
      <div className="form-row"><label>Preferred date<input type="date" min={minDate} required value={form.date} onChange={e=>update('date',e.target.value)}/></label><label>Guests<select value={form.guests} onChange={e=>update('guests',e.target.value)}>{[1,2,3,4,5,6,7,8].map(n=><option key={n} value={n}>{n} {n===1?'guest':'guests'}</option>)}</select></label></div>
      <div className="field-label">Available times {loadingSlots && <span className="muted">Checking…</span>}</div>
      <div className="time-slots">{slots.length ? slots.map(slot=><button type="button" key={slot} className={form.time===slot?'selected':''} onClick={()=>update('time',slot)}>{slot}</button>) : <span className="slot-hint">{form.date ? 'No times available for this date.' : 'Select a date to see available times.'}</span>}</div>
      <div className="form-row"><label>Your name<input required minLength="2" value={form.name} onChange={e=>update('name',e.target.value)} placeholder="Full name"/></label><label>Email address<input type="email" required value={form.email} onChange={e=>update('email',e.target.value)} placeholder="you@example.com"/></label></div>
      <label>Phone number <span className="muted">(optional)</span><input type="tel" value={form.phone} onChange={e=>update('phone',e.target.value)} placeholder="+91"/></label>
      <label>Special requests <span className="muted">(optional)</span><textarea rows="3" maxLength="500" value={form.notes} onChange={e=>update('notes',e.target.value)} placeholder="Celebration, dietary needs, or anything we should know…"/></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-dark submit-button" disabled={busy || !form.time}>{busy?'Confirming…':'Confirm reservation'} <ArrowUpRight size={16}/></button>
      <p className="small-note">Demo only: no email or SMS will be sent, and this does not reserve a real restaurant table.</p>
    </form>
  </main>
}

function StoryPage() {
  return <main className="page-shell">
    <section className="page-hero"><SectionLabel>Our philosophy</SectionLabel><h1>Made with care.<br/><em>Shared with joy.</em></h1><p>We believe the best meals are the ones that give us time to be together.</p></section>
    <section className="story-layout section-pad"><img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=85" alt="An intimate dining table"/><div><SectionLabel>The Maison way</SectionLabel><h2>Thoughtful food.<br/><em>Unhurried moments.</em></h2><p>Maison Ember is a restaurant concept built around the warmth of a shared table. Our imagined kitchen brings seasonal ingredients into conversation with contemporary technique and the generous flavours of India.</p><p>From the first welcome to the last sip, every detail is considered—and every guest is invited to feel at home.</p><h3>A kitchen guided by the seasons</h3><p>Our Chef’s Special is designed to change with the season, celebrating ingredients at their best. The menu is a starting point for discovery, not a fixed script.</p><h3>Gather around</h3><p>Whether it’s an ordinary evening, a milestone celebration, or a table full of friends, we believe good food makes room for connection.</p><Link className="button button-dark" to="/reserve">Join us at the table <ArrowUpRight size={16}/></Link></div></section>
    <section className="section-pad"><SectionLabel>More to discover</SectionLabel><h2>Every gathering has its own <em>story.</em></h2><div className="visit-grid">
      <article className="visit-card"><h3>Chef’s Special & Seasonal Menu</h3><p>Explore a rotating selection inspired by ingredients at their seasonal best. Availability may change.</p><Link className="text-link" to="/menu">Explore the menu <ArrowRight size={15}/></Link></article>
      <article className="visit-card"><h3>Gallery</h3><p>A glimpse of the food, the interiors, and the little moments that make a meal memorable.</p><Link className="text-link" to="/menu">See our menu <ArrowRight size={15}/></Link></article>
      <article className="visit-card"><h3>Private Dining & Celebrations</h3><p>Planning a birthday, anniversary, or group dinner? Send an inquiry and tell us what you’re imagining.</p><Link className="text-link" to="/visit">Get in touch <ArrowRight size={15}/></Link></article>
    </div><p className="small-note">Dietary and allergen details should be confirmed with the kitchen before ordering. Guest testimonials will be added only with genuine customer feedback and permission.</p></section>
  </main>
}
function VisitPage() {
  return <main className="page-shell"><section className="page-hero"><SectionLabel>We look forward to welcoming you</SectionLabel><h1>Find your way<br/><em>to the table.</em></h1><p>Restaurant location and contact information will be added when a real location is selected.</p></section><section className="visit-grid section-pad"><div className="visit-card"><MapPin/><h3>Location</h3><p>Address to be announced</p><span>India · Concept restaurant</span></div><div className="visit-card"><Clock3/><h3>Opening hours</h3><p>Tuesday–Sunday</p><span>12:00 PM – 10:30 PM · Monday closed</span></div><div className="visit-card"><CalendarDays/><h3>Reservations</h3><p>Plan your next evening</p><Link className="text-link" to="/reserve">Book a table <ArrowRight size={15}/></Link></div></section><section className="map-placeholder"><MapPin size={28}/><strong>Our location will appear here</strong><span>Map integration can be added after choosing a real restaurant address.</span></section></main>
}

export default function App() {
  const [menu, setMenu] = useState(fallbackMenu)

  return <><ScrollToTop/><Header/><Routes><Route path="/" element={<Home menu={menu}/>}/><Route path="/menu" element={<MenuPage menu={menu}/>}/><Route path="/reserve" element={<ReservationPage/>}/><Route path="/story" element={<StoryPage/>}/><Route path="/visit" element={<VisitPage/>}/><Route path="*" element={<Home menu={menu}/>}/></Routes><Footer/></>
}
