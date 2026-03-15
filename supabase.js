const SUPABASE_URL = 'https://soysoppzaajawpummbqt.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNveXNvcHB6YWFqYXdwdW1tYnF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NjY2NzAsImV4cCI6MjA4OTE0MjY3MH0.4EKPpjP-A_8WgIIeLYsVM5y5MdaQNG5NBlGLXuHfRnc'


const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

async function chargerMembres() {
  const { data, error } = await db
    .from('membres')
    .select('*')
    .order('km_mois', { ascending: false })

  if (error) { console.error('Erreur:', error); return }

  const liste = document.getElementById('member-list')
  liste.innerHTML = ''

  const couleurs = ['#e8ff47','#4f9eff','#ff6b35','#22d3a0','#9ca3af']
  const badges = ['','silver','bronze','other','other','other']

  data.forEach((membre, index) => {
    const initiales = membre.nom.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
    const couleur = couleurs[index % couleurs.length]
    const badge = badges[index] || 'other'

    const div = document.createElement('div')
    div.className = 'member-row'
    div.innerHTML = `
      <div class="avatar" style="background:${couleur}20;color:${couleur}">${initiales}</div>
      <div class="member-info">
        <div class="member-name">${membre.nom}</div>
        <div class="member-role">${membre.role || ''} · ${membre.specialite || ''}</div>
      </div>
      <div class="member-stat">
        <div class="member-km">${membre.km_mois}</div>
        <div class="member-km-label">km / mois</div>
      </div>
      <div class="rank-badge ${badge}">${index + 1}</div>
    `
    liste.appendChild(div)
  })
}

chargerMembres()


async function chargerEvenements() {
  const { data, error } = await db
    .from('evenements')
    .select('*')
    .order('date', { ascending: true })

  if (error) { console.error('Erreur:', error); return }

  const liste = document.getElementById('event-list')
  liste.innerHTML = ''

  data.forEach(evt => {
    const date = new Date(evt.date)
    const jour = date.getDate().toString().padStart(2, '0')

    const typeBadge = evt.type === 'course' ? 'race' : 'training'
    const badgeLabel = evt.type === 'course' ? 'Course' : 'Entraîn.'
    const badgeClass = evt.type === 'course' ? 'badge-course' : 'badge-train'

    const div = document.createElement('div')
    div.className = `event-item ${typeBadge}`
    div.innerHTML = `
      <div class="event-date">${jour}</div>
      <div class="event-info">
        <div class="event-name">${evt.nom}</div>
        <div class="event-detail">${evt.lieu || ''} — ${evt.distance_km || ''} km</div>
      </div>
      <span class="event-badge ${badgeClass}">${badgeLabel}</span>
    `
    liste.appendChild(div)
  })
}

chargerEvenements()

async function chargerClassement() {
  const { data, error } = await db
    .from('membres')
    .select('nom, role, specialite, km_mois, points')
    .order('km_mois', { ascending: false })

  if (error) { console.error('Erreur:', error); return }

  const liste = document.querySelector('#tab-km .member-list')
  liste.innerHTML = ''

  const medailles = ['🥇','🥈','🥉']
  const badges = ['','silver','bronze','other','other','other']

  data.forEach((membre, index) => {
    const badge = badges[index] || 'other'
    const medaille = medailles[index] || (index + 1)
    const maxKm = data[0].km_mois || 1
    const largeur = Math.round((membre.km_mois / maxKm) * 100)

    const div = document.createElement('div')
    div.className = 'member-row'
    div.innerHTML = `
      <div class="rank-badge ${badge}" style="width:28px;height:28px;font-size:13px">${medaille}</div>
      <div class="member-info">
        <div class="member-name">${membre.nom}</div>
        <div class="member-role">${membre.specialite || membre.role || ''}</div>
      </div>
      <div style="flex:1;margin:0 12px">
        <div style="height:8px;background:var(--surface2);border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${largeur}%;background:var(--accent);border-radius:4px"></div>
        </div>
      </div>
      <div class="member-km">${membre.km_mois} km</div>
    `
    liste.appendChild(div)
  })
}

chargerClassement()

async function chargerParcours() {
  const { data, error } = await db
    .from('parcours')
    .select('*')
    .order('date_sortie', { ascending: false })

  if (error) { console.error('Erreur:', error); return }

  const liste = document.querySelector('#page-parcours .card')
  liste.innerHTML = '<div class="card-title">Parcours récents</div>'

  const icones = ['🏔','🚴','⚡','🌄','🏁']
  const couleurs = ['#e8ff4718','#ff6b3518','#4f9eff18','#22d3a018','#9ca3af18']

  data.forEach((parcours, index) => {
    const date = new Date(parcours.date_sortie)
    const dateStr = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
    const duree = parcours.duree_min
      ? `${Math.floor(parcours.duree_min / 60)}h${String(parcours.duree_min % 60).padStart(2,'0')}`
      : ''

    const div = document.createElement('div')
    div.className = 'route-item'
    div.innerHTML = `
      <div class="route-icon" style="background:${couleurs[index % couleurs.length]}">${icones[index % icones.length]}</div>
      <div class="route-data">
        <div class="route-name">${parcours.nom}</div>
        <div class="route-meta">${dateStr} · ↑ ${parcours.denivele_m || 0}m · ${duree}</div>
      </div>
      <div>
        <div class="route-km">${parcours.distance_km || 0}</div>
        <div class="route-unit">km</div>
      </div>
    `
    liste.appendChild(div)
  })
}

chargerParcours()

async function seConnecter() {
  const email = document.getElementById('login-email').value.trim()
  const password = document.getElementById('login-password').value.trim()

  const { data, error } = await db.auth.signInWithPassword({ email, password })

  if (error) {
    document.getElementById('login-error').style.display = 'block'
    return
  }

  document.getElementById('login-page').style.display = 'none'
  document.getElementById('app-page').style.display = 'block'

  chargerMembres()
  chargerEvenements()
  chargerClassement()
  chargerParcours()
}

async function verifierSession() {
  const { data } = await db.auth.getSession()

  if (data.session) {
    document.getElementById('login-page').style.display = 'none'
    document.getElementById('app-page').style.display = 'block'
    chargerMembres()
    chargerEvenements()
    chargerClassement()
    chargerParcours()
  }
}

verifierSession()