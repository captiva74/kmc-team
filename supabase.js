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
    <button onclick="modifierKm('${membre.id}', ${membre.km_mois})" style="background:none;border:1px solid #ffffff20;color:#6b7280;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;margin-left:6px">✏️</button>
    <button onclick="modifierPoints('${membre.id}', ${membre.points})" style="background:none;border:1px solid #e8ff4740;color:#e8ff47;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;margin-left:4px">★</button>
    <button onclick="supprimerMembre('${membre.id}')" style="background:none;border:1px solid #ff6b3540;color:#ff6b35;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;margin-left:4px">🗑️</button>
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
chargerMembres()
chargerEvenements()
chargerClassement()
chargerParcours()
chargerClassementPoints()
chargerDashboard()
afficherProfil()

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