'use strict';

const PASSWORD_MIN = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELD_KEYS = ['reg-name', 'reg-email', 'reg-password', 'reg-confirm-password', 'reg-birthdate'];
const LOGIN_KEYS = ['login-email', 'login-password'];

const PASSWORD_RULES = [
  { label: `At least ${PASSWORD_MIN} characters`, test: (value) => value.length >= PASSWORD_MIN },
  { label: 'One uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { label: 'One lowercase letter', test: (value) => /[a-z]/.test(value) },
  { label: 'One digit', test: (value) => /\d/.test(value) },
  { label: 'One special character (! ? # $ ...)', test: (value) => /[^A-Za-z0-9\s]/.test(value) }
];

const formEl = document.querySelector('#registration');
const messageEl = document.querySelector('#form-response-message');
const newsletterEl = document.querySelector('#reg-newsletter');
const loginEmailEl = document.querySelector('#login-email');
const loginFormEl = loginEmailEl === null ? null : loginEmailEl.closest('form');
const checklistItems = [];

function createField(selector) {
  const control = document.querySelector(selector);
  if (control === null) {
    return null;
  }
  return { mark: control, box: control.parentElement, error: null };
}

const fields = {
  'reg-name': createField('#reg-name'),
  'reg-email': createField('#reg-email'),
  'reg-password': createField('#reg-password'),
  'reg-confirm-password': createField('#reg-confirm-password'),
  'reg-birthdate': createField('#reg-birthdate'),
  'login-email': createField('#login-email'),
  'login-password': createField('#login-password')
};

function getTodayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function validateName(value) {
  if (value === '') {
    return 'Please enter your full name.';
  }
  if (value.length < 2) {
    return 'Name must be at least 2 characters long.';
  }
  return '';
}

function validateEmail(value) {
  if (value === '') {
    return 'Please enter your email.';
  }
  if (!EMAIL_PATTERN.test(value)) {
    return 'Enter an email like name@example.com.';
  }
  return '';
}

function validatePassword(value) {
  if (value === '') {
    return 'Please create a password.';
  }
  const failedRule = PASSWORD_RULES.find((rule) => !rule.test(value));
  if (failedRule !== undefined) {
    return `Password needs: ${failedRule.label.toLowerCase()}.`;
  }
  return '';
}

function validateConfirm(value, password) {
  if (value === '') {
    return 'Please repeat your password.';
  }
  if (value !== password) {
    return 'Passwords do not match.';
  }
  return '';
}

function validateBirthdate(value) {
  if (value !== '' && value > getTodayString()) {
    return 'Date of birth cannot be in the future.';
  }
  return '';
}

function validateLoginPassword(value) {
  return value === '' ? 'Please enter your password.' : '';
}

function validateForm(values) {
  const checks = {
    'reg-name': validateName(values.name),
    'reg-email': validateEmail(values.email),
    'reg-password': validatePassword(values.password),
    'reg-confirm-password': validateConfirm(values.confirm, values.password),
    'reg-birthdate': validateBirthdate(values.birthdate)
  };

  const errors = {};
  for (const [key, text] of Object.entries(checks)) {
    if (text !== '') {
      errors[key] = text;
    }
  }
  return errors;
}

function createPasswordChecklist() {
  const list = document.createElement('ul');
  list.id = 'password-rules';
  list.classList.add('list-unstyled', 'small', 'mt-2', 'mb-0');

  for (let index = 0; index < PASSWORD_RULES.length; index += 1) {
    const item = document.createElement('li');
    list.append(item);
    checklistItems.push(item);
  }
  return list;
}

function updatePasswordChecklist() {
  const value = fields['reg-password'].mark.value;

  PASSWORD_RULES.forEach((rule, index) => {
    const passed = rule.test(value);
    const item = checklistItems[index];
    item.textContent = `${passed ? '✓' : '✗'} ${rule.label}`;
    item.classList.toggle('text-success', passed);
    item.classList.toggle('text-muted', !passed);
  });
}

let toggleButtonEl = null;

function setPasswordsVisible(visible) {
  const type = visible ? 'text' : 'password';
  fields['reg-password'].mark.type = type;
  fields['reg-confirm-password'].mark.type = type;
  toggleButtonEl.textContent = visible ? 'Hide password' : 'Show password';
  toggleButtonEl.setAttribute('aria-pressed', String(visible));
}

function handleToggleClick() {
  const isHidden = fields['reg-password'].mark.type === 'password';
  setPasswordsVisible(isHidden);
}

function showError(key, text) {
  const field = fields[key];
  field.mark.classList.add('is-invalid');
  field.mark.setAttribute('aria-invalid', 'true');
  field.error.textContent = text;
  field.error.classList.remove('hidden');
}

function clearError(key) {
  const field = fields[key];
  field.mark.classList.remove('is-invalid');
  field.mark.removeAttribute('aria-invalid');
  field.error.textContent = '';
  field.error.classList.add('hidden');
}

function clearErrors(keys) {
  for (const key of keys) {
    clearError(key);
  }
}

function clearMessage() {
  messageEl.replaceChildren();
  messageEl.classList.remove('alert-success-custom', 'alert-danger-custom');
}

function showErrorMessage(count) {
  clearMessage();
  messageEl.classList.add('alert-danger-custom');
  const word = count === 1 ? 'field' : 'fields';
  messageEl.textContent = `Please fix the ${count} highlighted ${word} below and try again.`;
}

function showSuccessMessage(name, wantsNewsletter) {
  clearMessage();
  messageEl.classList.add('alert-success-custom');

  const title = document.createElement('p');
  title.classList.add('fw-bold', 'mb-2');
  title.textContent = `Thank you, ${name}! Your sign-up details passed all checks.`;

  const newsletter = document.createElement('p');
  newsletter.classList.add('mb-1');
  newsletter.textContent = wantsNewsletter
    ? 'Newsletter: you chose to subscribe.'
    : 'Newsletter: you chose not to subscribe.';

  const note = document.createElement('p');
  note.classList.add('mt-2', 'mb-0', 'small');
  note.textContent = 'Demo only';

  messageEl.append(title, newsletter, note);
}

function showLoginMessage() {
  clearMessage();
  messageEl.classList.add('alert-success-custom');

  const title = document.createElement('p');
  title.classList.add('fw-bold', 'mb-2');
  title.textContent = 'Your login details look correct.';

  const note = document.createElement('p');
  note.classList.add('mb-2', 'small');
  note.textContent = 'Demo only';

  const link = document.createElement('a');
  link.classList.add('alert-link');
  link.href = 'index.html';
  link.textContent = 'Continue to the home page';

  messageEl.append(title, note, link);
}

function readValues() {
  return {
    name: fields['reg-name'].mark.value.trim(),
    email: fields['reg-email'].mark.value.trim(),
    password: fields['reg-password'].mark.value,
    confirm: fields['reg-confirm-password'].mark.value,
    birthdate: fields['reg-birthdate'].mark.value,
    newsletter: newsletterEl !== null && newsletterEl.checked
  };
}

function handleSubmit(event) {
  event.preventDefault();
  clearMessage();
  clearErrors(FIELD_KEYS);

  const values = readValues();
  const errors = validateForm(values);
  const invalidKeys = FIELD_KEYS.filter((key) => errors[key] !== undefined);

  if (invalidKeys.length > 0) {
    for (const key of invalidKeys) {
      showError(key, errors[key]);
    }
    fields[invalidKeys[0]].mark.focus();
    showErrorMessage(invalidKeys.length);
    messageEl.scrollIntoView({ block: 'nearest' });
    return;
  }

  formEl.reset();
  setPasswordsVisible(false);
  updatePasswordChecklist();
  showSuccessMessage(values.name, values.newsletter);
  messageEl.scrollIntoView({ block: 'nearest' });
}

function handleLoginSubmit(event) {
  event.preventDefault();
  clearMessage();
  clearErrors(LOGIN_KEYS);

  const email = fields['login-email'].mark.value.trim();
  const password = fields['login-password'].mark.value;
  const errors = {
    'login-email': validateEmail(email),
    'login-password': validateLoginPassword(password)
  };
  const invalidKeys = LOGIN_KEYS.filter((key) => errors[key] !== '');

  if (invalidKeys.length > 0) {
    for (const key of invalidKeys) {
      showError(key, errors[key]);
    }
    fields[invalidKeys[0]].mark.focus();
    showErrorMessage(invalidKeys.length);
    messageEl.scrollIntoView({ block: 'nearest' });
    return;
  }

  loginFormEl.reset();
  showLoginMessage();
  messageEl.scrollIntoView({ block: 'nearest' });
}

function handleFieldChange(event) {
  const key = event.target.name;

  if (fields[key] === undefined) {
    return;
  }

  clearError(key);

  if (key === 'reg-password') {
    updatePasswordChecklist();
    clearError('reg-confirm-password');
  }
}

function init() {
  const allFound = formEl !== null && messageEl !== null
    && FIELD_KEYS.every((key) => fields[key] !== null);

  if (!allFound) {
    return;
  }

  formEl.noValidate = true;
  messageEl.setAttribute('aria-live', 'polite');

  for (const key of FIELD_KEYS) {
    const field = fields[key];
    const error = document.createElement('div');
    error.classList.add('text-danger', 'small', 'hidden');
    error.id = `${key}-error`;
    field.box.append(error);
    field.mark.setAttribute('aria-describedby', error.id);
    field.error = error;
  }

  const passwordField = fields['reg-password'];
  passwordField.box.append(createPasswordChecklist());
  passwordField.mark.setAttribute('aria-describedby', `${passwordField.error.id} password-rules`);
  updatePasswordChecklist();

  toggleButtonEl = document.createElement('button');
  toggleButtonEl.type = 'button';
  toggleButtonEl.classList.add('btn', 'btn-outline-dark', 'btn-sm', 'mb-3');
  toggleButtonEl.setAttribute('aria-controls', 'reg-password reg-confirm-password');
  fields['reg-confirm-password'].box.after(toggleButtonEl);
  setPasswordsVisible(false);

  formEl.addEventListener('submit', handleSubmit);
  toggleButtonEl.addEventListener('click', handleToggleClick);
  formEl.addEventListener('input', handleFieldChange);
  formEl.addEventListener('change', handleFieldChange);

  initLogin();
}

function initLogin() {
  const loginFound = loginFormEl !== null && loginFormEl !== formEl
    && LOGIN_KEYS.every((key) => fields[key] !== null);

  if (!loginFound) {
    return;
  }

  loginFormEl.noValidate = true;

  for (const key of LOGIN_KEYS) {
    const field = fields[key];
    const error = document.createElement('div');
    error.classList.add('text-danger', 'small', 'hidden');
    error.id = `${key}-error`;
    field.box.append(error);
    field.mark.setAttribute('aria-describedby', error.id);
    field.error = error;
  }

  loginFormEl.addEventListener('submit', handleLoginSubmit);
  loginFormEl.addEventListener('input', handleFieldChange);
}

init();
 
