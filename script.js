const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function init() {
  const elements = {
    checkboxes: document.querySelectorAll('tbody input[type="checkbox"]'),
    progressBar: document.getElementById('progress-bar'),
    progressText: document.getElementById('progress-text'),
    loginForm: document.getElementById('login-form'),
    logoutBtn: document.getElementById('logout-btn'),
    authMessage: document.getElementById('auth-message'),
    userEmail: document.getElementById('user-email')
  };

  elements.checkboxes.forEach((checkbox, idx) => {
    if (!checkbox.dataset.id) checkbox.dataset.id = idx + 1;
    checkbox.addEventListener('change', () => handleCheckboxChange(checkbox, elements));
  });

  elements.loginForm.addEventListener('submit', event => handleLogin(event));
  elements.logoutBtn.addEventListener('click', handleLogout);
  supabaseClient.auth.onAuthStateChange((_evt, session) => onAuthChange(session, elements));

  const { data: { session } } = await supabaseClient.auth.getSession();
  onAuthChange(session, elements);
}

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    alert(error.message);
  } else if (data.session) {
    event.target.reset();
  }
}

async function handleLogout() {
  await supabaseClient.auth.signOut();
}

function onAuthChange(session, el) {
  if (session?.user) {
    el.loginForm.style.display = 'none';
    el.logoutBtn.style.display = 'block';
    el.authMessage.style.display = 'none';
    el.userEmail.textContent = `Bem-vindo, ${session.user.email}`;
    el.userEmail.style.display = 'block';
    loadProgress(session.user.id, el);
  } else {
    el.loginForm.style.display = 'block';
    el.logoutBtn.style.display = 'none';
    el.userEmail.style.display = 'none';
    el.authMessage.style.display = 'block';
    clearCheckboxes(el.checkboxes);
    updateProgressBar(el);
  }
}

function clearCheckboxes(checkboxes) {
  checkboxes.forEach(cb => { cb.checked = false; });
}

async function handleCheckboxChange(checkbox, el) {
  await saveProgress(checkbox);
  updateProgressBar(el);
}

async function updateProgressBar(el) {
  const total = el.checkboxes.length;
  const done = Array.from(el.checkboxes).filter(cb => cb.checked).length;
  const percent = total ? (done / total) * 100 : 0;
  el.progressBar.style.width = `${percent}%`;
  el.progressText.textContent = `${Math.round(percent)}%`;
}

async function loadProgress(userId, el) {
  try {
    const { data, error } = await supabaseClient
      .from('progress')
      .select('checkbox_id, checked')
      .eq('user_id', userId);
    if (error) throw error;
    clearCheckboxes(el.checkboxes);
    data.forEach(({ checkbox_id, checked }) => {
      const cb = document.querySelector(`input[data-id="${checkbox_id}"]`);
      if (cb) cb.checked = checked;
    });
  } catch (err) {
    console.error('Falha ao carregar progresso', err);
  }
  updateProgressBar(el);
}

async function saveProgress(checkbox) {
  const { data: { session } } = await supabaseClient.auth.getSession();
  const user = session?.user;
  if (!user) return;

  const row = {
    user_id: user.id,
    checkbox_id: Number(checkbox.dataset.id),
    checked: checkbox.checked
  };

  const { error } = await supabaseClient.from('progress').upsert(row);
  if (error) {
    console.error('Falha ao salvar progresso', error);
  }
}

document.addEventListener('DOMContentLoaded', init);
