$(function () {
  'use strict';

  var PASSWORD_MIN = 8;

  var PASSWORD_RULES = [
    { label: 'At least ' + PASSWORD_MIN + ' characters', test: function (value) { return value.length >= PASSWORD_MIN; } },
    { label: 'One uppercase letter', test: function (value) { return /[A-Z]/.test(value); } },
    { label: 'One lowercase letter', test: function (value) { return /[a-z]/.test(value); } },
    { label: 'One digit', test: function (value) { return /\d/.test(value); } },
    { label: 'One special character (! ? # $ ...)', test: function (value) { return /[^A-Za-z0-9\s]/.test(value); } }
  ];

  var $reg = $('#registration');
  var $msg = $('#form-response-message');
  var $login = $('#login-email').closest('form');
  if ($reg.length === 0 || $msg.length === 0 || $login.length === 0) { return; }

  var reg = {
    name: $('#reg-name'),
    email: $('#reg-email'),
    password: $('#reg-password'),
    confirm: $('#reg-confirm-password'),
    birthdate: $('#reg-birthdate')
  };
  var log = { email: $('#login-email'), password: $('#login-password') };

  $reg.add($login).prop('noValidate', true);
  $msg.attr('aria-live', 'polite');

  function validatePassword(value) {
    if (value === '') { return 'Please create a password.'; }
    var failed = null;
    $.each(PASSWORD_RULES, function (index, rule) {
      if (!rule.test(value)) { failed = rule; return false; }
    });
    return failed ? 'Password needs: ' + failed.label.toLowerCase() + '.' : '';
  }

  function validateConfirm(value, password) {
    if (value === '') { return 'Please repeat your password.'; }
    return value === password ? '' : 'Passwords do not match.';
  }

  function validateBirthdate(value) {
    return value !== '' && value > FormUtils.todayString() ? 'Date of birth cannot be in the future.' : '';
  }

  var $rules = $('<ul>', { id: 'password-rules', 'class': 'list-unstyled small mt-2 mb-0' }).appendTo(reg.password.parent());
  $.each(PASSWORD_RULES, function () { $('<li>').appendTo($rules); });
  reg.password.attr('aria-describedby', 'password-rules');

  function updateChecklist() {
    var value = reg.password.val();
    $rules.children().each(function (index) {
      var rule = PASSWORD_RULES[index];
      var passed = rule.test(value);

      $(this).text((passed ? '\u2713 ' : '\u2717 ') + rule.label)
        .toggleClass('text-success', passed)
        .toggleClass('text-muted', !passed);
    });
  }
  updateChecklist();

  var $toggle = $('<button>', {
    type: 'button',
    'class': 'btn btn-outline-dark btn-sm mb-3',
    'aria-controls': 'reg-password reg-confirm-password',
    'aria-pressed': 'false'
  }).insertAfter(reg.confirm.parent());

  function setPasswordsVisible(visible) {

    reg.password.add(reg.confirm).prop('type', visible ? 'text' : 'password');
    $toggle.text(visible ? 'Hide password' : 'Show password').attr('aria-pressed', String(visible));
  }
  setPasswordsVisible(false);

  $toggle.on('click', function () {
    setPasswordsVisible(reg.password.prop('type') === 'password');
  });

  $reg.on('submit', function (event) {

    event.preventDefault();

    var name = FormUtils.trimmed(reg.name);
    var email = FormUtils.trimmed(reg.email);
    var password = reg.password.val();
    var confirm = reg.confirm.val();
    var birthdate = reg.birthdate.val();
    var wantsNewsletter = $('#reg-newsletter').prop('checked');

    var checks = [
      [reg.name, FormUtils.checkName(name)],
      [reg.email, FormUtils.checkEmail(email)],
      [reg.password, validatePassword(password)],
      [reg.confirm, validateConfirm(confirm, password)],
      [reg.birthdate, validateBirthdate(birthdate)]
    ];
    if (!FormUtils.applyChecks(checks, $msg)) { return; }

    this.reset();
    setPasswordsVisible(false);
    updateChecklist();
    FormUtils.showMessage($msg, 'success', 'Thank you, ' + name + '! Your sign-up details passed all checks.',
      [wantsNewsletter ? 'Newsletter: you chose to subscribe.' : 'Newsletter: you chose not to subscribe.'],
      'Demo only');
  });

  $login.on('submit', function (event) {
    event.preventDefault();

    var checks = [
      [log.email, FormUtils.checkEmail(FormUtils.trimmed(log.email))],
      [log.password, log.password.val() === '' ? 'Please enter your password.' : '']
    ];
    if (!FormUtils.applyChecks(checks, $msg)) { return; }

    this.reset();
    FormUtils.showMessage($msg, 'success', 'Your login details look correct.', [], 'Demo only');
    $('<a>', { href: 'index.html', 'class': 'alert-link' }).text('Continue to the home page')
      .appendTo($('<p>', { 'class': 'mt-2 mb-0' }).appendTo($msg));
  });

  $reg.add($login).on('input change', 'input', function () {
    FormUtils.clearError($(this));
    if (this.id === 'reg-password') {
      updateChecklist();
      FormUtils.clearError(reg.confirm);
    }
  });
});
 
