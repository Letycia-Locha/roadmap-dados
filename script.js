// Inicializa Supabase e gerencia progresso do roadmap
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', async () => {
  const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
  const bar = document.getElementById('progress-bar');
  const text = document.getElementById('progress-text');
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');

  // Garante que cada checkbox possui um data-id sequencial
  checkboxes.forEach((cb, idx) => {
    if (!cb.dataset.id) cb.dataset.id = idx + 1;
  });

  async function updateBar() {
    const total = checkboxes.length;
    let done = 0;
    checkboxes.forEach(cb => { if (cb.checked) done++; });
    const percent = total ? (done / total) * 100 : 0;
    bar.style.width = percent + '%';
    text.textContent = Math.round(percent) + '%';
  }

  async function loadProgress(userId) {
    try {
      const { data, error } = await client
        .from('progress')
        .select('checkbox_id, checked')
        .eq('user_id', userId);
      if (error) throw error;
      checkboxes.forEach(cb => { cb.checked = false; });
      data.forEach(row => {
        const cb = document.querySelector(`input[data-id="${row.checkbox_id}"]`);
        if (cb) cb.checked = row.checked;
      });
    } catch (err) {
      console.error('Falha ao carregar progresso', err);
    }
    await updateBar();
  }

  async function saveProgress(checkbox) {
    const session = await client.auth.getSession();
    const user = session.data.session?.user;
    if (!user) return;
    const row = {
      user_id: user.id,
      checkbox_id: parseInt(checkbox.dataset.id, 10),
      checked: checkbox.checked
    };
    try {
      const { error } = await client.from('progress').upsert(row);
      if (error) throw error;
    } catch (err) {
      console.error('Falha ao salvar progresso', err);
    }
  }

  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    } catch (err) {
      alert('Erro de conexão');
    }
  });

  logoutBtn.addEventListener('click', async () => {
    await client.auth.signOut();
  });

  client.auth.onAuthStateChange(async (_, session) => {
    if (session?.user) {
      loginForm.style.display = 'none';
      logoutBtn.style.display = 'block';
      await loadProgress(session.user.id);
    } else {
      loginForm.style.display = 'block';
      logoutBtn.style.display = 'none';
      checkboxes.forEach(cb => { cb.checked = false; });
      await updateBar();
    }
  });

  checkboxes.forEach(cb => {
    cb.addEventListener('change', async () => {
      await saveProgress(cb);
      await updateBar();
    });
  });

  const { data: { session } } = await client.auth.getSession();
  if (session?.user) {
    loginForm.style.display = 'none';
    logoutBtn.style.display = 'block';
    await loadProgress(session.user.id);
  } else {
    updateBar();
  }
});
