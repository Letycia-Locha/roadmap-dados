// Atualiza a barra de progresso de acordo com os checkboxes marcados
// Devido a restrições de rede, as durações dos cursos não foram obtidas
// automaticamente. Cada curso é considerado de peso igual.
document.addEventListener('DOMContentLoaded', function () {
  const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
  const bar = document.getElementById('progress-bar');
  const text = document.getElementById('progress-text');

  function update() {
    const total = checkboxes.length;
    let done = 0;
    checkboxes.forEach(cb => {
      if (cb.checked) done += 1;
    });
    const percent = total ? (done / total) * 100 : 0;
    bar.style.width = percent + '%';
    text.textContent = Math.round(percent) + '%';
  }

  checkboxes.forEach(cb => cb.addEventListener('change', update));
  update();
});
