// Atualiza barra de progresso conforme checkboxes
function updateProgress() {
  const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
  const total = checkboxes.length;
  const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
  const percent = total ? (checked / total) * 100 : 0;
  const progress = document.querySelector('.progress');
  if (progress) {
    progress.style.width = percent + '%';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
  checkboxes.forEach(cb => cb.addEventListener('change', updateProgress));
  updateProgress();
});
