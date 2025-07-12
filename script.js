let elements;

function init() {
  elements = {
    checkboxes: document.querySelectorAll('tbody input[type="checkbox"]'),
    progressBar: document.getElementById('progress-bar'),
    progressText: document.getElementById('progress-text'),
    loginForm: document.getElementById('login-form'),
    logoutBtn: document.getElementById('logout-btn'),
    authMessage: document.getElementById('auth-message'),
    userEmail: document.getElementById('user-email')
  };

  elements.checkboxes.forEach((cb, idx) => {
    if (!cb.dataset.id) cb.dataset.id = idx + 1;
    cb.addEventListener('change', () => handleCheckboxChange(cb));
  });

  elements.loginForm.addEventListener('submit', handleLogin);
  elements.logoutBtn.addEventListener('click', handleLogout);

  const savedUser = localStorage.getItem('loggedInUser');
  onAuthChange(savedUser);
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  if (email && password) {
    localStorage.setItem('loggedInUser', email);
    event.target.reset();
    onAuthChange(email);
  }
}

function handleLogout() {
  localStorage.removeItem('loggedInUser');
  onAuthChange(null);
}

function onAuthChange(userEmail) {
  if (userEmail) {
    elements.loginForm.style.display = 'none';
    elements.logoutBtn.style.display = 'block';
    elements.authMessage.style.display = 'none';
    elements.userEmail.textContent = `Bem-vindo, ${userEmail}`;
    elements.userEmail.style.display = 'block';
    loadProgress(userEmail);
  } else {
    elements.loginForm.style.display = 'block';
    elements.logoutBtn.style.display = 'none';
    elements.userEmail.style.display = 'none';
    elements.authMessage.style.display = 'block';
    clearCheckboxes();
    updateProgressBar();
  }
}

function clearCheckboxes() {
  elements.checkboxes.forEach(cb => { cb.checked = false; });
}

function handleCheckboxChange(checkbox) {
  saveProgress(checkbox);
  updateProgressBar();
}

function updateProgressBar() {
  const total = elements.checkboxes.length;
  const done = Array.from(elements.checkboxes).filter(cb => cb.checked).length;
  const percent = total ? (done / total) * 100 : 0;
  elements.progressBar.style.width = `${percent}%`;
  elements.progressText.textContent = `${Math.round(percent)}%`;
}

function loadProgress(email) {
  const data = JSON.parse(localStorage.getItem(`progress-${email}`) || '{}');
  clearCheckboxes();
  elements.checkboxes.forEach(cb => {
    if (data[cb.dataset.id]) cb.checked = true;
  });
  updateProgressBar();
}

function saveProgress(checkbox) {
  const email = localStorage.getItem('loggedInUser');
  if (!email) return;
  const data = JSON.parse(localStorage.getItem(`progress-${email}`) || '{}');
  data[checkbox.dataset.id] = checkbox.checked;
  localStorage.setItem(`progress-${email}`, JSON.stringify(data));
}

document.addEventListener('DOMContentLoaded', init);
