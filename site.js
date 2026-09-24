(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const tabs = document.querySelector('.page-tabs');

  if (menuButton && tabs) {
    menuButton.addEventListener('click', function () {
      const open = tabs.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
  }

  document.querySelectorAll('[data-stripe-placeholder]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      const toast = document.getElementById('stripeToast');
      if (!toast) return;
      toast.textContent = 'The Stripe payment link for ' + link.dataset.stripePlaceholder + ' still needs to be added.';
      toast.classList.add('show');
      clearTimeout(window.stripeToastTimer);
      window.stripeToastTimer = setTimeout(function () {
        toast.classList.remove('show');
      }, 3500);
    });
  });

  document.querySelectorAll('[data-year]').forEach(function (node) {
    node.textContent = new Date().getFullYear();
  });
})();
