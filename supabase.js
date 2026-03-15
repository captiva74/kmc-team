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
        <div class="member-role">${membre.role || ''} · ${membre.specialite || ''}</div>
    </div>
    <div class="member-stat">
        <div class="member-km">${membre.km_mois}</div>
        <div class="member-km-label">km / mois</div>
    </div>
    <div class="rank-badge ${badge}">${indexGlobal + 1}</div>
    <button onclick="modifierMembre('${membre.id}', '${membre.nom}', '${membre.role || ''}', '${membre.specialite || ''}')" style="background:none;border:1px solid #ffffff20;color:#6b7280;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;margin-left:6px">✏️</button>
    <button onclick="modifierKm('${membre.id}', ${membre.km_mois})" style="background:none;border:1px solid #ffffff20;color:#6b7280;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;margin-left:4px">🚴</button>
    <button onclick="modifierPoints('${membre.id}', ${membre.points})" style="background:none;border:1px solid #e8ff4740;color:#e8ff47;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;margin-left:4px">★</button>
    <button onclick="uploaderPhoto('${membre.id}')" style="background:none;border:1px solid #4f9eff40;color:#4f9eff;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;margin-left:4px">📷</button>
    <button onclick="supprimerMembre('${membre.id}')" style="background:none;border:1px solid #ff6b3540;color:#ff6b35;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;margin-left:4px">🗑️</button>
    `
    liste.appendChild(div)
  })

  const pagination = document.getElementById('pagination-membres')
  pagination.innerHTML = ''

  if (totalPages <= 1) return

  const prev = document.createElement('button')
  prev.className = 'btn-ghost'
  prev.textContent = '← Précédent'
  prev.style.cssText = 'font-size:12px;padding:6px 12px;margin-right:8px'
  prev.disabled = page === 1
  prev.style.opacity = page === 1 ? '0.3' : '1'
  prev.onclick = () => afficherPageMembres(page - 1)
  pagination.appendChild(prev)

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button')
    btn.textContent = i
    btn.style.cssText = `font-size:12px;padding:6px 10px;margin-right:4px;border-radius:6px;border:1px solid ${i === page ? 'var(--accent)' : '#ffffff20'};background:${i === page ? 'var(--accent)' : 'none'};color:${i === page ? '#0d0f14' : '#6b7280'};cursor:pointer`
    btn.onclick = () => afficherPageMembres(i)
    pagination.appendChild(btn)
  }

  const next = document.createElement('button')
  next.className = 'btn-ghost'
  next.textContent = 'Suivant →'
  next.style.cssText = 'font-size:12px;padding:6px 12px;margin-left:4px'
  next.disabled = page === totalPages
  next.style.opacity = page === totalPages ? '0.3' : '1'
  next.onclick = () => afficherPageMembres(page + 1)
  pagination.appendChild(next)

  const info = document.createElement('span')
  info.style.cssText = 'font-size:12px;color:#6b7280;margin-left:12px'
  info.textContent = `${total} membres au total`
  pagination.appendChild(info)
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
    chargerClassementPoints()
    chargerDashboard()
    afficherProfil()
    chargerGraphique()
    afficherStatsStrava()

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

async function modifierMembre(id, nom, role, specialite) {
  const nouveauNom = prompt('Nom :', nom)
  if (nouveauNom === null) return

  const nouveauRole = prompt('Rôle :', role)
  if (nouveauRole === null) return

  const nouvelleSpecialite = prompt('Spécialité :', specialite)
  if (nouvelleSpecialite === null) return

  const { error } = await db
    .from('membres')
    .update({
      nom: nouveauNom,
      role: nouveauRole,
      specialite: nouvelleSpecialite
    })
    .eq('id', id)

  if (error) { console.error(error); return }
  chargerMembres()
  chargerClassement()
  chargerClassementPoints()
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
      points: 0
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
