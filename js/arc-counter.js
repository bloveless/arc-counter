/*
 * https://gist.github.com/gre/1650294
 * Easing Functions - inspired from http://gizma.com/easing/
 * only considering the t value for the range [0, 1] => [0, 1]
 */
EasingFunctions = {
    // no easing, no acceleration
    linear: function (t) {
        return t
    },
    // accelerating from zero velocity
    easeInQuad: function (t) {
        return t * t
    },
    // decelerating to zero velocity
    easeOutQuad: function (t) {
        return t * (2 - t)
    },
    // acceleration until halfway, then deceleration
    easeInOutQuad: function (t) {
        return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    },
    // accelerating from zero velocity
    easeInCubic: function (t) {
        return t * t * t
    },
    // decelerating to zero velocity
    easeOutCubic: function (t) {
        return (--t) * t * t + 1
    },
    // acceleration until halfway, then deceleration
    easeInOutCubic: function (t) {
        return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    },
    // accelerating from zero velocity
    easeInQuart: function (t) {
        return t * t * t * t
    },
    // decelerating to zero velocity
    easeOutQuart: function (t) {
        return 1 - (--t) * t * t * t
    },
    // acceleration until halfway, then deceleration
    easeInOutQuart: function (t) {
        return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t
    },
    // accelerating from zero velocity
    easeInQuint: function (t) {
        return t * t * t * t * t
    },
    // decelerating to zero velocity
    easeOutQuint: function (t) {
        return 1 + (--t) * t * t * t * t
    },
    // acceleration until halfway, then deceleration
    easeInOutQuint: function (t) {
        return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t
    }
};

/**
 * https://github.com/bloveless/arc-counter
 *
 * Brennon Loveless
 * August 5, 2016
 */
(function () {

    // Define our constructor
    this.ArcCounter = function () {

        var defaults = {
            selector: '.arc-counter',
            strokeColor: '#fff',
            fillColor: 'rgba(0, 0, 0, 0.1)',
            textColor: '#000',
            fontFace: 'Calibri',
            duration: 3000,
            easingFunction: 'easeInOutQuint',
            responsive: true,
            onlyAnimateOnVisible: true
        };

        // Allow initialization without arguments. When defaults are okay.
        if (!arguments[0]) {
            arguments[0] = {};
        }

        if (arguments[0] && typeof arguments[0] === "object") {
            this.options = extendDefaults(defaults, arguments[0]);
        }

        this.elements = document.querySelectorAll(this.options.selector);
        this.canvases = [];
        this.scrollListener = undefined;
        this.resizeListener = undefined;

        init.call(this);

    };

    // Event handlers

    /**
     * So that the scroll isn't fired a hundred times a second I remove the scroll event listener,
     * and re-add it after 500ms.
     */
    var scrollHandler = function () {
        window.removeEventListener('scroll', this.scrollListener);

        var _ = this;

        shouldStartCanvases.bind(this)();

        setTimeout(function () {
            window.addEventListener('scroll', _.scrollListener);
        }, 500);
    };

    var shouldStartCanvases = function () {
        for (var i = 0; i < this.canvases.length; i++) {
            var canvas = this.canvases[i];

            if (!canvas.dataset.visible) {
                var windowHeight = window.innerHeight;

                /**
                 * If the canvas is in the view then set it's start time
                 * and mark it visible.
                 */
                if (canvas.getBoundingClientRect().top < windowHeight) {
                    var time = new Date();
                    canvas.dataset.startTime = time.getTime();
                    canvas.dataset.visible = true;
                }
            }
        }
    };

    /**
     * So that the resize isn't called a hundred time a second I remove the scroll event listener,
     * and re-add it after 250ms.
     */
    var resizeHandler = function () {
        window.removeEventListener('resize', this.resizeListener);

        redrawCanvases.bind(this);

        for (var i = 0; i < this.elements.length; i++) {
            var element = this.elements[i];

            var canvas = element.childNodes[0];
            canvas.width = element.offsetWidth;
            canvas.height = element.offsetWidth;

            drawCanvas.call(this, canvas);
        }

        setTimeout(function () {
            window.addEventListener('resize', _.resizeListener);
        }, 100);
    };

    // Private Methods

    /**
     * Initialize the html for each arc counter.
     */
    var init = function () {
        // Create the html for each element
        for (var i = 0; i < this.elements.length; i++) {
            var element = this.elements[i];

            var canvas = document.createElement('canvas');

            /**
             * Make a square canvas
             */
            canvas.width = element.offsetWidth;
            canvas.height = element.offsetWidth;

            if (element.dataset.background) {
                canvas.style.backgroundColor = element.dataset.background;
            }

            canvas.dataset.number = element.dataset.number;
            canvas.dataset.max = element.dataset.max;
            canvas.dataset.text = element.dataset.text;
            canvas.dataset.current = 0;


            drawCanvas.call(this, canvas);

            /**
             * Make sure that the container is empty and add the canvas to it
             */
            element.innerHTML = "";
            element.appendChild(canvas);

            this.canvases.push(canvas);
        }

        /**
         * Resize the canvases on resize
         */
        if (this.options.responsive) {
            this.resizeListener = resizeHandler.bind(this);
            window.addEventListener('resize', this.resizeListener, false);
        }

        /**
         * Don't start the animation until the arc counter is visible.
         */
        if (this.options.onlyAnimateOnVisible) {
            this.scrollListener = scrollHandler.bind(this);
            window.addEventListener('scroll', this.scrollListener);
        } else {
            for (var i = 0; i < this.canvases.length; i++) {
                var canvas = this.canvases[i];

                var time = new Date();
                canvas.dataset.startTime = time.getTime();
                canvas.dataset.visible = true;
            }
        }

        shouldStartCanvases.bind(this)();
        window.requestAnimationFrame(redrawCanvases.bind(this));
    };

    var redrawCanvases = function () {
        var time = new Date();

        for (var i = 0; i < this.canvases.length; i++) {
            var canvas = this.canvases[i];

            if (canvas.dataset.visible) {
                if (parseFloat(canvas.dataset.current) < parseFloat(canvas.dataset.number)) {
                    // calculate the next position
                    var difference = time.getTime() - parseInt(canvas.dataset.startTime);
                    var percentage = difference / this.options.duration;
                    canvas.dataset.current = EasingFunctions[this.options.easingFunction](percentage) * canvas.dataset.number;

                    if (percentage <= 1) {
                        drawCanvas.call(this, canvas);
                    }
                }
            }
        }

        window.requestAnimationFrame(redrawCanvases.bind(this));
    };

    var drawCanvas = function (canvas) {
        var endStop = (1.5 - (2 * (canvas.dataset.current / canvas.dataset.max))) * Math.PI;

        var context = canvas.getContext('2d');

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.beginPath();
        context.arc(canvas.width / 2, canvas.height / 2, canvas.width / 3, 0, 2 * Math.PI);
        context.lineWidth = canvas.width / 10;
        context.strokeStyle = this.options.fillColor;
        context.stroke();

        context.beginPath();
        context.arc(canvas.width / 2, canvas.height / 2, canvas.width / 3, 1.5 * Math.PI, endStop, true);
        context.lineWidth = canvas.width / 20;
        context.strokeStyle = this.options.strokeColor;
        context.stroke();

        var smallTextSize = canvas.height / 17;
        context.font = smallTextSize + 'px ' + this.options.fontFace;
        context.fillStyle = this.options.textColor;
        context.textAlign = 'center';
        context.fillText(canvas.dataset.text, canvas.width / 2, (canvas.height / 2) + (smallTextSize * 1.5));

        var largeTextSize = canvas.height / 5;
        context.font = largeTextSize + 'px ' + this.options.fontFace;
        context.fillText(Math.round(canvas.dataset.current), canvas.width / 2, (canvas.height / 2));
    };

    function extendDefaults(source, properties) {
        var property;

        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }

        return source;
    }

})();
