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
  const emailInput = document.getElementById('subscriber-email');
  const submitButton = subscriptionForm.querySelector('button[type="submit"]') || subscriptionForm.querySelector('button');
  const resendButton = document.createElement('button');
  resendButton.type = 'button';
  resendButton.className = 'subscription-secondary-button';
  resendButton.textContent = 'Reenviar confirmação';
  resendButton.hidden = true;

  if (submitButton) {
    submitButton.insertAdjacentElement('afterend', resendButton);
  }

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

  if (params.get('resend') === '1') {
    resendButton.hidden = false;
    subscriptionMessage.textContent = 'Informe o e-mail usado na inscrição e solicite um novo link de confirmação.';
  }

  async function requestConfirmation(button) {
    if (!emailInput || !emailInput.reportValidity()) return;

    [submitButton, resendButton].filter(Boolean).forEach(item => setLoading(item, true));
    subscriptionMessage.textContent = '';
    subscriptionMessage.className = 'subscription-message';

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.value.trim() })
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        const error = new Error(data.error || 'Não foi possível processar a solicitação.');
        error.status = response.status;
        throw error;
      }

      const message = data.message || 'Se este endereço puder receber uma confirmação, enviaremos um link por e-mail.';
      subscriptionMessage.textContent = message;
      subscriptionMessage.className = 'subscription-message success';
      resendButton.hidden = false;
      showSubscriptionPopup('success', 'Solicitação recebida', message);
    } catch (error) {
      const message = error.message || 'Ocorreu um erro ao processar a solicitação.';
      subscriptionMessage.textContent = message;
      subscriptionMessage.className = 'subscription-message error';
      showSubscriptionPopup('error', 'Não foi possível concluir', message);
    } finally {
      [submitButton, resendButton].filter(Boolean).forEach(item => setLoading(item, false));
      if (button === resendButton) resendButton.hidden = false;
    }
  }

  subscriptionForm.addEventListener('submit', async event => {
    event.preventDefault();
    await requestConfirmation(submitButton);
  });

  resendButton.addEventListener('click', async () => {
    await requestConfirmation(resendButton);
  });
}
