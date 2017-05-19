/*
 * @version 0.1
 *
 * @author Mattias Johansson
 * @copyright Copyright 2017, Licensed GPL & MIT
 */

var MOS = window.MOS || {};
MOS.main = (function () {

	function _init () {

		var opt = {
			trigger: 'click',  // click | hover
			tailPosition: 'bottom'
		};
		var hs = new MOS.HosSpotter('.hsWrapper', opt); 

		var dot = hs.add({
			title: 'Hot spot 1',
			left: '49.5%',
			top: '14.5%',
			html: '<h1>Götlaborg</h1><p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>'
		});

		//dot.show();

		var dot2 = hs.add({
			title: 'Hot spot Atlantis',
			left: '33%',
			top: '33%',
			html: '<h1>Atlantis</h1><p>Non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Excepteur sint occaecat cupidatat culpa qui officia deserunt mollit</p>'
		});

		// var dot3 = hs.add({
		// 	title: 'This is a spot width action',
		// 	left: '70%',
		// 	top: '59%',
		// 	action: function() {
		// 		alert('Yay!');
		// 	}
		// });

		var dot4 = hs.add({
			title: 'Hot spot 4',
			left: '5%',
			top: '60%',
			html: '<h1>Excepteur</h1><p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>'
		});
		//dot4.show();

		var dot5 = hs.add({
			title: 'Hot spot 4',
			left: '95%',
			top: '60%',
			html: '<h1>Excepteur</h1><p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>'
		});
		//dot5.show();

		var dot6 = hs.add({
			title: 'Hot spot 4',
			left: '50%',
			top: '2%',
			html: '<h1>Excepteur</h1><p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>'
		});
		//dot6.show();

	}

	return {
		init: _init
	};
}());