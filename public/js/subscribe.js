const subscriptionForm = document.getElementById('subscription-form');
const subscriptionMessage = document.getElementById('subscription-message');

const popup = document.createElement('div');
popup.className = 'subscription-popup';
popup.setAttribute('aria-hidden', 'true');
popup.innerHTML = `
  <div class="subscription-popup-backdrop"></div>
  <div class="subscription-popup-card" role="alertdialog" aria-modal="true" aria-labelledby="subscription-popup-title">
    <div class="subscription-popup-icon" id="subscription-popup-icon"></div>
    <h3 id="subscription-popup-title"></h3>
    <p id="subscription-popup-text"></p>
    <button type="button" id="subscription-popup-close">Fechar</button>
  </div>
`;
document.body.appendChild(popup);

const popupIcon = popup.querySelector('#subscription-popup-icon');
const popupTitle = popup.querySelector('#subscription-popup-title');
const popupText = popup.querySelector('#subscription-popup-text');
const popupClose = popup.querySelector('#subscription-popup-close');

function showSubscriptionPopup(type, title, message) {
  popup.className = 'subscription-popup ' + type;
  popupIcon.innerHTML = type === 'success'
    ? '<i class="fas fa-check"></i>'
    : '<i class="fas fa-exclamation"></i>';
  popupTitle.textContent = title;
  popupText.textContent = message;
  popup.setAttribute('aria-hidden', 'false');
  document.body.classList.add('subscription-popup-open');
}

function closeSubscriptionPopup() {
  popup.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('subscription-popup-open');
}

popupClose.addEventListener('click', closeSubscriptionPopup);
popup.querySelector('.subscription-popup-backdrop').addEventListener('click', closeSubscriptionPopup);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && popup.getAttribute('aria-hidden') === 'false') {
    closeSubscriptionPopup();
  }
});

function setLoading(button, loading) {
  if (loading) {
    button.dataset.originalText = button.textContent;
    button.innerHTML = '<span class="subscription-spinner" aria-hidden="true"></span><span>Enviando...</span>';
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
  } else {
    button.innerHTML = button.dataset.originalText || 'Quero receber';
    button.disabled = false;
    button.removeAttribute('aria-busy');
  }
}

if (subscriptionForm && subscriptionMessage) {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('subscription');

  if (status === 'confirmed') {
    subscriptionMessage.textContent = 'Inscrição confirmada. Você receberá as próximas atualizações por e-mail.';
    subscriptionMessage.className = 'subscription-message success';
  }

  if (status === 'unsubscribed') {
    subscriptionMessage.textContent = 'Sua inscrição foi cancelada com sucesso.';
    subscriptionMessage.className = 'subscription-message success';
  }

  subscriptionForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const button = subscriptionForm.querySelector('button');
    const email = document.getElementById('subscriber-email').value.trim();

    setLoading(button, true);
    subscriptionMessage.textContent = '';
    subscriptionMessage.className = 'subscription-message';

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        const error = new Error(data.error || 'Não foi possível concluir a inscrição.');
        error.status = response.status;
        throw error;
      }

      subscriptionMessage.textContent = data.message;
      subscriptionMessage.className = 'subscription-message success';
      subscriptionForm.reset();

      showSubscriptionPopup('success', 'Inscrição enviada', data.message || 'Verifique seu e-mail para confirmar a inscrição.');
    } catch (error) {
      const message = error.message || 'Ocorreu um erro ao realizar a inscrição.';
      subscriptionMessage.textContent = message;
      subscriptionMessage.className = 'subscription-message error';

      if (error.status === 409) {
        showSubscriptionPopup('error', 'E-mail já cadastrado', message);
      } else {
        showSubscriptionPopup('error', 'Não foi possível concluir', message);
      }
    } finally {
      setLoading(button, false);
    }
  });
}
