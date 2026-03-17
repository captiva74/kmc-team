const SUPABASE_URL = 'https://soysoppzaajawpummbqt.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNveXNvcHB6YWFqYXdwdW1tYnF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NjY2NzAsImV4cCI6MjA4OTE0MjY3MH0.4EKPpjP-A_8WgIIeLYsVM5y5MdaQNG5NBlGLXuHfRnc'

const STRAVA_CLIENT_ID = '129727'
const STRAVA_REDIRECT_URI = 'https://kmc-team.vercel.app'

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

let pageMembres = 1
const parPage = 5

async function chargerMembres() {
  const { data, error } = await db
    .from('membres')
    .select('*')
    .order('km_mois', { ascending: false })

  if (error) { console.error('Erreur:', error); return }

  window.tousLesMembres = data
  afficherPageMembres(1)
}

function afficherPageMembres(page) {
  pageMembres = page
  const data = window.tousLesMembres || []
  const total = data.length
  const totalPages = Math.ceil(total / parPage)
  const debut = (page - 1) * parPage
  const fin = debut + parPage
  const pageDonnees = data.slice(debut, fin)

  const liste = document.getElementById('member-list')
  liste.innerHTML = ''

  const couleurs = ['#e8ff47','#4f9eff','#ff6b35','#22d3a0','#9ca3af']
  const badges = ['','silver','bronze','other','other','other']

  pageDonnees.forEach((membre, index) => {
    const indexGlobal = debut + index
    const initiales = membre.nom.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
    const couleur = couleurs[indexGlobal % couleurs.length]
    const badge = badges[indexGlobal] || 'other'

    const div = document.createElement('div')
    div.className = 'member-row'
    div.innerHTML = `
    <div class="avatar" style="background:${couleur}20;color:${couleur};overflow:hidden">
      ${membre.photo_url ? `<img src="${membre.photo_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : initiales}
    </div>
    <div class="member-info">
      <div class="member-name">${membre.nom}</div>
      <div class="member-role">${membre.role || ''} · ${membre.specialite || ''} · <span style="color:var(--accent);font-size:11px">${membre.categorie || ''}</span></div>
    </div>
    <div class="member-stat">
      <div class="member-km">${membre.km_mois}</div>
      <div class="member-km-label">km / mois</div>
    </div>
    <div class="rank-badge ${badge}">${indexGlobal + 1}</div>
    <button onclick="ouvrirModalModif('${membre.id}','${(membre.nom||'').replace(/'/g,'`')}','${membre.role||''}','${membre.specialite||''}','${membre.date_naissance||''}','${membre.categorie||''}',${membre.km_mois||0},'${membre.photo_url||''}','${membre.num_licence||''}')" style="background:none;border:1px solid #ffffff20;color:#6b7280;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;margin-left:6px">✏️</button>
    <button onclick="modifierPoints('${membre.id}', ${membre.points||0})" style="background:none;border:1px solid #e8ff4740;color:#e8ff47;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;margin-left:4px">★</button>
    <button onclick="supprimerMembre('${membre.id}')" style="background:none;border:1px solid #ff6b3540;color:#ff6b35;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;margin-left:4px">🗑️</button>
    `
    liste.appendChild(div)
  })
const pagination = document.getElementById('pagination-membres')
pagination.innerHTML = ''

if (totalPages <= 1) return

const wrapper = document.createElement('div')
wrapper.style.cssText = 'width:100%;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:6px;margin-top:1rem;padding:0 0.5rem'

const prev = document.createElement('button')
prev.textContent = '←'
prev.style.cssText = `font-size:13px;padding:6px 12px;border-radius:6px;border:1px solid var(--border);background:none;color:${page === 1 ? '#ffffff20' : 'var(--text)'};cursor:pointer`
prev.disabled = page === 1
prev.onclick = () => afficherPageMembres(page - 1)
wrapper.appendChild(prev)

for (let i = 1; i <= totalPages; i++) {
  const btn = document.createElement('button')
  btn.textContent = i
  btn.style.cssText = `font-size:13px;padding:6px 10px;border-radius:6px;border:1px solid ${i === page ? 'var(--accent)' : 'var(--border)'};background:${i === page ? 'var(--accent)' : 'none'};color:${i === page ? '#0d0f14' : 'var(--muted)'};cursor:pointer;min-width:32px`
  btn.onclick = () => afficherPageMembres(i)
  wrapper.appendChild(btn)
}

const next = document.createElement('button')
next.textContent = '→'
next.style.cssText = `font-size:13px;padding:6px 12px;border-radius:6px;border:1px solid var(--border);background:none;color:${page === totalPages ? '#ffffff20' : 'var(--text)'};cursor:pointer`
next.disabled = page === totalPages
next.onclick = () => afficherPageMembres(page + 1)
wrapper.appendChild(next)

const info = document.createElement('div')
info.style.cssText = 'width:100%;text-align:center;font-size:11px;color:var(--muted);margin-top:4px'
info.textContent = `Page ${page} sur ${totalPages} — ${total} membres`
wrapper.appendChild(info)

pagination.appendChild(wrapper)
}

function filtrerMembres(texte) {
  if (!window.tousLesMembres) return
  if (texte === '') {
    afficherPageMembres(1)
    return
  }
  const filtres = window.tousLesMembres.filter(m =>
    m.nom.toLowerCase().includes(texte.toLowerCase())
  )
  window.tousLesMembres = filtres
  afficherPageMembres(1)
  window.tousLesMembres = window.tousLesMembresOriginal
}



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
    const mois = (date.getMonth() + 1).toString().padStart(2, '0')
    const annee = date.getFullYear()
    const dateAffichee = `${jour}-${mois}-${annee}`

    const typeBadge = evt.type === 'course' ? 'race' : 'training'
    const badgeLabel = evt.type === 'course' ? 'Course' : 'Entraîn.'
    const badgeClass = evt.type === 'course' ? 'badge-course' : 'badge-train'

    const div = document.createElement('div')
    div.className = `event-item ${typeBadge}`
    div.innerHTML = `
    <div class="event-date" style="font-size:14px;min-width:80px">${dateAffichee}</div>
    <div class="event-info">
        <div class="event-name">${evt.nom}</div>
        <div class="event-detail">${evt.lieu || ''} — ${evt.distance_km || ''} km</div>
    </div>
    <span class="event-badge ${badgeClass}">${badgeLabel}</span>
    <button onclick="supprimerEvenement('${evt.id}')" style="background:none;border:1px solid #ff6b3540;color:#ff6b35;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;margin-left:8px">🗑️</button>
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

  const totalKmParcours = data.reduce((sum, p) => sum + (parseFloat(p.distance_km) || 0), 0)
  const totalDenivele = data.reduce((sum, p) => sum + (parseInt(p.denivele_m) || 0), 0)
  const totalSorties = data.length

  document.getElementById('stat-km-parcours').textContent = totalKmParcours.toLocaleString()
  document.getElementById('stat-denivele').textContent = totalDenivele.toLocaleString()
  document.getElementById('stat-sorties').textContent = totalSorties

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
    <button onclick="supprimerParcours('${parcours.id}')" style="background:none;border:1px solid #ff6b3540;color:#ff6b35;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;margin-left:8px">🗑️</button>
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
  chargerDashboard()
  afficherProfil()
  chargerGraphique()
  afficherStatsStrava()
  construireCalendrier()
}

async function verifierSession() {
  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  const accessToken = hashParams.get('access_token')
  const type = hashParams.get('type')

  if (accessToken && type === 'recovery') {
    await db.auth.setSession({
      access_token: accessToken,
      refresh_token: hashParams.get('refresh_token')
    })
    window.history.replaceState({}, document.title, '/')
    document.getElementById('login-page').style.display = 'none'
    document.getElementById('app-page').style.display = 'none'
    document.getElementById('reset-page').style.display = 'flex'
    return
  }

  const { data } = await db.auth.getSession()
  if (data.session) {
    document.getElementById('login-page').style.display = 'none'
    document.getElementById('app-page').style.display = 'block'
    chargerMembres()
    chargerEvenements()
    chargerClassement()
    chargerParcours()
    chargerClassementPoints()
    chargerDashboard()
    afficherProfil()
    chargerGraphique()
    afficherStatsStrava()
    construireCalendrier()
    const urlParams = new URLSearchParams(window.location.search)
    const stravaCode = urlParams.get('code')
    if (stravaCode) {
      window.history.replaceState({}, document.title, '/')
      recupererTokenStrava(stravaCode)
    }
  } else {
    document.getElementById('login-page').style.display = 'flex'
    document.getElementById('app-page').style.display = 'none'
  }
}

verifierSession()


async function seDeconnecter() {
  await db.auth.signOut()
  document.getElementById('app-page').style.display = 'none'
  document.getElementById('login-page').style.display = 'flex'
}

function afficherRegister() {
  const form = document.getElementById('register-form')
  form.style.display = form.style.display === 'none' ? 'block' : 'none'
}

async function sInscrire() {
  const email = document.getElementById('register-email').value.trim()
  const password = document.getElementById('register-password').value.trim()

  if (!email || !password) return

  const { error } = await db.auth.signUp({ email, password })

  if (error) {
    document.getElementById('register-error').style.display = 'block'
    return
  }

  document.getElementById('register-success').style.display = 'block'
  document.getElementById('register-error').style.display = 'none'
}

async function modifierKm(id, kmActuel) {
  const nouveau = prompt('Nouveaux km ce mois :', kmActuel)
  if (nouveau === null) return

  const { error } = await db
    .from('membres')
    .update({ km_mois: parseInt(nouveau) })
    .eq('id', id)

  if (error) { console.error(error); return }
  chargerMembres()
  chargerClassement()
}

async function supprimerMembre(id) {
  if (!confirm('Supprimer ce membre ?')) return

  const { error } = await db
    .from('membres')
    .delete()
    .eq('id', id)

  if (error) { console.error(error); return }
  chargerMembres()
  chargerClassement()
}

function afficherFormulaireEvenement() {
  const form = document.getElementById('form-evenement')
  form.style.display = form.style.display === 'none' ? 'block' : 'none'
}

async function sauvegarderEvenement() {
  const nom = document.getElementById('evt-nom').value.trim()
  const type = document.getElementById('evt-type').value
  const date = document.getElementById('evt-date').value
  const lieu = document.getElementById('evt-lieu').value.trim()
  const distance = document.getElementById('evt-distance').value

  if (!nom || !date) {
    alert('Le nom et la date sont obligatoires')
    return
  }

  const { error } = await db
    .from('evenements')
    .insert([{ nom, type, date, lieu, distance_km: parseFloat(distance) || null }])

  if (error) { console.error(error); return }

  document.getElementById('evt-nom').value = ''
  document.getElementById('evt-date').value = ''
  document.getElementById('evt-lieu').value = ''
  document.getElementById('evt-distance').value = ''
  document.getElementById('form-evenement').style.display = 'none'

  chargerEvenements()
}

async function supprimerEvenement(id) {
  if (!confirm('Supprimer cet événement ?')) return

  const { error } = await db
    .from('evenements')
    .delete()
    .eq('id', id)

  if (error) { console.error(error); return }
  chargerEvenements()
}

function afficherFormulaireParcours() {
  const form = document.getElementById('form-parcours')
  form.style.display = form.style.display === 'none' ? 'block' : 'none'
}

async function sauvegarderParcours() {
  const nom = document.getElementById('par-nom').value.trim()
  const date = document.getElementById('par-date').value
  const distance = document.getElementById('par-distance').value
  const denivele = document.getElementById('par-denivele').value
  const duree = document.getElementById('par-duree').value

  if (!nom || !date) {
    alert('Le nom et la date sont obligatoires')
    return
  }

  const { error } = await db
    .from('parcours')
    .insert([{
      nom,
      date_sortie: date,
      distance_km: parseFloat(distance) || null,
      denivele_m: parseInt(denivele) || null,
      duree_min: parseInt(duree) || null
    }])

  if (error) { console.error(error); return }

  document.getElementById('par-nom').value = ''
  document.getElementById('par-date').value = ''
  document.getElementById('par-distance').value = ''
  document.getElementById('par-denivele').value = ''
  document.getElementById('par-duree').value = ''
  document.getElementById('form-parcours').style.display = 'none'

  chargerParcours()
}

async function supprimerParcours(id) {
  if (!confirm('Supprimer ce parcours ?')) return

  const { error } = await db
    .from('parcours')
    .delete()
    .eq('id', id)

  if (error) { console.error(error); return }
  chargerParcours()
}

async function modifierPoints(id, pointsActuels) {
  const nouveau = prompt('Nouveaux points :', pointsActuels)
  if (nouveau === null) return

  const { error } = await db
    .from('membres')
    .update({ points: parseInt(nouveau) })
    .eq('id', id)

  if (error) { console.error(error); return }
  chargerMembres()
  chargerClassement()
}

async function chargerClassementPoints() {
  const { data, error } = await db
    .from('membres')
    .select('nom, role, points')
    .order('points', { ascending: false })

  if (error) { console.error(error); return }

  const liste = document.querySelector('#tab-pts .member-list')
  liste.innerHTML = ''

  const medailles = ['🥇','🥈','🥉']
  const badges = ['','silver','bronze','other','other','other']

  data.forEach((membre, index) => {
    const badge = badges[index] || 'other'
    const medaille = medailles[index] || (index + 1)

    const div = document.createElement('div')
    div.className = 'member-row'
    div.innerHTML = `
      <div class="rank-badge ${badge}" style="width:28px;height:28px;font-size:13px">${medaille}</div>
      <div class="member-info">
        <div class="member-name">${membre.nom}</div>
        <div class="member-role">${membre.role || ''}</div>
      </div>
      <div class="member-km">${membre.points} pts</div>
    `
    liste.appendChild(div)
  })
}

chargerClassementPoints()

async function chargerDashboard() {
  const maintenant = new Date()
  const debut = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1).toISOString().split('T')[0]
  const fin = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0).toISOString().split('T')[0]

  const { data: membres } = await db
    .from('membres')
    .select('km_mois')  
    .eq('actif', true)

  const { data: evenements } = await db
    .from('evenements')
    .select('type, date')
    .gte('date', debut)
    .lte('date', fin)

  const { data: parcours } = await db
    .from('parcours')
    .select('distance_km')

  const totalKm = membres ? membres.reduce((sum, m) => sum + (m.km_mois || 0), 0) : 0
  const totalMembres = membres ? membres.length : 0
  const coursesAvenir = evenements ? evenements.filter(e => e.type === 'course' && e.date >= new Date().toISOString().split('T')[0]).length : 0
  const totalParcours = parcours ? parcours.length : 0

  document.getElementById('stat-km').textContent = totalKm.toLocaleString()
  document.getElementById('stat-courses').textContent = coursesAvenir
  document.getElementById('stat-membres').textContent = totalMembres
  document.getElementById('stat-parcours').textContent = totalParcours
}

chargerDashboard()

async function afficherProfil() {
  const { data } = await db.auth.getSession()
  if (data.session) {
    const email = data.session.user.email
    document.getElementById('user-email').textContent = email
  }
}

function filtrerMembres(texte) {
  const rows = document.querySelectorAll('#member-list .member-row')
  rows.forEach(row => {
    const nom = row.querySelector('.member-name').textContent.toLowerCase()
    row.style.display = nom.includes(texte.toLowerCase()) ? 'flex' : 'none'
  })
}

function uploaderPhoto(membreId) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const nomFichier = `${membreId}.jpg`

    const { error: uploadError } = await db.storage
      .from('photos')
      .upload(nomFichier, file, { upsert: true, contentType: file.type })

    if (uploadError) { console.error(uploadError); return }

    const { data } = db.storage
      .from('photos')
      .getPublicUrl(nomFichier)

    const photoUrl = `${data.publicUrl}?t=${Date.now()}`

    const { error } = await db
      .from('membres')
      .update({ photo_url: photoUrl })
      .eq('id', membreId)

    if (error) { console.error(error); return }
    chargerMembres()
  }
  input.click()
}


async function chargerGraphique() {
  const { data, error } = await db
    .from('membres')
    .select('nom, km_mois')
    .order('km_mois', { ascending: false })

  if (error) { console.error(error); return }

  const noms = data.map(m => m.nom.split(' ')[0])
  const kms = data.map(m => m.km_mois)
  const couleurs = ['#e8ff47','#4f9eff','#ff6b35','#22d3a0','#9ca3af','#7f77dd']

  if (window.chartProgression) window.chartProgression.destroy()

  window.chartProgression = new Chart(document.getElementById('chart-progression'), {
    type: 'bar',
    data: {
      labels: noms,
      datasets: [{
        label: 'Km ce mois',
        data: kms,
        backgroundColor: couleurs.slice(0, kms.length),
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#6b7280' }, grid: { color: '#ffffff08' } },
        y: { ticks: { color: '#6b7280' }, grid: { color: '#ffffff08' } }
      }
    }
  })
}

function connecterStrava() {
  const url = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${STRAVA_REDIRECT_URI}&approval_prompt=force&scope=activity:read_all`
  window.location.href = url
}

async function recupererTokenStrava(code) {
  const { data, error } = await db.functions.invoke('strava-auth', {
    body: { code }
  })

  if (error) { console.error(error); return }

  localStorage.setItem('strava_token', data.access_token)
  localStorage.setItem('strava_athlete', JSON.stringify(data.athlete))

  alert(`Strava connecté ! Bienvenue ${data.athlete.firstname} ${data.athlete.lastname}`)

  await synchroniserActivitesStrava(data.access_token)
}

async function synchroniserActivitesStrava(token) {
  const response = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=10', {
    headers: { 'Authorization': `Bearer ${token}` }
  })

  const activites = await response.json()

  for (const activite of activites) {
    if (activite.type !== 'Ride') continue

    await db.from('parcours').insert([{
      nom: activite.name,
      distance_km: Math.round(activite.distance / 100) / 10,
      denivele_m: Math.round(activite.total_elevation_gain),
      duree_min: Math.round(activite.moving_time / 60),
      date_sortie: activite.start_date.split('T')[0]
    }])
  }

  chargerParcours()
  alert('Activités Strava importées !')
}

async function importerMembresClub() {
  const token = localStorage.getItem('strava_token')
  if (!token) {
    alert('Connectez d\'abord Strava dans la sidebar !')
    return
  }

  const response = await fetch('https://www.strava.com/api/v3/clubs/940123/members?per_page=50', {
    headers: { 'Authorization': `Bearer ${token}` }
  })

  if (!response.ok) {
    alert('Erreur Strava — vérifiez que vous êtes connecté à Strava')
    return
  }

  const athletes = await response.json()

  let importes = 0
  for (const athlete of athletes) {
    const nom = `${athlete.firstname} ${athlete.lastname}`

    const { data: existants } = await db
    .from('membres')
    .select('id')
    .eq('nom', nom)

    if (existants && existants.length > 0) continue

    await db.from('membres').insert([{
    nom: nom,
    role: 'Équipier',
    specialite: 'Cycliste',
    km_mois: 0,
    points: 0,
    categorie: 'Elite'
    }])
    importes++
  }

  alert(`${importes} nouveaux membres importés depuis Strava !`)
  chargerMembres()
  chargerClassement()
  chargerClassementPoints()
}

async function synchroniserKmMembres() {
  const token = localStorage.getItem('strava_token')
  if (!token) {
    alert('Connectez d\'abord Strava dans la sidebar !')
    return
  }

  let page = 1
  let toutesActivites = []
  let continuer = true

  while (continuer) {
    const response = await fetch(`https://www.strava.com/api/v3/clubs/940123/activities?per_page=100&page=${page}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!response.ok) {
      alert('Erreur Strava — vérifiez votre connexion')
      return
    }

    const activites = await response.json()

    if (activites.length === 0) {
      continuer = false
    } else {
      toutesActivites = toutesActivites.concat(activites)
      page++
    }

    if (activites.length < 100) continuer = false
  }

  const kmParMembre = {}
  for (const activite of toutesActivites) {
    if (activite.type !== 'Ride') continue
    const nom = `${activite.athlete.firstname} ${activite.athlete.lastname}`
    if (!kmParMembre[nom]) kmParMembre[nom] = 0
    kmParMembre[nom] += Math.round(activite.distance / 100) / 10
  }

  let mis_a_jour = 0
  for (const [nom, km] of Object.entries(kmParMembre)) {
    const { data: membre } = await db
      .from('membres')
      .select('id')
      .eq('nom', nom)

    if (!membre || membre.length === 0) continue

    await db
      .from('membres')
      .update({ km_mois: Math.round(km) })
      .eq('id', membre[0].id)

    mis_a_jour++
  }

  alert(`${mis_a_jour} membres mis à jour depuis Strava !\n${toutesActivites.length} dernières activités du club analysées.`) 
  chargerMembres()
  chargerClassement()
  chargerDashboard()
}

async function afficherStatsStrava() {
  const token = localStorage.getItem('strava_token')
  if (!token) return

  const response = await fetch('https://www.strava.com/api/v3/clubs/940123/activities?per_page=100', {
    headers: { 'Authorization': `Bearer ${token}` }
  })

  if (!response.ok) return

  const activites = await response.json()

  const rides = activites.filter(a => a.type === 'Ride')
  const totalKm = Math.round(rides.reduce((sum, a) => sum + a.distance / 1000, 0))
  const totalDenivele = Math.round(rides.reduce((sum, a) => sum + a.total_elevation_gain, 0))
  const totalSorties = rides.length
  const membres = new Set(rides.map(a => `${a.athlete.firstname} ${a.athlete.lastname}`)).size

  document.getElementById('strava-stats').innerHTML = `
    <div style="background:#151820;border:1px solid #fc4c0240;border-radius:12px;padding:1rem;margin-bottom:1.5rem">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <span style="color:#fc4c02;font-size:16px">🚴</span>
        <span style="font-weight:600;font-size:14px">Stats club KMC — 100 dernières activités</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
        <div style="text-align:center">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:24px;color:#fc4c02">${totalKm.toLocaleString()}</div>
          <div style="font-size:11px;color:#6b7280">km total</div>
        </div>
        <div style="text-align:center">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:24px;color:#fc4c02">${totalDenivele.toLocaleString()}</div>
          <div style="font-size:11px;color:#6b7280">m dénivelé</div>
        </div>
        <div style="text-align:center">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:24px;color:#fc4c02">${totalSorties}</div>
          <div style="font-size:11px;color:#6b7280">sorties</div>
        </div>
        <div style="text-align:center">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:24px;color:#fc4c02">${membres}</div>
          <div style="font-size:11px;color:#6b7280">membres actifs</div>
        </div>
      </div>
    </div>
  `
}

function afficherForgotPassword() {
  const form = document.getElementById('forgot-form')
  form.style.display = form.style.display === 'none' ? 'block' : 'none'
  document.getElementById('register-form').style.display = 'none'
}

async function envoyerResetPassword() {
  const email = document.getElementById('forgot-email').value.trim()
  if (!email) return

  const { error } = await db.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://kmc-team.vercel.app'
  })

  if (error) {
    document.getElementById('forgot-error').style.display = 'block'
    document.getElementById('forgot-success').style.display = 'none'
    return
  }

  document.getElementById('forgot-success').style.display = 'block'
  document.getElementById('forgot-error').style.display = 'none'
}

async function resetPassword() {
  const newPassword = document.getElementById('new-password').value.trim()
  const confirmPassword = document.getElementById('confirm-password').value.trim()

  if (newPassword !== confirmPassword) {
    document.getElementById('reset-error').style.display = 'block'
    return
  }

  const { error } = await db.auth.updateUser({ password: newPassword })

  if (error) {
    document.getElementById('reset-error').textContent = 'Erreur — réessayez.'
    document.getElementById('reset-error').style.display = 'block'
    return
  }

  document.getElementById('reset-success').style.display = 'block'
  document.getElementById('reset-error').style.display = 'none'
  setTimeout(() => {
    document.getElementById('reset-page').style.display = 'none'
    document.getElementById('login-page').style.display = 'flex'
  }, 2000)
}

async function changerEmail() {
  const email = document.getElementById('profil-email').value.trim()
  if (!email) return

  const { error } = await db.auth.updateUser({ email })

  if (error) {
    document.getElementById('email-error').style.display = 'block'
    document.getElementById('email-success').style.display = 'none'
    return
  }

  document.getElementById('email-success').style.display = 'block'
  document.getElementById('email-error').style.display = 'none'
  document.getElementById('profil-email').value = ''
}

async function changerMotDePasse() {
  const password = document.getElementById('profil-password').value.trim()
  const confirm = document.getElementById('profil-password-confirm').value.trim()

  if (!password) return

  if (password !== confirm) {
    document.getElementById('password-error').textContent = 'Les mots de passe ne correspondent pas.'
    document.getElementById('password-error').style.display = 'block'
    return
  }

  const { error } = await db.auth.updateUser({ password })

  if (error) {
    document.getElementById('password-error').textContent = 'Erreur — réessayez.'
    document.getElementById('password-error').style.display = 'block'
    document.getElementById('password-success').style.display = 'none'
    return
  }

  document.getElementById('password-success').style.display = 'block'
  document.getElementById('password-error').style.display = 'none'
  document.getElementById('profil-password').value = ''
  document.getElementById('profil-password-confirm').value = ''
}

let moisActuel = new Date().getMonth()
let anneeActuelle = new Date().getFullYear()

function changerMois(direction) {
  moisActuel += direction
  if (moisActuel > 11) { moisActuel = 0; anneeActuelle++ }
  if (moisActuel < 0) { moisActuel = 11; anneeActuelle-- }
  construireCalendrier()
  chargerEvenements()
}

async function construireCalendrier() {
  const moisNoms = ['JANVIER','FÉVRIER','MARS','AVRIL','MAI','JUIN','JUILLET','AOÛT','SEPTEMBRE','OCTOBRE','NOVEMBRE','DÉCEMBRE']

  document.getElementById('calendrier-titre').innerHTML = `${moisNoms[moisActuel]} <span>${anneeActuelle}</span>`
  const calMoisTitre = document.getElementById('cal-mois-titre')
  if (calMoisTitre) calMoisTitre.textContent = `${moisNoms[moisActuel]} ${anneeActuelle}`

  const premierJour = new Date(anneeActuelle, moisActuel, 1).getDay()
  const decalage = premierJour === 0 ? 6 : premierJour - 1
  const nbJours = new Date(anneeActuelle, moisActuel + 1, 0).getDate()
  const aujourdhui = new Date()

  const grid = document.getElementById('cal-grid')
  const headers = grid.querySelectorAll('.cal-header')
  grid.innerHTML = ''
  headers.forEach(h => grid.appendChild(h.cloneNode(true)))

  for (let i = 0; i < decalage; i++) {
    const vide = document.createElement('div')
    grid.appendChild(vide)
  }

  const { data: evenements } = await db
    .from('evenements')
    .select('date, type')
    .gte('date', `${anneeActuelle}-${String(moisActuel+1).padStart(2,'0')}-01`)
    .lte('date', `${anneeActuelle}-${String(moisActuel+1).padStart(2,'0')}-${String(nbJours).padStart(2,'0')}`)

  for (let j = 1; j <= nbJours; j++) {
    const div = document.createElement('div')
    div.className = 'cal-day'
    div.textContent = j

    const dateStr = `${anneeActuelle}-${String(moisActuel+1).padStart(2,'0')}-${String(j).padStart(2,'0')}`
    const estAujourdhui = j === aujourdhui.getDate() && moisActuel === aujourdhui.getMonth() && anneeActuelle === aujourdhui.getFullYear()

    if (estAujourdhui) div.classList.add('today')

    if (evenements) {
      const evtDuJour = evenements.filter(e => e.date === dateStr)
      if (evtDuJour.length > 0) {
        const type = evtDuJour[0].type
        div.classList.add(type === 'course' ? 'has-event' : 'has-event2')
      }
    }

    grid.appendChild(div)
  }
}

async function exporterPDF() {
  const { jsPDF } = window.jspdf
  const doc = new jsPDF()

  const aujourd = new Date().toLocaleDateString('fr-FR')
  const moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

  const canvas = document.createElement('canvas')
  canvas.width = 80
  canvas.height = 80
  const ctx = canvas.getContext('2d')
  const img = new Image()
  img.src = 'logo.png'

  await new Promise(resolve => {
    img.onload = () => {
      try {
        ctx.beginPath()
        ctx.arc(40, 40, 40, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(img, 0, 0, 80, 80)
      } catch(e) {}
      resolve()
    }
    img.onerror = resolve
    img.crossOrigin = 'anonymous'
  })

  let logoData = null
  try { logoData = canvas.toDataURL('image/png') } catch(e) {}

  doc.setFillColor(13, 15, 20)
  doc.rect(0, 0, 210, 45, 'F')

  if (logoData) { try { doc.addImage(logoData, 'PNG', 14, 5, 30, 30) } catch(e) {} }

  doc.setTextColor(30, 120, 220)
  doc.setFontSize(22)
  doc.setFont('Amiri', 'bold')
  doc.text('KMC TEAM MANAGER', 50, 18)
  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128)
  doc.text(`Rapport du ${aujourd}`, 50, 28)
  doc.setTextColor(30, 120, 220)
  doc.text('KMC — Khemis Miliana Cycling', 50, 36)

  doc.setTextColor(30, 120, 220)
  doc.setFontSize(13)
  doc.setFont('Amiri', 'bold')
  doc.text('STATISTIQUES DU CLUB', 14, 58)
  doc.setDrawColor(30, 120, 220)
  doc.line(14, 61, 196, 61)

  const kmTotal = document.getElementById('stat-km').textContent
  const membres = document.getElementById('stat-membres').textContent
  const courses = document.getElementById('stat-courses').textContent
  const parcours = document.getElementById('stat-parcours').textContent

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(11)
  doc.setFont('Amiri', 'normal')
  doc.text(`Km ce mois : ${kmTotal} km`, 14, 73)
  doc.text(`Membres actifs : ${membres}`, 14, 83)
  doc.text(`Courses à venir : ${courses}`, 110, 73)
  doc.text(`Parcours enregistrés : ${parcours}`, 110, 83)

  doc.setTextColor(30, 120, 220)
  doc.setFontSize(13)
  doc.setFont('Amiri', 'bold')
  doc.text('CLASSEMENT — KM CE MOIS', 14, 100)
  doc.setDrawColor(30, 120, 220)
  doc.line(14, 103, 196, 103)

  const { data: membres_data } = await db
    .from('membres')
    .select('nom, role, km_mois, points, categorie, num_licence, date_naissance')
    .order('km_mois', { ascending: false })

  doc.setFillColor(30, 120, 220)
  doc.rect(14, 106, 182, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('Amiri', 'bold')
  doc.setFontSize(10)
  doc.text('Rang', 16, 112)
  doc.text('Nom', 35, 112)
  doc.text('Date naissance', 95, 112)
  doc.text('Catégorie', 145, 112)
  doc.text('Licence', 175, 112)

  doc.setFont('Amiri', 'normal')
  let y = 122
  membres_data.forEach((m, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(235, 242, 255)
      doc.rect(14, y - 5, 182, 8, 'F')
    }
    const dob = m.date_naissance ? new Date(m.date_naissance).toLocaleDateString('fr-FR') : ''
    doc.setTextColor(0, 0, 0)
    doc.text(`${i + 1}`, 16, y)
    doc.text((m.nom || '').substring(0, 22), 35, y)
    doc.text(dob, 95, y)
    doc.text(m.categorie || '', 145, y)
    doc.text(m.num_licence || '', 175, y)
    y += 10
    if (y > 260) { doc.addPage(); y = 20 }
  })

  const { data: evenements_data } = await db
    .from('evenements')
    .select('*')
    .order('date', { ascending: true })

  if (evenements_data && evenements_data.length > 0) {
    if (y > 220) { doc.addPage(); y = 20 }
    doc.setTextColor(30, 120, 220)
    doc.setFontSize(13)
    doc.setFont('Amiri', 'bold')
    doc.text('ÉVÉNEMENTS', 14, y + 15)
    doc.setDrawColor(30, 120, 220)
    doc.line(14, y + 18, 196, y + 18)
    y += 28

    doc.setFont('Amiri', 'normal')
    doc.setFontSize(10)
    evenements_data.forEach(evt => {
      const date = new Date(evt.date).toLocaleDateString('fr-FR')
      doc.setTextColor(0, 0, 0)
      doc.text(`${date} — ${evt.nom} (${evt.type}) — ${evt.lieu || ''} — ${evt.distance_km || ''} km`, 14, y)
      y += 8
      if (y > 270) { doc.addPage(); y = 20 }
    })
  }

  doc.setFillColor(13, 15, 20)
  doc.rect(0, 285, 210, 12, 'F')
  doc.setTextColor(30, 120, 220)
  doc.setFontSize(8)
  doc.text('KMC — Khemis Miliana Cycling Team Manager', 14, 292)
  doc.text(`Généré le ${aujourd}`, 160, 292)

  doc.save(`KMC_Rapport_${aujourd.replace(/\//g, '-')}.pdf`)
}

document.addEventListener('DOMContentLoaded', () => {
  const btnExport = document.getElementById('btn-export')
  if (btnExport) btnExport.onclick = exporterPDF
})

let modalPhotoFile = null

function ouvrirModalAjout() {
  document.getElementById('modal-titre').textContent = 'NOUVEAU MEMBRE'
  document.getElementById('modal-nom').value = ''
  document.getElementById('modal-role').value = ''
  document.getElementById('modal-specialite').value = ''
  document.getElementById('modal-dob').value = ''
  document.getElementById('modal-categorie').value = ''
  document.getElementById('modal-licence').value = ''
  document.getElementById('modal-membre-id').value = ''
  document.getElementById('modal-avatar-preview').innerHTML = '📷'
  document.getElementById('modal-error').style.display = 'none'
  modalPhotoFile = null
  document.getElementById('modal-membre').style.display = 'flex'
}

function ouvrirModalModif(id, nom, role, specialite, dob, categorie, km, photoUrl, licence) {
  document.getElementById('modal-titre').textContent = 'MODIFIER MEMBRE'
  document.getElementById('modal-nom').value = nom || ''
  document.getElementById('modal-role').value = role || ''
  document.getElementById('modal-specialite').value = specialite || ''
  document.getElementById('modal-dob').value = dob || ''
  document.getElementById('modal-categorie').value = categorie || ''
  document.getElementById('modal-licence').value = licence || ''
  document.getElementById('modal-membre-id').value = id
  document.getElementById('modal-error').style.display = 'none'
  modalPhotoFile = null
  const preview = document.getElementById('modal-avatar-preview')
  if (photoUrl) {
    preview.innerHTML = `<img src="${photoUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
  } else {
    const initiales = nom ? nom.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : '?'
    preview.innerHTML = initiales
  }
  document.getElementById('modal-membre').style.display = 'flex'
}

function fermerModal() {
  document.getElementById('modal-membre').style.display = 'none'
  modalPhotoFile = null
}

function previewPhoto(input) {
  if (!input.files[0]) return
  modalPhotoFile = input.files[0]
  const reader = new FileReader()
  reader.onload = e => {
    document.getElementById('modal-avatar-preview').innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
  }
  reader.readAsDataURL(modalPhotoFile)
}

async function sauvegarderModal() {
  const id = document.getElementById('modal-membre-id').value
  const nom = document.getElementById('modal-nom').value.trim()
  const role = document.getElementById('modal-role').value.trim()
  const specialite = document.getElementById('modal-specialite').value.trim()
  const dob = document.getElementById('modal-dob').value
  const categorie = document.getElementById('modal-categorie').value
  const licence = document.getElementById('modal-licence').value.trim()

  if (!nom) {
    document.getElementById('modal-error').style.display = 'block'
    return
  }

  let photoUrl = null

  if (modalPhotoFile) {
    const nomFichier = id ? `${id}.jpg` : `${Date.now()}.jpg`
    const { error: uploadError } = await db.storage
      .from('photos')
      .upload(nomFichier, modalPhotoFile, { upsert: true, contentType: modalPhotoFile.type })
    if (!uploadError) {
      const { data } = db.storage.from('photos').getPublicUrl(nomFichier)
      photoUrl = `${data.publicUrl}?t=${Date.now()}`
    }
  }

  const payload = {
    nom, role: role || 'Equipier',
    specialite: specialite || null,
    date_naissance: dob || null,
    categorie: categorie || null,
    num_licence: licence || null
  }
  if (photoUrl) payload.photo_url = photoUrl

  if (id) {
    const { error } = await db.from('membres').update(payload).eq('id', id)
    if (error) { console.error(error); return }
  } else {
    const { error } = await db.from('membres').insert([payload])
    if (error) { console.error(error); return }
  }

  fermerModal()
  chargerMembres()
  chargerClassement()
  chargerClassementPoints()
  chargerDashboard()
  chargerGraphique()
}

async function chargerPoliceAmiri() {
  if (window.amiriLoaded) return
  try {
    const response = await fetch('https://fonts.gstatic.com/s/amiri/v27/J7aRnpd8CGxBHqUpvrIw74NL.ttf')
    const buffer = await response.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binary = ''
    bytes.forEach(b => binary += String.fromCharCode(b))
    window.amiriBase64 = btoa(binary)
    window.amiriLoaded = true
  } catch(e) { console.error('Amiri load error', e) }
}

async function exporterEngagement() {
  await chargerPoliceAmiri()
  const { jsPDF } = window.jspdf
  const doc = new jsPDF()

  if (window.amiriBase64) {
    doc.addFileToVFS('Amiri-Regular.ttf', window.amiriBase64)
    doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal')
    doc.addFont('Amiri-Regular.ttf', 'Amiri', 'bold')
  }

  const competition = document.getElementById('eng-competition').value.trim() || 'Compétition'
  const nature = document.getElementById('eng-nature').value.trim() || ''
  const date = document.getElementById('eng-date').value
  const lieu = document.getElementById('eng-lieu').value.trim()
  const organisateur = document.getElementById('eng-organisateur').value.trim() || 'FAC/DJSL/LAC'
  const entraineur = document.getElementById('eng-entraineur').value.trim()
  const categorie = document.getElementById('eng-categorie').value
  const dateAff = date ? new Date(date).toLocaleDateString('fr-FR') : ''

  const loadLogo = (src) => new Promise(resolve => {
    const canvas = document.createElement('canvas')
    canvas.width = 80; canvas.height = 80
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        ctx.beginPath()
        ctx.arc(40, 40, 40, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(img, 0, 0, 80, 80)
      } catch(e) {}
      try { resolve(canvas.toDataURL('image/png')) } catch(e) { resolve(null) }
    }
    img.onerror = () => resolve(null)
    img.src = src
  })

  const logo1 = await loadLogo('logo.png')
  if (logo1) { try { doc.addImage(logo1, 'PNG', 10, 6, 28, 28) } catch(e) {} }

  // Texte français en haut au centre
  doc.setTextColor(30, 120, 220)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Club KMC - Khemis Miliana Cycling', 105, 12, { align: 'center' })
  doc.text('Wilaya Ain Defla - Algerie', 105, 19, { align: 'center' })

  // Texte arabe via canvas
  const arabicCanvas = document.createElement('canvas')
  arabicCanvas.width = 500
  arabicCanvas.height = 32
  const arabicCtx = arabicCanvas.getContext('2d')
  arabicCtx.fillStyle = '#1e78dc'
  arabicCtx.font = 'bold 20px Arial'
  arabicCtx.textAlign = 'center'
  arabicCtx.direction = 'rtl'
  arabicCtx.fillText('النادي الرياضي خميس مليانة للدراجات الهوائية', 250, 24)
  let arabicData = null
  try { arabicData = arabicCanvas.toDataURL('image/png') } catch(e) {}
  if (arabicData) { try { doc.addImage(arabicData, 'PNG', 50, 24, 110, 8) } catch(e) {} }

  // Titre ENGAGEMENT
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('ENGAGEMENT', 105, 46, { align: 'center' })

  // Informations compétition
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`Competition : ${competition}`, 14, 58)
  doc.setFont('helvetica', 'normal')
  doc.text(`Date : ${dateAff}`, 14, 67)
  doc.text(`Lieu : ${lieu}`, 110, 67)
  doc.setFont('helvetica', 'bold')
  doc.text(`Organisateurs : ${organisateur}`, 14, 76)
  doc.text(`Nature de l'evenement : ${nature}`, 14, 85)
  doc.text('Club : K.M.C KHEMIS MILIANA CYCLING', 14, 94)
  doc.text('Wilaya Ain Defla', 116, 94)
  if (categorie) doc.text(`Categorie : ${categorie.toUpperCase()}`, 160, 94)
  doc.text(`Entraineur : ${entraineur}`, 14, 103)
  doc.setFont('helvetica', 'bold')
  doc.text('LISTE DES COUREURS', 14, 113)

  // Requête membres
  let query = db.from('membres').select('nom, num_licence, date_naissance, categorie')
  if (categorie) query = query.eq('categorie', categorie)
  query = query.order('nom', { ascending: true })
  const { data: coureurs } = await query

  const rowH = 10
  let y = 118

  const colDos = 14
  const colNom = 30
  const colLic = 118
  const colDob = 150
  const colEm = 178
  const endCol = 196

  const drawRow = (yy) => {
    doc.rect(colDos, yy, endCol - colDos, rowH)
    doc.line(colNom, yy, colNom, yy + rowH)
    doc.line(colLic, yy, colLic, yy + rowH)
    doc.line(colDob, yy, colDob, yy + rowH)
    doc.line(colEm, yy, colEm, yy + rowH)
  }

  // Header tableau
  doc.setFillColor(200, 200, 200)
  doc.rect(colDos, y, endCol - colDos, rowH, 'F')
  doc.setDrawColor(0)
  doc.setLineWidth(0.3)
  drawRow(y)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('N Dos', colDos + 1, y + 7)
  doc.text('Nom et Prenoms', colNom + 1, y + 7)
  doc.text('N Licence', colLic + 1, y + 7)
  doc.text('Date naissance', colDob + 1, y + 7)
  doc.text('Emargement', colEm + 1, y + 7)
  y += rowH

  // Lignes membres
  doc.setFont('helvetica', 'normal')
  coureurs.forEach((c) => {
    const dob = c.date_naissance ? new Date(c.date_naissance).toLocaleDateString('fr-FR') : ''
    drawRow(y)
    doc.text((c.nom || '').substring(0, 22), colNom + 1, y + 7)
    doc.text(c.num_licence || '', colLic + 1, y + 7)
    doc.text(dob, colDob + 1, y + 7)
    y += rowH
    if (y > 265) { doc.addPage(); y = 20 }
  })

  // Signature
  y += 15
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('President du club', 150, y)

  // Pied de page
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text('KMC.cyclisme@gmail.com', 14, 287)
  doc.text('Tel : 0555099086 - 0659014436 - 0661668666', 105, 287, { align: 'center' })

  // Vider les champs
  document.getElementById('eng-competition').value = ''
  document.getElementById('eng-nature').value = ''
  document.getElementById('eng-date').value = ''
  document.getElementById('eng-lieu').value = ''
  document.getElementById('eng-organisateur').value = ''
  document.getElementById('eng-entraineur').value = ''
  document.getElementById('eng-categorie').value = ''

  doc.save(`KMC_Engagement_${categorie || 'Tous'}_${dateAff.replace(/\//g,'-') || 'date'}.pdf`)
}