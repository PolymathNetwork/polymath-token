// -------------------------------------
// Countdown accordion
// -------------------------------------
function updateCountdown() {
    var crowdsaleDate = new Date("Dec 17, 2017 12:00:00").getTime()
    var difference = crowdsaleDate - Date.now()

    $('.Intro-countdown-value.day').html(('0' + Math.floor(difference / (1000 * 60 * 60 * 24))).slice(-2))
    $('.Intro-countdown-value.hour').html(('0' + Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).slice(-2))
    $('.Intro-countdown-value.minute').html(('0' +  Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))).slice(-2))
    $('.Intro-countdown-value.second').html(('0' +  Math.floor((difference % (1000 * 60)) / 1000)).slice(-2))
}
setInterval(updateCountdown, 1000)


// -------------------------------------
// FAQ accordion
// -------------------------------------
$('#FAQ .FAQ-item').click(function(e) {
    $('#FAQ .FAQ-item').removeClass('active')
    $(this).addClass('active')
})


// -------------------------------------
// Registration modal
// -------------------------------------
$('#crowdsale-register').submit(function(e) {
    e.preventDefault()
    $('.error-message').hide()

    var error = false

    $('#registration input').each(function(i, input) {
        if ($(this).val() == '') {
            error = true
            $(this).parent().find('.error-message').show()
        }
    })

    if (!$('#terms-check')[0].checked) {
        error = true
        $('#terms-check ~ .error-message').show()
    }
    if (!$('#country-check')[0].checked) {
        error = true
        $('#country-check ~ .error-message').show()
    }

    if (!error) {
        // submit data to somewhere
        console.log($(this).serializeArray())

        closeModal()
        $('#registration-success').show() // on success
        // $('#registration-fail').show() // on failure
    }
})

$('.terms-conditions').scroll(function(e) {
    if ($(this).scrollTop() >= ($(this)[0].scrollHeight - $(this).outerHeight() - 20))
        $('#terms-check').prop('disabled', false)
})


// -------------------------------------
// Modal actions
// -------------------------------------
$('button.modal-open').click(function(e) {
    e.preventDefault()
    var modal = $(this).data('modal')
    $(`#${modal}`).show()
    $('body').css({ 'overflow': 'hidden' })
})

$('a.modal-open').click(function(e) {
    e.preventDefault()
    var modal = $(this).data('modal')
    $(`#${modal}`).show()
    $('body').css({ 'overflow': 'hidden' })
})

$('.modal-close').click(function(e) {
    closeModal()
})
$('.modal-close-cta').click(function(e) {
    closeModal()
})
$('.modal-bg').click(function(e) {
    closeModal()
})

function closeModal() {
    $('.modal').hide()
    $('body').css({ 'overflow': 'visible' })
}


// -------------------------------------
// Contribute step navigation
// -------------------------------------
$('#contribute-legal').submit(function(e) {
    e.preventDefault()
    var error = false

    if (!$('#terms-check')[0].checked) {
        error = true
        $('#terms-check ~ .error-message').show()
    }
    if (!$('#country-check')[0].checked) {
        error = true
        $('#country-check ~ .error-message').show()
    }

    if (!error) {
        var nextStep = $('#Step-2 .Step')
        var nextBreadcrumb = $('#Breadcrumb li#Breadcrumb-wallet')
        updateStep(nextStep, nextBreadcrumb)
    }
})

$('#contribute-wallet').submit(function(e) {
    e.preventDefault()

    var nextBreadcrumb = $('#Breadcrumb li#Breadcrumb-contribute')
    var method = $('#contribute-wallet input[name="contribution-method"]:checked').val()

    if (method == "web3") {
        var nextStep = $('#Step-3a .Step')
        updateStep(nextStep, nextBreadcrumb)
    } else if (method == "address") {
        var nextStep = $('#Step-3b .Step')
        updateStep(nextStep, nextBreadcrumb)
    } else {
        $('.error-message').show()
    }
})

$('#Step-2 .prev-step').click(function(e) {
    var nextStep = $('#Step-1 .Step')
    var nextBreadcrumb = $('#Breadcrumb li#Breadcrumb-legal')
    updateStep(nextStep, nextBreadcrumb)
})

$('#Step-3a .prev-step').click(function(e) {
    var nextStep = $('#Step-2 .Step')
    var nextBreadcrumb = $('#Breadcrumb li#Breadcrumb-wallet')
    updateStep(nextStep, nextBreadcrumb)
})

$('#Step-3b .prev-step').click(function(e) {
    var nextStep = $('#Step-2 .Step')
    var nextBreadcrumb = $('#Breadcrumb li#Breadcrumb-wallet')
    updateStep(nextStep, nextBreadcrumb)
})

function updateStep(nextStep, nextBreadcrumb) {
    window.scrollTo(0,0);

    // Update current step
    $('.Step').hide()
    nextStep.show()


    // Update Breadcrumb
    $('#Breadcrumb li').removeClass('current')
    nextBreadcrumb.addClass('current')
}


// -------------------------------------
// Token Distribution hover state
// -------------------------------------
$('.progress').hover(function(e) {
    var expense = $(this).data('expense')
    $('#'+expense).addClass('active')
    $('.TokenDistribution-progress-wrapper').addClass('activeHover')
    $(this).addClass('active')
}, function(e) {
    var expense = $(this).data('expense')
    $('#'+expense).removeClass('active')
    $('.TokenDistribution-progress-wrapper').removeClass('activeHover')
    $(this).removeClass('active')
})


// -------------------------------------
// Copy to clipboard
// -------------------------------------
function copyToClipboard(str) {
    var temp = $("<input>")
    $("body").append(temp)
    temp.val(str).select()
    document.execCommand("copy")
    temp.remove()
}
