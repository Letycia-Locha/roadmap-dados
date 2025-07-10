// Atualiza barra de progresso conforme checkboxes
function updateProgress() {
p
  const rows = document.querySelectorAll('tbody tr');
  let totalHours = 0;
  let completedHours = 0;
  rows.forEach(row => {
    const hours = parseFloat(row.dataset.hours) || 0;
    totalHours += hours;
    const cb = row.querySelector('input[type="checkbox"]');
    if (cb && cb.checked) {
      completedHours += hours;
    }
  });
  const percent = totalHours ? (completedHours / totalHours) * 100 : 0;
  const progress = document.querySelector('.progress');
  const text = document.querySelector('.progress-text');
  if (progress) {
    progress.style.width = percent + '%';
  }
  if (text) {
    text.textContent = percent.toFixed(1) + '%';
  }

}

document.addEventListener('DOMContentLoaded', () => {
  const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
  checkboxes.forEach(cb => cb.addEventListener('change', updateProgress));
  updateProgress();
});
