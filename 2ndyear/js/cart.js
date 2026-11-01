$(function () {
  'use strict';

  var STORAGE_KEY = 'stradivarius_cart';

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (error) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateBadge();
  }

  function formatPrice(amount) {
    return amount.toLocaleString('ru-RU') + '&nbsp;\u20B8';
  }

  function updateBadge() {
    var total = 0;
    $.each(getCart(), function (index, item) { total += item.qty; });

    var $link = $('#nav-cart-link');
    var $badge = $link.find('.cart-badge');
    if (total > 0) {
      if ($badge.length === 0) {
        $badge = $('<span>', { 'class': 'cart-badge badge bg-danger rounded-pill ms-1' }).appendTo($link);
      }
      $badge.text(total);
    } else {
      $badge.remove();
    }
  }

  var $productList = $('#product-list');
  if ($productList.length > 0) {

    $productList.on('click', 'button[id^="add-"]', function () {
      var $button = $(this);
      if ($button.hasClass('btn-success')) { return; }

      var $card = $button.closest('.product-card');
      var $size = $card.find('select');
      var size = $size.val();

      if (!size) {
        FormUtils.showError($size, 'Please select a size before adding to cart.');
        return;
      }

      var cart = getCart();
      var id = $card.attr('id');
      var existing = null;
      $.each(cart, function (index, item) {
        if (item.id === id && item.size === size) { existing = item; return false; }
      });

      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({
          id: id,
          name: $card.find('.card-title').text().trim(),

          price: parseInt($card.find('.fw-bold').text().replace(/\D/g, ''), 10) || 0,
          img: $card.find('img').attr('src'),
          size: size,
          qty: 1
        });
      }
      saveCart(cart);

      var originalText = $button.text();

      $button.text('Added! \u2713').toggleClass('btn-dark btn-success').delay(1200).queue(function (next) {
        $(this).text(originalText).toggleClass('btn-dark btn-success');
        next();
      });
    });

    $productList.on('change', 'select', function () { FormUtils.clearError($(this)); });
  }

  var $filled = $('#cart-filled');
  var $emptyBlock = $('#cart-empty');
  var $items = $('#cart-items');
  if ($filled.length === 0 || $emptyBlock.length === 0) { updateBadge(); return; }

  var $orderMessage = $('<div>', { id: 'order-response', 'aria-live': 'polite' }).prependTo('#cart-page');

  function buildItem(item) {
    var $li = $('<li>', { 'class': 'd-flex gap-3 py-3 border-bottom' });
    $('<img>', { src: item.img, alt: item.name, 'class': 'cart-thumb rounded' }).attr({ width: 96, height: 96 }).appendTo($li);

    var $body = $('<div>', { 'class': 'flex-grow-1' }).appendTo($li);
    var $head = $('<div>', { 'class': 'd-flex justify-content-between gap-2' }).appendTo($body);

    var $info = $('<div>').appendTo($head);

    $('<h2>', { 'class': 'h6 mb-1' }).text(item.name).appendTo($info);
    $('<p>', { 'class': 'small text-muted mb-0' }).text('Size: ' + (item.size || 'N/A')).appendTo($info);
    $('<button>', { type: 'button', 'class': 'btn-close cart-remove', 'aria-label': 'Remove ' + item.name }).appendTo($head);

    var $row = $('<div>', { 'class': 'd-flex justify-content-between align-items-center mt-2' }).appendTo($body);
    var $group = $('<div>', { 'class': 'btn-group btn-group-sm', role: 'group', 'aria-label': 'Quantity' }).appendTo($row);

    $('<button>', { type: 'button', 'class': 'btn btn-outline-dark cart-dec', 'aria-label': 'Decrease quantity' }).html('&minus;').appendTo($group);
    $('<span>', { 'class': 'btn btn-outline-dark disabled px-3 opacity-100' }).text(item.qty).appendTo($group);
    $('<button>', { type: 'button', 'class': 'btn btn-outline-dark cart-inc', 'aria-label': 'Increase quantity' }).text('+').appendTo($group);

    $('<strong>', { 'class': 'text-nowrap' }).html(formatPrice(item.price * item.qty)).appendTo($row);
    return $li;
  }

  function renderCart() {
    var cart = getCart();

    if (cart.length === 0) {
      $filled.hide();
      $emptyBlock.show();
      return;
    }
    $filled.show();
    $emptyBlock.hide();

    $items.empty();
    var totalPrice = 0;
    var totalCount = 0;
    $.each(cart, function (index, item) {
      totalPrice += item.price * item.qty;
      totalCount += item.qty;
      $items.append(buildItem(item));
    });

    $('#sum-count').text(totalCount);
    $('#sum-products, #cart-total').html(formatPrice(totalPrice));
    $('#order-submit-btn').text('Place order \u2022 ' + totalCount + ' pcs');
  }

  function commit(cart) {
    saveCart(cart);
    renderCart();
  }

  $items.on('click', '.cart-remove, .cart-inc, .cart-dec', function () {
    var $button = $(this);
    var $li = $button.closest('li');
    if ($li.is(':animated')) { return; }

    var index = $li.index();
    var cart = getCart();
    if (!cart[index]) { return; }

    if ($button.hasClass('cart-inc')) {
      cart[index].qty += 1;
      commit(cart);
    } else if ($button.hasClass('cart-remove') || cart[index].qty === 1) {

      $li.fadeOut(250, function () {
        cart.splice(index, 1);
        commit(cart);
      });
    } else {
      cart[index].qty -= 1;
      commit(cart);
    }
  });

  $('#cart-clear-btn').on('click', function (event) {
    event.preventDefault();
    $items.fadeOut(200, function () {
      $(this).show();
      commit([]);
    });
  });

  var $orderForm = $('#order-form');
  var order = { name: $('#order-name'), phone: $('#order-phone'), email: $('#order-email') };

  $orderForm.prop('noValidate', true);

  $orderForm.on('submit', function (event) {
    event.preventDefault();
    if (getCart().length === 0) { return; }

    var checks = [
      [order.name, FormUtils.checkName(FormUtils.trimmed(order.name))],
      [order.phone, FormUtils.checkPhone(FormUtils.trimmed(order.phone))],
      [order.email, FormUtils.checkEmail(FormUtils.trimmed(order.email))]
    ];
    if (!FormUtils.applyChecks(checks, $orderMessage)) { return; }

    var name = FormUtils.trimmed(order.name);
    this.reset();
    commit([]);
    FormUtils.showMessage($orderMessage, 'success', 'Order placed. Thank you, ' + name + '!',
      ['We hold your items for 48 hours at Stradivarius, Mega Silkway; you pay in the store.']);
  });

  $orderForm.on('input change', 'input', function () { FormUtils.clearError($(this)); });

  updateBadge();
  renderCart();
});