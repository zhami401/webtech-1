$(function () {
  'use strict';

  var MAX_GUESTS = 10;
  var COMMENT_MIN_FEEDBACK = 10;
  var COMMENT_MAX = 300;

  var PURPOSE_LABELS = { fitting: 'Fitting', consult: 'Consultation', feedback: 'Leave feedback' };
  var DEPARTMENT_LABELS = { women: "Women's clothing", accessories: 'Accessories' };

  var $form = $('#visit-form');
  var $msg = $('#form-response-message');
  if ($form.length === 0 || $msg.length === 0) { return; }

  var fields = {
    fullname: $('#fullname'),
    email: $('#email'),
    phone: $('#phone'),
    visitors: $('#visitors'),
    date: $('#visit-date'),

    purpose: $('#purpose-fitting').closest('fieldset'),
    agree: $('#agree'),
    comment: $('#comment')
  };

  $form.prop('noValidate', true);
  $msg.attr('aria-live', 'polite');

  function validateVisitors(value) {
    if (value === '') { return 'Please enter the number of guests.'; }
    var count = Number(value);
    if (!Number.isInteger(count) || count < 1 || count > MAX_GUESTS) {
      return 'Number of guests: a whole number from 1 to ' + MAX_GUESTS + '.';
    }
    return '';
  }

  function validatePurpose(value) {
    return value === '' ? 'Please choose the purpose of your visit.' : '';
  }

  function validateDate(value, purpose) {
    if (value === '') { return 'Please choose a date.'; }
    var today = FormUtils.todayString();
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

  function validateComment(value, purpose) {
    if (purpose === 'feedback' && value.length < COMMENT_MIN_FEEDBACK) {
      return 'Please write at least ' + COMMENT_MIN_FEEDBACK + ' characters about your visit.';
    }
    if (value.length > COMMENT_MAX) {
      return 'Comment is too long (maximum ' + COMMENT_MAX + ' characters).';
    }
    return '';
  }

  function readValues() {
    return {
      fullname: FormUtils.trimmed(fields.fullname),
      email: FormUtils.trimmed(fields.email),
      phone: FormUtils.trimmed(fields.phone),
      visitors: fields.visitors.val(),
      date: fields.date.val(),
      department: $('#department').val(),

      purpose: $form.find('input[name="purpose"]:checked').val() || '',

      agree: fields.agree.prop('checked'),
      comment: FormUtils.trimmed(fields.comment)
    };
  }

  function showSummary(values) {
    var lines = [
      'Purpose: ' + PURPOSE_LABELS[values.purpose],
      'Date: ' + new Date(values.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      'Guests: ' + values.visitors,
      'Name: ' + values.fullname,
      'Email: ' + values.email,
      'Phone: ' + values.phone
    ];
    if (values.department !== '') { lines.push('Department: ' + DEPARTMENT_LABELS[values.department]); }
    if (values.comment !== '') { lines.push('Comment: ' + values.comment); }

    lines.push('Demo reference: VR-' + Math.floor(1000 + Math.random() * 9000));

    FormUtils.showMessage($msg, 'success', 'Thank you! Here is your request (demonstration):', lines,
      'This is a front-end demonstration: no data is sent to a server and no real booking or visit is created.');
  }

  $form.on('submit', function (event) {
    event.preventDefault();

    var v = readValues();
    var checks = [
      [fields.fullname, FormUtils.checkName(v.fullname)],
      [fields.email, FormUtils.checkEmail(v.email)],
      [fields.phone, FormUtils.checkPhone(v.phone)],
      [fields.visitors, validateVisitors(v.visitors)],
      [fields.date, validateDate(v.date, v.purpose)],
      [fields.purpose, validatePurpose(v.purpose), $('#purpose-fitting')],
      [fields.agree, validateAgree(v.agree)],
      [fields.comment, validateComment(v.comment, v.purpose)]
    ];

    if (!FormUtils.applyChecks(checks, $msg)) { return; }

    this.reset();
    showSummary(v);
  });

  $form.on('input change', 'input, select, textarea', function () {
    var $this = $(this);
    if (this.name === 'purpose') {
      FormUtils.clearError(fields.purpose);
      FormUtils.clearError(fields.date);
      FormUtils.clearError(fields.comment);
    } else {
      FormUtils.clearError($this);
    }
  });

  $form.on('reset', function () {
    FormUtils.clearAll($form);
    FormUtils.clearMessage($msg);
  });
});