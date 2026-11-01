$(function () {
  'use strict';

  var $search = $('#catalog-search');
  var $list = $('#product-list');
  if ($search.length === 0 || $list.length === 0) { return; }

  var $columns = $list.find('.product-card').closest('.col');

  var $empty = $('<p>', { 'class': 'text-muted lead' }).hide().insertAfter($list);

  function filterCatalog() {
    var query = String($search.val()).trim().toLowerCase();
    var found = 0;

    $columns.each(function () {
      var $column = $(this);
      var title = $column.find('.card-title').text().toLowerCase();
      var match = title.indexOf(query) !== -1;

      $column.data('match', match);
      if (match) { found += 1; }

      $column.stop(true, true)[match ? 'fadeIn' : 'fadeOut'](200);
    });

    $list.children('.row').each(function () {
      var $row = $(this);
      var anyMatch = $row.children().filter(function () { return $(this).data('match') !== false; }).length > 0;
      $row.prev('h3').stop(true, true)[anyMatch ? 'fadeIn' : 'fadeOut'](200);
    });

    $empty.text('Nothing found for "' + $search.val().trim() + '".').stop(true, true);
    if (found === 0) { $empty.fadeIn(200); } else { $empty.fadeOut(200); }
  }

  $search.on('input', filterCatalog);

  $search.on('keyup', function (event) {
    if (event.key === 'Escape') { $(this).val('').trigger('input'); }
  });

  $list.on('mouseenter mouseleave', '.product-card', function (event) {
    $(this).toggleClass('active-state', event.type === 'mouseenter');
  });
});