'use strict';

const MAX_GUESTS = 10;
const COMMENT_MIN_FEEDBACK = 10;
const COMMENT_MAX = 300;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// list of all field keys in the form, used for validation and error handling
const FIELD_KEYS = ['fullname', 'email', 'phone', 'visitors', 'visit-date', 'purpose', 'agree', 'comment'];

const PURPOSE_LABELS = {
  fitting: 'Fitting',
  consult: 'Consultation',
  feedback: 'Leave feedback'
};

const DEPARTMENT_LABELS = {
  women: "Women's clothing",
  accessories: 'Accessories'
};


const formEl = document.querySelector('#visit-form');
const messageEl = document.querySelector('#form-response-message');
const purposeSetEl = document.querySelector('#purpose-fitting')
  ? document.querySelector('#purpose-fitting').closest('fieldset')
  : null;

// fields are objects with { mark, focus, box, error } for each field
function createSimpleField(selector) {
  const control = document.querySelector(selector);
  if (control === null) {
    return null;
  }
  return { mark: control, focus: control, box: control.parentElement, error: null };
}

const fields = {
  fullname: createSimpleField('#fullname'),
  email: createSimpleField('#email'),
  phone: createSimpleField('#phone'),
  visitors: createSimpleField('#visitors'),
  'visit-date': createSimpleField('#visit-date'),
  agree: createSimpleField('#agree'),
  comment: createSimpleField('#comment'),
  purpose: purposeSetEl === null ? null : {
    mark: purposeSetEl,
    focus: document.querySelector('#purpose-fitting'),
    box: purposeSetEl,
    error: null
  }
};
const departmentEl = document.querySelector('#department');

// today's date in "YYYY-MM-DD" format
function getTodayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

// "2026-10-20" -> "20 October 2026"
function formatDate(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// temporary reference for demonstration purposes (not a real booking reference)
function createReference() {
  return `VR-${Math.floor(1000 + Math.random() * 9000)}`;
}


function validateFullName(value) {
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

function validatePhone(value) {
  const digits = value.replace(/\D/g, '');
  if (value === '') {
    return 'Please enter your phone number.';
  }
  if (!/^[78]\d{10}$/.test(digits)) {
    return 'Enter a phone number like +7 701 123 45 67.';
  }
  return '';
}

function validateVisitors(value) {
  if (value === '') {
    return 'Please enter the number of guests.';
  }
  const count = Number(value);
  if (!Number.isInteger(count) || count < 1 || count > MAX_GUESTS) {
    return `Number of guests: a whole number from 1 to ${MAX_GUESTS}.`;
  }
  return '';
}

function validatePurpose(value) {
  return value === '' ? 'Please choose the purpose of your visit.' : '';
}

// rules for visit date depend on the purpose of the visit
function validateDate(value, purpose) {
  if (value === '') {
    return 'Please choose a date.';
  }
  const today = getTodayString();
  if (purpose === 'feedback' && value > today) {
    return 'For feedback, choose the date of a visit that already happened (today or earlier).';
  }
  if (purpose !== '' && purpose !== 'feedback' && value < today) {
    return 'Please choose today or a future date.';
  }
  return '';
}

function validateAgree(checked) {
  return checked ? '' : 'Please agree to the processing of your data.';
}

// feedback requires a comment of at least 10 characters; all comments must be <= 300 characters
function validateComment(value, purpose) {
  if (purpose === 'feedback' && value.length < COMMENT_MIN_FEEDBACK) {
    return `Please write at least ${COMMENT_MIN_FEEDBACK} characters about your visit.`;
  }
  if (value.length > COMMENT_MAX) {
    return `Comment is too long (maximum ${COMMENT_MAX} characters).`;
  }
  return '';
}

// check all fields and return an object with errors (key: error text)
function validateForm(values) {
  const checks = {
    fullname: validateFullName(values.fullname),
    email: validateEmail(values.email),
    phone: validatePhone(values.phone),
    visitors: validateVisitors(values.visitors),
    'visit-date': validateDate(values['visit-date'], values.purpose),
    purpose: validatePurpose(values.purpose),
    agree: validateAgree(values.agree),
    comment: validateComment(values.comment, values.purpose)
  };

  const errors = {};
  for (const [key, text] of Object.entries(checks)) {
    if (text !== '') {
      errors[key] = text;
    }
  }
  return errors;
}


function showError(key, text) {
  const field = fields[key];
  field.mark.classList.add('is-invalid');
  field.focus.setAttribute('aria-invalid', 'true');
  field.error.textContent = text;
  field.error.classList.remove('hidden');
}

function clearError(key) {
  const field = fields[key];
  field.mark.classList.remove('is-invalid');
  field.focus.removeAttribute('aria-invalid');
  field.error.textContent = '';
  field.error.classList.add('hidden');
}

function clearAllErrors() {
  for (const key of FIELD_KEYS) {
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
  messageEl.textContent = `Please fix the ${count} highlighted ${word} below and submit again.`;
}

// final summary of the request (demonstration only)
function showSummary(values) {
  clearMessage();
  messageEl.classList.add('alert-success-custom');

  const title = document.createElement('p');
  title.classList.add('fw-bold', 'mb-2');
  title.textContent = 'Thank you! Here is your request (demonstration):';
  messageEl.append(title);

  const lines = [
    `Purpose: ${PURPOSE_LABELS[values.purpose]}`,
    `Date: ${formatDate(values['visit-date'])}`,
    `Guests: ${values.visitors}`,
    `Name: ${values.fullname}`,
    `Email: ${values.email}`,
    `Phone: ${values.phone}`
  ];
  if (values.department !== '') {
    lines.push(`Department: ${DEPARTMENT_LABELS[values.department]}`);
  }
  if (values.comment !== '') {
    lines.push(`Comment: ${values.comment}`);
  }
  lines.push(`Demo reference: ${createReference()}`);

  for (const line of lines) {
    const paragraph = document.createElement('p');
    paragraph.classList.add('mb-1');
    paragraph.textContent = line;
    messageEl.append(paragraph);
  }

  const note = document.createElement('p');
  note.classList.add('mt-2', 'mb-0', 'small');
  note.textContent = 'This is a front-end demonstration: no data is sent to a server '
    + 'and no real booking or visit is created.';
  messageEl.append(note);
}


function readValues() {
  const checkedPurpose = formEl.querySelector('input[name="purpose"]:checked');

  return {
    fullname: fields.fullname.mark.value.trim(),
    email: fields.email.mark.value.trim(),
    phone: fields.phone.mark.value.trim(),
    visitors: fields.visitors.mark.value,
    'visit-date': fields['visit-date'].mark.value,
    department: departmentEl === null ? '' : departmentEl.value,
    purpose: checkedPurpose === null ? '' : checkedPurpose.value,
    agree: fields.agree.mark.checked,
    comment: fields.comment.mark.value.trim()
  };
}

function handleSubmit(event) {
  event.preventDefault();
  clearMessage();
  clearAllErrors();

  const values = readValues();
  const errors = validateForm(values);
  const invalidKeys = FIELD_KEYS.filter((key) => errors[key] !== undefined);

  if (invalidKeys.length > 0) {
    for (const key of invalidKeys) {
      showError(key, errors[key]);
    }
    fields[invalidKeys[0]].focus.focus();
    showErrorMessage(invalidKeys.length);
    messageEl.scrollIntoView({ block: 'nearest' });
    return;
  }

  // reset form and show summary
  formEl.reset();
  showSummary(values);
  messageEl.scrollIntoView({ block: 'nearest' });
}

// when a field changes, clear its error and possibly other related errors
function handleFieldChange(event) {
  const key = event.target.name;

  if (fields[key] === undefined) {
    return;
  }

  clearError(key);

  // from feedback to fitting/consult
  if (key === 'purpose') {
    clearError('visit-date');
    clearError('comment');
  }
}

function handleReset() {
  clearAllErrors();
  clearMessage();
}

function init() {
  const allFound = formEl !== null && messageEl !== null
    && FIELD_KEYS.every((key) => fields[key] !== null);

  if (!allFound) {
    return;
  }

  // offline validation
  formEl.noValidate = true;
  messageEl.setAttribute('aria-live', 'polite');

  // create error elements for each field
  for (const key of FIELD_KEYS) {
    const field = fields[key];
    const error = document.createElement('div');
    error.classList.add('text-danger', 'small', 'hidden');
    error.id = `${key}-error`;
    field.box.append(error);
    field.mark.setAttribute('aria-describedby', error.id);
    field.error = error;
  }

  formEl.addEventListener('submit', handleSubmit);
  formEl.addEventListener('input', handleFieldChange);
  formEl.addEventListener('change', handleFieldChange);
  formEl.addEventListener('reset', handleReset);
}

init();