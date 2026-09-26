const subscriptionForm = document.getElementById('subscription-form');
const subscriptionMessage = document.getElementById('subscription-message');

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

    button.disabled = true;
    subscriptionMessage.textContent = 'Enviando confirmação...';
    subscriptionMessage.className = 'subscription-message';

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível concluir a inscrição.');
      }

      subscriptionMessage.textContent = data.message;
      subscriptionMessage.className = 'subscription-message success';
      subscriptionForm.reset();
    } catch (error) {
      subscriptionMessage.textContent = error.message;
      subscriptionMessage.className = 'subscription-message error';
    } finally {
      button.disabled = false;
    }
  });
}
