jQuery(document).ready(function($){

	/*-------------------------------------
	Global Variables
	-------------------------------------*/

	var $window = $(window);

	/*-------------------------------------
	Page Load
	-------------------------------------*/

	$window.on('load', function(){
		$('body').addClass('page-loaded');
	})

	/*-------------------------------------
	Bull Animation
	-------------------------------------*/

	$($('svg polygon').get().reverse()).each(function(i, el) {        
	  window.setTimeout(function(){
	    $(el).addClass('active');
	  }, 20 * i);
	});

	/*-------------------------------------
	Video Tab Hover
	-------------------------------------*/

	$(".video-button").on('mouseenter', function(){
	    $('.video-tab').addClass('active');
	}).on('mouseleave', function(){
	     $('.video-tab').removeClass('active');
	});

	/*-------------------------------------
	Desktop Navigation
	-------------------------------------*/

	$('.desktop-menu .burger').on('click', function(){
		if($('body').hasClass('desktop-menu-active')){
			$('body').removeClass('desktop-menu-active');
			disablePage(false);
		}else{
			$('body').addClass('desktop-menu-active');
			disablePage(true);
		}
	});

	/*-------------------------------------
	Mobile Navigation
	-------------------------------------*/

	$('.mobile-gui .burger').on('click', function(){
		if($('body').hasClass('mobile-menu-active')){
			$('body').removeClass('mobile-menu-active');
			disablePage(false);
		}else{
			$('body').addClass('mobile-menu-active');
			disablePage(true);
		}
	});

	/*-------------------------------------
	Social Navigation
	-------------------------------------*/

	$('.touch .social-menu button').on('click', function(){
		if($('body').hasClass('social-menu-active')){
			$('body').removeClass('social-menu-active');
			disablePage(false);
		}else{
			$('body').addClass('social-menu-active');
			disablePage(true);
		}
	});

	$('.no-touch .social-menu').on('mouseenter', function(){
	    $('body').addClass('social-menu-active');
		disablePage(true);
	}).on('mouseleave', function(){
	     $('body').removeClass('social-menu-active');
		disablePage(false);
	});

	/*-------------------------------------
	Vimeo Init
	-------------------------------------*/

	var iframe = $('.video-embed iframe')[0];
	var player = $f(iframe);

	/*-------------------------------------
	Modal Framework
	-------------------------------------*/

	$('.modal-trigger').on('click', openModal);

	function openModal(e){
		e.preventDefault();

		var thisClass = $(this).attr('class').split(' ').pop(),
			$modal = $('.modal.'+thisClass);		

		$modal.fadeIn(300);
		disablePage(true);
		$modal.add($modal.find('modal-close')).on('click', function(e){
			e.stopPropagation();
			closeModal();
		});

		$('body').addClass('modal-enabled');

		function closeModal(){
			$modal.add($modal.find('modal-close')).off('click');
			$modal.fadeOut(300);
			disablePage(false);
			$('body').removeClass('modal-enabled');
		}
	}

	/*-------------------------------------
	Disable Page
	-------------------------------------*/

	var autoplay = false;

	function disablePage(i){
		if(i == true){
			setTimeout(function(){
				$('body').addClass('page-disabled');				
			}, 2);
		}

		if(i == false){
			$('body').removeClass('page-disabled');
		}
	}

	/*-------------------------------------
	Polygon Animation
	-------------------------------------*/

	var windowHeight = $window.height();

	$.fn.polyMovement = function(options) {

		var windowHeight = $window.height(),
			$this = $(this),
			objHeight = $this.height(),
			start = Math.floor(Math.random() * windowHeight) + 1,
			end = 0-objHeight,
			position = start,
			speed = options.speed;

		$window.on('resize', function(){
			windowHeight = $window.height()
		})
		
		var shape1 = setInterval(function(){

			if(position <= end){
				position = windowHeight - speed;
			}else{
				position = position - speed;
			}

			$this.css('transform', 'translate3d(0px,' + position + 'px, 0px)');

		}, 5);
	}

	$('.polygon-animation.background span:nth-child(1)').polyMovement({
		speed: .15
	});

	$('.polygon-animation.background span:nth-child(2)').polyMovement({
		speed: .3
	});

	$('.polygon-animation.background span:nth-child(3)').polyMovement({
		speed: .1
	});

	$('.polygon-animation.background span:nth-child(4)').polyMovement({
		speed: .1
	});

	$('.polygon-animation.background span:nth-child(5)').polyMovement({
		speed: .2
	});

	/*-------------------------------------
	Mouse Movement
	-------------------------------------*/

	// var mX, mY, distance,
	//         $distance = $('#distance span'),
	//         $element  = $('#element');

	// function calculateDistance(elem, mouseX, mouseY) {
 //        return Math.floor(Math.sqrt(Math.pow(mouseX - (elem.offset().left+(elem.width()/2)), 2) + Math.pow(mouseY - (elem.offset().top+(elem.height()/2)), 2)));
 //    }

	// $window.on('mousemove', function(e){
	// 	var mx = e.pageX,
	// 		my = e.pageY,
	// 		winY = $window.height()/2,
	// 		winX = $window.width()/2,
	// 		distanceX = winX-mx,
	// 		distanceY = winY-my;

	// 	$('.polygon-animation').css('marginLeft', distanceX/10);
	// 	$('.polygon-animation').css('marginTop', distanceY/10);

	// 	speedX = $('.polygon-animation').css('marginLeft');

	// })

	/*-------------------------------------
	Countdown
	-------------------------------------*/

	moment.tz.add([
	    'America/New_York|EST EDT|50 40|0101|1Lz50 1zb0 Op0'
	]);

	var startTime = moment.tz("2017-10-02 09:00", 'America/New_York').toDate().getTime();

	function renderCountdown() {
		var countdown = setInterval(function() {
			
			var now = new Date().getTime();
			var distance = startTime - now;

			if (distance > 0) {
				var days = Math.floor(distance / (1000 * 60 * 60 * 24));
				var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
				var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
				var seconds = Math.floor((distance % (1000 * 60)) / 1000);

				$('.countdown .days').html(days);
				$('.countdown .hours').html(hours);
				$('.countdown .minutes').html(minutes);
				$('.countdown .seconds').html(seconds);
			}else{
				$('.countdown').remove();
				clearInterval(countdown);
			}
		}, 1000);
	}

	renderCountdown();

});