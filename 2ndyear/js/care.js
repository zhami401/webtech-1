$(function () {
  'use strict';

  var QUESTION_MAX = 300;

  var $title = $('#care-guide-title');
  var $steps = $('.care-steps');
  var $hint = $('<small>', { 'class': 'text-muted ms-2' }).text('(click to hide)').appendTo($title);
  $title.attr('aria-expanded', 'true');

  $title.on('click keyup', function (event) {
    if (event.type === 'keyup' && event.key !== 'Enter') { return; }

    $steps.slideToggle(300, function () {
      var open = $(this).is(':visible');
      $title.attr('aria-expanded', String(open));
      $hint.text(open ? '(click to hide)' : '(click to show)');
    });
  });

  $('.care-step:first').addClass('active-state');
  $('.care-step:not(.active-state)').attr('title', 'Click to highlight');

  $steps.on('click', '.care-step', function () {
    var $step = $(this);

    $step.closest('.col').siblings().find('.care-step').removeClass('active-state');
    $step.toggleClass('active-state');
  });

  $('table tbody tr').on('mouseenter mouseleave', function (event) {
    $(this).toggleClass('active-state', event.type === 'mouseenter');
  });

  var $form = $('#style-inquiry-form');
  var $msg = $('#form-response-message');
  if ($form.length === 0 || $msg.length === 0) { return; }

  var fields = { name: $('#visitor-name'), email: $('#visitor-email'), message: $('#visitor-message') };

  $form.prop('noValidate', true);
  $msg.attr('aria-live', 'polite');

  var $counter = $('<div>', { 'class': 'form-text' }).insertAfter(fields.message);
  function updateCounter() {
    $counter.text(fields.message.val().length + ' / ' + QUESTION_MAX + ' characters');
  }
  updateCounter();
  fields.message.on('keyup input', updateCounter);

  $form.on('submit', function (event) {
    event.preventDefault();

    var name = FormUtils.trimmed(fields.name);
    var message = FormUtils.trimmed(fields.message);
    var checks = [
      [fields.name, FormUtils.checkName(name)],
      [fields.email, FormUtils.checkEmail(FormUtils.trimmed(fields.email))],
      [fields.message, message.length > QUESTION_MAX ? 'Question is too long (maximum ' + QUESTION_MAX + ' characters).' : '']
    ];
    if (!FormUtils.applyChecks(checks, $msg)) { return; }

    var vibe = $('#preferred-style option:selected').text();
    this.reset();
    updateCounter();
    FormUtils.showMessage($msg, 'success', 'Thank you, ' + name + '! Your inquiry was received.',
      ['Preferred vibe: ' + vibe],
      'Front-end demonstration: nothing is sent to a server.');
  });

  $form.on('input change', 'input, select, textarea', function () {
    FormUtils.clearError($(this));
  });
});