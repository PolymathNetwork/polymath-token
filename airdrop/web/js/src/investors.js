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
$('#submit-data').click(function(e) {
  e.preventDefault();
  $('#airdropResult').hide();
  var ethaddress = $('#ethaddress').val();
  if (ethaddress.length == 42) {
    $('#allocation-form').hide();
    $('#loading').fadeIn(500);
    $.post('https://polymath-api.herokuapp.com/airdrop/' + ethaddress, function(
      data,
    ) {
      if (data && data.address) {
        $('#loading').hide();
        $('#airdropResult').text(
          'Congratulations, you successfully signed up to the airdrop! Stay tuned for details on the token distribution on our telegram.',
        );
        $('#airdropResult').show();
        $('#allocation-form').fadeIn(500);
        $('#submit-data').hide();
      } else {
        $('#airdropResult').text(
          'No allocation found. You must have registered for the airdrop to be eligible for an allocation.',
        );
        $('#loading').hide();
        $('#airdropResult').show();
        $('#allocation-form').fadeIn(500);
      }
    }).fail(function() {
      $('#airdropResult').text(
        'There was an error with your request, please try again shortly.',
      );
    });
  } else {
    $('#airdropResult').text('Invalid Ethereum Address!');
    $('#airdropResult').show();
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
