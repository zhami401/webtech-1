'use strict';

function initCareToggle() {
  var title = document.getElementById('care-guide-title');
  var steps = document.querySelector('.care-steps');
  if (!title || !steps) { return; }

  var hint = document.createElement('small');
  hint.className = 'text-muted ms-2';
  hint.textContent = '(click to hide)';
  title.appendChild(hint);
  title.setAttribute('aria-expanded', 'true');

  function toggle(event) {
    if (event.type === 'keyup' && event.key !== 'Enter') { return; }
    var open = steps.style.display === 'none';
    steps.style.display = open ? '' : 'none';
    title.setAttribute('aria-expanded', String(open));
    hint.textContent = open ? '(click to hide)' : '(click to show)';
  }

  title.addEventListener('click', toggle);
  title.addEventListener('keyup', toggle);
}

function initCatalogSearch() {
  var search = document.getElementById('catalog-search');
  var list = document.getElementById('product-list');
  if (!search || !list) { return; }

  var columns = Array.from(list.querySelectorAll('.product-card')).map(function (card) {
    return card.closest('.col');
  });

  var empty = document.createElement('p');
  empty.className = 'text-muted lead';
  empty.style.display = 'none';
  list.after(empty);

  search.addEventListener('input', function () {
    var query = search.value.trim().toLowerCase();
    var found = 0;

    columns.forEach(function (column) {
      var title = column.querySelector('.card-title').textContent.toLowerCase();
      var match = title.indexOf(query) !== -1;
      column.dataset.match = String(match);
      column.style.display = match ? '' : 'none';
      if (match) { found += 1; }
    });

    list.querySelectorAll(':scope > .row').forEach(function (row) {
      var anyMatch = Array.from(row.children).some(function (child) {
        return child.dataset.match !== 'false';
      });
      row.previousElementSibling.style.display = anyMatch ? '' : 'none';
    });

    empty.textContent = 'Nothing found for "' + search.value.trim() + '".';
    empty.style.display = found === 0 ? '' : 'none';
  });
}

function initCareFormValidation() {
  var form = document.getElementById('style-inquiry-form');
  var msg = document.getElementById('form-response-message');
  if (!form || !msg) { return; }

  form.noValidate = true;

  function clearErrors() {
    form.querySelectorAll('.form-error').forEach(function (node) { node.remove(); });
    form.querySelectorAll('.is-invalid').forEach(function (node) { node.classList.remove('is-invalid'); });
  }

  function showError(field, text) {
    field.classList.add('is-invalid');
    var error = document.createElement('div');
    error.className = 'invalid-feedback d-block form-error';
    error.textContent = text;
    field.after(error);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    clearErrors();
    msg.textContent = '';

    var name = document.getElementById('visitor-name');
    var email = document.getElementById('visitor-email');
    var message = document.getElementById('visitor-message');
    var valid = true;

    if (name.value.trim().length < 2) {
      showError(name, 'Please enter your name.');
      valid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
      showError(email, 'Enter a valid email, for example name@example.com.');
      valid = false;
    }
    if (message.value.trim().length > 300) {
      showError(message, 'Question is too long (maximum 300 characters).');
      valid = false;
    }
    if (!valid) { return; }

    var thanks = 'Thank you, ' + name.value.trim() + '! Your inquiry was received.';
    form.reset();
    msg.className = 'mt-3 alert-success-custom';
    msg.textContent = thanks;
  });

  form.addEventListener('input', function (event) {
    var field = event.target;
    field.classList.remove('is-invalid');
    var next = field.nextElementSibling;
    if (next && next.classList.contains('form-error')) { next.remove(); }
  });
}

initCareToggle();
initCatalogSearch();
initCareFormValidation();
