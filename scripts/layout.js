---
---
/**
 * ==========
 * (c) Copyright 2015 Juan Carlos Niño. Licensed under Mozilla Public License v2.0. But
 * contact me if you want or need anything from here or from me. I'm a kind person. ;)
 * ==========
 */

var $window, bigSize = 1100, mediumSize = 800, smallSize = 550, tinySize = 380;

/**
 * {Object} Represents both the post.html and podcast.html layout. Initiate it only if you
 * use any of those layouts.
 */
var blogLayout = {
	maxPostsBig : 7,
	maxPostsSmall : 3,
	postsOverflow : null,
	
	/**
	 * Do not use any other function inside the <code>blogLayout</code> object without
	 * calling this first.
	 */
	init : function () {
		this.postsOverflow = $("div.posts-container");
		
		$("a.posts-button-up").on("touchend click",
			function postsPrevButtonPressed ( evt ) { blogLayout.postsButtonPressed(evt, false); });
		$("a.posts-button-down").on("touchend click",
			function postsNextButtonPressed ( evt ) { blogLayout.postsButtonPressed(evt, true); });
		
		$window.resize(this.resize);
		$window.load(this.resize);
		this.resize();
	},
	
	/**
	 * Called when a posts navigation button is pressed. The <code>next</code> param indicates
	 * whether the "next" (true) or the "previous" (false) button was pressed.
	 *  
	 * @param {jQueryEvent} evt
	 * @param {Boolean} next
	 */
	postsButtonPressed : function ( evt, next ) {
		var currentId, currentPos, postsInView, overflow, totalPosts, height, itemHeight, parent;
		
		evt.preventDefault();
		evt.stopImmediatePropagation();
		
		overflow = blogLayout.postsOverflow;
		
		if (overflow.length === 0) return;
		
		height = 0;
		parent = overflow.parent().parent();
		parent.children("h2, a").each(function sumHeight () {
			var $item = $(this);
			height += ($item.height() +
				Number($item.css("padding-top").replace("px", "")) +
				Number($item.css("padding-bottom").replace("px", "")) +
				Number($item.css("margin-top").replace("px", "")) +
				Number($item.css("margin-bottom").replace("px", "")));
		});
		height = parent.height() - height;
		itemHeight = overflow.children().eq(0).height() +
			Number(overflow.children().eq(0).css("margin-bottom").replace("px", ""));
		postsInView = 0 | (height / itemHeight);
		totalPosts = overflow.children().length;
		
		if (postsInView >= totalPosts) return;
		
		currentPos = Number(overflow.css("top").replace("px", ""));
		currentId = Math.round(-currentPos / itemHeight);
		
		if ((next && currentId + postsInView < totalPosts) || (!next && currentId > 0)) {
			overflow.css({
				top: Math.min((currentId + (next - !next) * (postsInView - 1)) * -itemHeight, 0)+"px"
			});
		}
	},
	
	/**
	 * Called when the window is resized.
	 */
	resize : function () {
		var height, img, itemHeight, parent, post, posts, sumHeight, w;
		
		blogLayout.postsOverflow.removeAttr("style");
		
		post = $("article.post");
		parent = blogLayout.postsOverflow.parent().parent();
		posts = blogLayout.postsOverflow.children();
		itemHeight = posts.eq(0).height() + Number(posts.eq(0).css("margin-bottom").replace("px", ""));
		sumHeight = 0;
		parent.children("h2, a").each(function sumHeightFunction () {
			var $item = $(this);
			sumHeight += ($item.height() +
				Number($item.css("padding-top").replace("px", "")) +
				Number($item.css("padding-bottom").replace("px", "")) +
				Number($item.css("margin-top").replace("px", "")) +
				Number($item.css("margin-bottom").replace("px", "")));
		});
		
		if (post.width() / post.parent().width() < 0.9) {
			height = Math.max(
				itemHeight + sumHeight,
				Math.min(
					itemHeight * (blogLayout.maxPostsBig + 0.3) + sumHeight,
					post.height()
				)
			);
		} else {
			height = itemHeight * (Math.min(blogLayout.maxPostsSmall, posts.length) + 0.3) + sumHeight;
		}
		
		w = $window.width();
		(img = $("img.post-main-image")).length && 
			img.attr("src", img.attr("src").replace(
				/(_big|_medium)?(?=\.[^\.]+$)/,
				(w > bigSize ? "_big" : (w > tinySize ? "_medium" : ""))
			));
		
		$("aside.posts").height(height);
	}
};


/**
 * {Object} Represents the game.html layout. Initiate it only if you use that layout.
 */
var gamesLayout = {
	gamesButton : null,
	gamesOverflow : null,
	screenshotOverflow : null,
	screenshotRatio : 0.6,
	screenshotSlider : null,
	screenshotSliderBg : null,
	scrollbarHeight : 30,	// This is in pixels and is automatically obtained from the real scrollbar.
	sliderWidth : 15,	// This is in percent and is automatically obtained from the real slider.
	
	/**
	 * Do not use any other function inside the <code>gamesLayout</code> object without
	 * calling this first.
	 */
	init : function () {
		this.gamesButton = $(".games-button-left");
		this.gamesOverflow = $("div.games-overflow");
		
		if (this.screenshotOverflow = $("div.game-about-images-container")) {
			this.screenshotSlider = $("div.game-about-images-slider");
			this.screenshotSliderBg = $("div.game-about-images-sliderbg");
			this.scrollbarHeight = this.screenshotSliderBg.height();
			 
			$("div.game-about-images-sliderleft").on("touchend click",
				function sliderLeftPressed ( evt ) { gamesLayout.screenshotButtonPressed.call(this, evt, false); }
			);
			$("div.game-about-images-sliderright").on("touchend click",
				function sliderRightPressed ( evt ) { gamesLayout.screenshotButtonPressed.call(this, evt, true); }
			);
			this.screenshotSlider.on("touchstart mousedown", this.dragSlider);
			this.adjustSliderWidth();
		}
		
		this.gamesButton.on("touchend click",
			function gamesLeftPressed ( evt ) { gamesLayout.gamesButtonPressed.call(this, evt, false); });
		$(".games-button-right").on("touchend click",
			function gamesRightPressed ( evt ) { gamesLayout.gamesButtonPressed.call(this, evt, true); });
		$(".game-button-play").on("touchend click", gamesLayout.playButtonPressed);
		
		$window.resize(this.resize);
		$window.load(this.resize);
		this.resize();
	},
	
	/**
	 * Adjust the slider width to better represent the amount of items available.
	 */
	adjustSliderWidth : function () {
		var totalScreens = this.screenshotOverflow.children().length;
		if (totalScreens <= 1) {
			this.sliderWidth = 100;
			this.screenshotSlider.css({
				display: "none"
			});
		} else {
			this.sliderWidth = Math.max(8, 100 / totalScreens);
			this.screenshotSlider.width(this.sliderWidth+"%");
		}
	},
	
	/**
	 * Slider starts dragging. Automatically stops once the user releases the mouse.
	 */
	dragSlider : function ( evt ) {
		function sliderDrop ( evt ) {
			var currentId;
			
			evt.preventDefault();
			evt.stopImmediatePropagation();
			gamesLayout.screenshotOverflow.addClass("with-transition");
			
			doc.off("touchmove mousemove", sliderMove);
			doc.off("touchend touchcancel mouseup", sliderDrop);
			
			currentId = Number(gamesLayout.screenshotOverflow.css("left").replace("px",""));
			currentId = Math.round(-currentId / $(".game-about-images").width());
			
			gamesLayout.screenshotOverflow.css({
				left: (currentId * -100)+"%"
			});
			gamesLayout.screenshotSlider.css({
				left: (currentId / (totalScreens - 1) * (100 - gamesLayout.sliderWidth))+"%"
			});
		}
		
		function sliderMove ( evt ) {
			var pageX = evt.originalEvent.touches ? evt.originalEvent.touches[0].pageX : evt.pageX,
				percent = Math.max(0, Math.min(1,
					(initialSliderX + pageX - minSliderX - initialMouseX) / (maxSliderX - minSliderX)
				));
			
			evt.preventDefault();
			evt.stopImmediatePropagation();
			
			slider.css({
				left: (percent * (100 - gamesLayout.sliderWidth))+"%"
			});
			gamesLayout.screenshotOverflow.css({
				left: (-100 * (totalScreens - 1) * percent)+"%"
			});
		}
		
		var doc, initialMouseX, initialSliderX, maxSliderX, minSliderX, slider, totalScreens;
		
		if (evt.which && evt.which !== 1) return;
		
		evt.preventDefault();
		evt.stopImmediatePropagation();
		gamesLayout.screenshotOverflow.removeClass("with-transition");
		
		slider = $(this);
		doc = $(document);
		minSliderX = gamesLayout.screenshotSliderBg.offset().left;
		initialMouseX = (evt.originalEvent.touches ? evt.originalEvent.touches[0].pageX : evt.pageX) - minSliderX;
		initialSliderX = Number(slider.css("left").replace("px", ""));
		maxSliderX = minSliderX + gamesLayout.screenshotSliderBg.width() - slider.width();
		totalScreens = gamesLayout.screenshotOverflow.children().length;
		
		doc.on("touchmove mousemove", sliderMove);
		doc.on("touchend touchcancel mouseup", sliderDrop);
	},
	
	/**
	 * Called when a games navigation button is pressed. The <code>next</code> param indicates
	 * whether the "next" (true) or the "previous" (false) button was pressed.
	 *  
	 * @param {jQueryEvent} evt
	 * @param {Boolean} next
	 */
	gamesButtonPressed : function ( evt, next ) {
		var currentId, currentPos, button, buttonWidth, gamesInView, overflow, totalGames, width;
		
		evt.preventDefault();
		evt.stopImmediatePropagation();
		
		overflow = gamesLayout.gamesOverflow;
		
		if (overflow.length === 0) return;
		
		width = overflow.parent().width();
		gamesInView = 0 | (width / overflow.children().eq(0).width());
		totalGames = overflow.children().length;
		
		if (gamesInView >= totalGames) return;
		
		button = gamesLayout.gamesButton;
		buttonWidth = (button.width() +
				Number(button.css("padding-left").replace("px", "")) +
				Number(button.css("padding-right").replace("px", "")));
		
		currentPos = Number(overflow.css("left").replace("px", ""));
		currentId = Math.round((buttonWidth - currentPos) / (width - buttonWidth * 2));
		
		if ((next && (currentId + 1) * gamesInView < totalGames) || (!next && currentId > 0)) {
			overflow.css({
				left: ((buttonWidth - (currentId + next - !next) * (width - buttonWidth * 2)) * 100 / width)+"%"
			});
		}
	},
	
	/**
	 * Used when the play button is pressed.
	 * @param {jQueryEvent} evt
	 */
	playButtonPressed : function ( evt ) {
		var userAgent = (navigator.userAgent || navigator.vendor || window.opera).toLowerCase();
		
		evt.preventDefault();
		evt.stopImmediatePropagation();
		
		if (/ipad/.test(userAgent) || /iphone/.test(userAgent) || /ipod/.test(userAgent)) {
			if (iosLink) location.assign(iosLink);
			else alert("iOS version isn't available yet. But wait for it!");
		} else if (/android/.test(userAgent)) {
			if (androidLink) location.assign(androidLink);
			else alert("Android version isn't available yet. But wait for it!");
		} else {
			if (webLink) location.assign(webLink);
			else alert("We are working to finish this game and hopefully make you fall in love with it. Please, be patient!");
		}
	},
	
	/**
	 * Called when the window is resized.
	 */
	resize : function ( evt ) {
		var newHeight, screenshotContainer, w, width;
		
		gamesLayout.gamesOverflow.removeAttr("style");
		
		if ((screenshotContainer = $(".game-about-images")).length) {
			w = $window.width();
			width = screenshotContainer.width();
			newHeight = width * gamesLayout.screenshotRatio;
			
			gamesLayout.screenshotOverflow.css({
				height: newHeight
			});
			$(".game-about-images img, .game-about-images iframe").height(newHeight);
			screenshotContainer.height(newHeight + gamesLayout.scrollbarHeight);
			
			$(".game-about-images img").each(function responsiveImage () {
				var img = $(this);
				img.attr("src", img.attr("src").replace(
					/(_medium)?(?=\.[^\.]+$)/,
					(w > tinySize ? "_medium" : "")
				));
			});
			
			// Make sure side content only updates its height when at the side (responsive).
			if (width / screenshotContainer.parent().width() < 0.9) {
				$("div.game-about-content").height(newHeight - gamesLayout.scrollbarHeight);
			} else {
				$("div.game-about-content").removeAttr("style");
			}
		}
	},
	
	/**
	 * Called when a screenshot navigation button is pressed. The <code>next</code>
	 * param indicates whether the "next" (true) or the "previous" (false) button
	 * was pressed.
	 * 
	 * @param {jQueryEvent} evt
	 * @param {Boolean} next
	 */
	screenshotButtonPressed : function ( evt, next ) {
		var currentId, totalScreens;
		
		evt.preventDefault();
		evt.stopImmediatePropagation();
		
		currentId = Number(gamesLayout.screenshotOverflow.css("left").replace("px",""));
		currentId = Math.round(-currentId / $(".game-about-images").width());
		totalScreens = gamesLayout.screenshotOverflow.children().length;
		
		if ((next && currentId < totalScreens - 1) || (!next && currentId > 0)) {
			gamesLayout.screenshotOverflow.css("left",
				((currentId + next - !next) * -100)+"%");
			gamesLayout.screenshotSlider.css("left",
				((currentId + next - !next) / (totalScreens - 1) * (100 - gamesLayout.sliderWidth))+"%");
		}
	}
};


/**
 * {Object} Represents the home layout. This is automatically initiated.
 */
var home = {
	description : null,
	image : null,
	mainMenu : null,
	mainMenuItemHeight : 50,
	siteMotto : null,
	video : null,
	videoRatio : 1.778,
	
	/**
	 * Do not use any other function inside the <code>gamesLayout</code> object without
	 * calling this first.
	 */
	init : function () {
		this.description = $("div.purpose-description");
		this.image = this.description.parent();
		this.mainMenu = $(".home-header .site-menu ul.menu-items");
		//this.mainMenuItemHeight = this.mainMenu.height();
		this.siteMotto = $("p.site-motto");
		this.video = $(".home-content #about iframe");
		
		$("div.big-button-patreon").on("touchend click", function patreonButtonPressed ( evt ) {
			evt.preventDefault();
			evt.stopImmediatePropagation();
			location.assign("{{ '//www.patreon.com/' | append: site.patreon_username }}");
		});
		$("div.big-button-play").on("touchend click", function playButtonPressed ( evt ) {
			evt.preventDefault();
			evt.stopImmediatePropagation();
			location.assign("{{ site.baseurl | append: '/games'}}");
		});
		$(".home-submenu a").on("touchend click", function submenuButtonPressed ( evt ) {
			var anchor = $(this).attr("href");
			
			if (anchor.length) {
				evt.preventDefault();
				evt.stopImmediatePropagation();
				$("html").stop().animate({
					scrollTop : $(anchor).offset().top - ($window.width() >= smallSize ? home.mainMenuItemHeight : 0)
				}, 600);
			}
		});
		
		layout.scrollToggle(
			$("nav.home-submenu"),
			function releaseHomeHeader () {
				home.siteMotto.removeClass("extended");
				home.mainMenu.removeClass("fixed");
			},
			function fixHomeHeader () {
				home.siteMotto.addClass("extended");
				home.mainMenu.addClass("fixed");
			}
		);
		
		$window.resize(this.resize);
		$window.load(this.resize);
		this.resize();
	},
	
	/**
	 * Called when the window is resized.
	 */
	resize : function ( evt ) {
		var divHeight, newHeight, winHeight;
		
		winHeight = window.innerHeight || $window.height();
		
		if ($window.width() >= smallSize)
			winHeight -= home.mainMenuItemHeight;
		
		divHeight = home.description.height() +
			Number(home.description.css("padding-top").replace("px", "")) +
			Number(home.description.css("padding-bottom").replace("px", ""));
		
		home.video.height(Math.min(home.video.width() / home.videoRatio, winHeight));
		home.image.height(newHeight = Math.max(divHeight, winHeight));
		home.description.css("top", ((newHeight - divHeight) / 2)+"px");
	}
};


/**
 * {Object} Represents the general layout. This is automatically initiated.
 */
var layout = (function layoutIIFE () {
	var _backgroundSize = false,
		_backgroundSpeed = 0.35,
		_baseImageName = "{{ site.baseurl }}/images/euphoric_characters_YYY.png",
		_coolBackground,
		_currentImages = 0,
		_maxImageHeight = 602,
		_minImageHeight = 200,
		_numImages = 6,
		_optimalImageHeight = 500,
		_parent,
		_randomImageOrder = {};
	
	/**
	 * When the upper right icon is clicked.
	 */
	function _menuIconClicked ( evt ) {
		evt.preventDefault();
		evt.stopImmediatePropagation();
		$(".site-menu ul.menu-items").toggleClass("show");
	};
	
	/**
	 * Called when the window is resized.
	 */
	function _resize ( evt ) {
		var bgHeight, children, newChildrenStr = "", rightImageCount;
		
		if (_coolBackground) {
			_coolBackground.height(bgHeight = window.innerHeight || $window.height());
			
			if (_coolBackground.width() >= smallSize) {
				_coolBackground.detach();
				if (_backgroundSize)
					_optimalImageHeight = Math.max(_minImageHeight, Math.min(_maxImageHeight, bgHeight * 0.4));
				else
					_optimalImageHeight = _maxImageHeight;
				children = _coolBackground.children();
				rightImageCount = 0 | ($("body").height() * _backgroundSpeed * 2 / _optimalImageHeight) + 1;
				
				while (_currentImages > rightImageCount) {
					children.eq(--_currentImages).remove();
				}
				while (_currentImages < rightImageCount) {
					newChildrenStr += '<div class="'+
						(_currentImages % 2 ?
							('left" style="background-image: url('+
								_baseImageName.replace(/YYY/, "left_"+_randomImageOrder["left"][0 | (_currentImages / 2)])+');') :
							('right" style="background-image: url('+
								_baseImageName.replace(/YYY/, "right_"+_randomImageOrder["right"][0 | (_currentImages / 2)])+');'))+
						'"></div>';
					_currentImages++;
				}
				if (newChildrenStr != "") {
					_coolBackground.append(newChildrenStr);
				}
				
				_coolBackground.children().each(function adjustTop ( i ) {
					$(this).css({
						top: (-$window.scrollTop() * _backgroundSpeed - i * (_maxImageHeight - _optimalImageHeight))+"px",
						backgroundSize: "auto "+_optimalImageHeight+"px"
					});
				});
				_parent.prepend(_coolBackground);
			} else {
				_coolBackground.empty();
				_currentImages = 0;
			}
			
		}
	}
	
	/**
	 * Used to immediately set all scroll events.
	 */
	function _setScrollEvents () {
		this.scrollToggle(
			$(".space-corrector"),
			function growHeader() {
				$(".site-header div.content").removeClass("title-reduced");
			},
			function shrinkHeader() {
				$(".site-header div.content").addClass("title-reduced");
			}
		);
		
		_coolBackground && $window.scroll(
			function adjustBackground ( evt ) {
				_coolBackground.children().each(function adjustTop ( i ) {
					$(this).css(
						"top",
						(-$window.scrollTop() * _backgroundSpeed - i * (_maxImageHeight - _optimalImageHeight))+"px"
					);
				});
			}
		);
	}
	
	return {
		init : function () {
			var i, j, testStyle, tempArray, query;
			
			$window = $(window);
			
			if ((_coolBackground = $(".cool-background")).length) {
				_parent = _coolBackground.parent();
				tempArray = [];
				
				for (i = _numImages - 1 ; i >= 0 ; i --) {
					tempArray[i] = i + 1;
				}
				for (j in {"left" : true, "right": true}) {
					_randomImageOrder[j] = [];
					for (i = _numImages - 1 ; i >= 0 ; i --) {
						_randomImageOrder[j][i] = tempArray.splice(0 | Math.random() * (i + 1), 1);
					}
					tempArray = _randomImageOrder[j].concat();
				}
				
				testStyle = _coolBackground.get(0).style;
				
				if ((testStyle["backgroundSize"] !== undefined) ||
				(testStyle["msBackgroundSize"] !== undefined) ||
				(testStyle["BackgroundSize"] !== undefined)) {
					_backgroundSize = true;
				}
			} else {
				_coolBackground = null;
			}
			
			query = $(".site-menu a.menu-icon");
			if (query.length > 0) {
				query.on("touchend click", _menuIconClicked);
				$window.resize(_resize);
				$window.load(_resize);
				_resize();
			}
			
			$(".home-content").length && home.init();
			$(".games").length && gamesLayout.init();
			$(".posts").length && blogLayout.init();
			
			_setScrollEvents.call(this);
		},
		
		/**
		 * Makes a callback <code>cb()</code> be executed whenever the user scrolls in
		 * a position after the queried object(s). Beware that <code>cb</code> may
		 * therefore be repeatedly called after the user passes any of such objects.
		 * cb's <code>this</code> will be a single object from the query.
		 * 
		 * @param {jQuery} query
		 * @param {Function} cb
		 */
		scrollAfter: function ( query, cb ) {
			function scrollAfterQuery ( evt ) {
				query.each(function checkScroll () {
					var element = $(this);
					if ($window.scrollTop() > element.offset().top + 23) {
						cb.call(element, evt);
					}
				});
			}
			
			if ( query.length === 0 ) return;
			
			$window.scroll(scrollAfterQuery);
			scrollAfterQuery();
		},
		
		/**
		 * Makes a callback <code>cb()</code> be executed whenever the user scrolls in
		 * a position before the queried object(s). Beware that <code>cb</code> may
		 * therefore be repeatedly called before the user passes any of such objects.
		 * cb's <code>this</code> will be a single object from the query.
		 * 
		 * @param {jQuery} query
		 * @param {Function} cb
		 */
		scrollBefore: function ( query, cb ) {
			function scrollBeforeQuery ( evt ) {
				query.each(function checkScroll () {
					var element = $(this);
					if ($window.scrollTop() <= element.offset().top + 3) {
						cb.call(element, evt);
					}
				});
			}
			
			if ( query.length === 0 ) return;
			
			$window.scroll(scrollBeforeQuery);
			scrollBeforeQuery();
		},
		
		/**
		 * Makes two callbacks be triggered alternatively whenever the user scrolls
		 * before and after an element. "Alternatively" means each one won't be called
		 * again until the other one runs. If the <code>query</code> returns multiple
		 * objects, only the first one will be assigned the scroll callbacks. The
		 * callbacks' <code>this</code> will be the element.
		 * 
		 * @param {jQuery} query
		 * @param {Function} beforeCb
		 * @param {Function} afterCb
		 */
		scrollToggle: function ( query, beforeCb, afterCb ) {
			if ( query.length === 0 ) return;
			
			var element = (query.length === 1) ? query : query.eq(0),
				after = false;
			
			this.scrollBefore(element, function scrollToggleBefore ( evt ) {
				if (after) {
					after = false;
					beforeCb.call(this, evt);
				}
			});
			this.scrollAfter(element, function scrollToggleAfter ( evt ) {
				if (!after) {
					after = true;
					afterCb.call(this, evt);
				}
			});
		}
	};
}());

$(layout.init.bind(layout));
