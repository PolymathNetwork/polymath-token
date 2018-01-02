// -------------------------------------
// FAQ accordion
// -------------------------------------
$('#FAQ .FAQ-item').click(function(e) {
  $('#FAQ .FAQ-item').removeClass('active');
  $(this).addClass('active');
});

// -------------------------------------
// Registration modal
// -------------------------------------
$('#registration-form').submit(function(e) {
  e.preventDefault();
  $('.error-message').hide();

  var error = false;

  $('#registration input').each(function(i, input) {
    if ($(this).val() == '') {
      error = true;
      $(this)
        .parent()
        .find('.error-message')
        .show();
    }
  });

  if (!error) {
    // submit data to somewhere
    var raw = $(this).serializeArray();
    var data = JSON.stringify({
      company: raw[0].value,
      url: raw[1].value,
      firstName: raw[2].value,
      lastName: raw[3].value,
      email: raw[4].value,
      role: raw[5].value,
      address: raw[6].value,
      country: raw[7].value,
      state: raw[8].value,
      city: raw[9].value,
      postal: raw[10].value,
      services: raw[11].value,
      ethAddress: raw[12].value,
    });
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        $('#registration-success').fadeIn(500);
      } else if (xhr.readyState == 4 && xhr.status == 400) {
        $('#registration-fail').fadeIn(500);
      }
    };
    xhr.open(
      'POST',
      'https://polymath-api-staging.herokuapp.com/onboarding/delegate',
      true,
    ); // true for asynchronous
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(data);
  }
});

// -------------------------------------
// Modal actions
// -------------------------------------
$('button.modal-open').click(function(e) {
  e.preventDefault();
  var modal = $(this).data('modal');
  $(`#${modal}`).show();
  $('body').css({ overflow: 'hidden' });
});

$('a.modal-open').click(function(e) {
  e.preventDefault();
  var modal = $(this).data('modal');
  $(`#${modal}`).show();
  $('body').css({ overflow: 'hidden' });
});

$('.modal-close').click(function(e) {
  closeModal();
});
$('.modal-close-cta').click(function(e) {
  closeModal();
});
$('.modal-bg').click(function(e) {
  closeModal();
});

function closeModal() {
  $('.modal').fadeOut(500);
  $('body').css({ overflow: 'visible' });
}

// -------------------------------------
// Token Distribution hover state
// -------------------------------------
$('.progress').hover(
  function(e) {
    var expense = $(this).data('expense');
    $('#' + expense).addClass('active');
    $('.TokenDistribution-progress-wrapper').addClass('activeHover');
    $(this).addClass('active');
  },
  function(e) {
    var expense = $(this).data('expense');
    $('#' + expense).removeClass('active');
    $('.TokenDistribution-progress-wrapper').removeClass('activeHover');
    $(this).removeClass('active');
  },
);
