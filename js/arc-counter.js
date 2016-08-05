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

    // Utility functions

    /**
     * http://blog.garstasio.com/you-dont-need-jquery/utils/#associate-data-with-an-html-element
     *
     * @type {{set, get}}
     */
        // works in all browsers
    var data = (function () {
            var lastId = 0,
                store = {};

            return {
                set: function (element, info) {
                    var id;
                    if (element.myCustomDataTag === undefined) {
                        id = lastId++;
                        element.myCustomDataTag = id;
                    }
                    store[id] = info;
                },

                merge: function (element, info) {
                    var currentData = store[element.myCustomDataTag];
                    extendObject(currentData, info);
                    store[element.myCustomDataTag] = currentData;
                },

                get: function (element) {
                    return store[element.myCustomDataTag];
                }
            };
        }());

    /**
     * Extend and object
     *
     * @param source
     * @param properties
     * @returns {*}
     */
    function extendObject(source, properties) {
        var property;

        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }

        return source;
    }

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
            this.options = extendObject(defaults, arguments[0]);
        }

        this.elements = document.querySelectorAll(this.options.selector);
        this.canvases = [];
        this.scrollListener = undefined;
        this.resizeListener = undefined;

        init.call(this);

    };

    // Event handlers

    /**
     * Resize the canvases.
     */
    var resizeHandler = function () {

        redrawCanvases.bind(this);

        for (var i = 0; i < this.elements.length; i++) {
            var element = this.elements[i];

            var canvas = element.childNodes[0];
            canvas.width = element.offsetWidth;
            canvas.height = element.offsetWidth;

            drawCanvas.call(this, canvas);
        }
    };

    // Private Methods

    /**
     * Initialize the html for each arc counter.
     */
    var init = function () {

        var _ = this;
        var element, canvas;

        // Create the html for each element
        for (var i = 0; i < this.elements.length; i++) {
            element = this.elements[i];

            canvas = document.createElement('canvas');

            /**
             * Make a square canvas
             */
            canvas.width = element.offsetWidth;
            canvas.height = element.offsetWidth;

            if (element.dataset.background) {
                canvas.style.backgroundColor = element.dataset.background;
            }

            data.set(canvas, {
                number: element.dataset.number,
                max: element.dataset.max,
                text: element.dataset.text,
                current: 0,
                visible: false
            });

            /**
             * Make sure that the container is empty and add the canvas to it
             */
            element.innerHTML = "";
            element.appendChild(canvas);

            this.canvases.push(canvas);

            drawCanvas.call(this, canvas);
        }

        /**
         * Resize the canvases on resize
         */
        if (this.options.responsive) {
            this.resizeListener = setInterval(function () {
                resizeHandler.bind(_)();
            }, 500);
        }

        /**
         * Don't start the animation until the arc counter is visible.
         */
        if (this.options.onlyAnimateOnVisible) {
            this.scrollListener = setInterval(function () {
                shouldStartCanvases.bind(_)();
            }, 250);
        } else {
            /**
             * Start the animation immediately.
             */
            for (var i = 0; i < this.canvases.length; i++) {
                var canvas = this.canvases[i];

                var time = new Date();
                data.merge(canvas, {
                    startTime: time.getTime(),
                    visible: true
                });
            }
        }

        /**
         * Call it once just in case the counters are visible.
         */
        shouldStartCanvases.bind(this)();
        window.requestAnimationFrame(redrawCanvases.bind(this));
    };

    var shouldStartCanvases = function () {

        for (var i = 0; i < this.canvases.length; i++) {
            var canvas = this.canvases[i];

            if (!data.get(canvas).visible) {
                var windowHeight = window.innerHeight;

                /**
                 * If the canvas is in the view then set it's start time
                 * and mark it visible.
                 */
                if (canvas.getBoundingClientRect().top < windowHeight) {
                    var time = new Date();
                    data.merge(canvas, {
                        startTime: time.getTime(),
                        visible: true
                    });
                }
            }
        }
    };

    var redrawCanvases = function () {
        var time = new Date();

        for (var i = 0; i < this.canvases.length; i++) {
            var canvas = this.canvases[i];

            if (data.get(canvas).visible) {

                if (data.get(canvas).current < data.get(canvas).number) {
                    // calculate the next position
                    var difference = time.getTime() - parseInt(data.get(canvas).startTime);
                    var percentage = difference / this.options.duration;

                    data.merge(canvas, {
                        current: EasingFunctions[this.options.easingFunction](percentage) * data.get(canvas).number
                    });

                    if (percentage <= 1) {
                        drawCanvas.call(this, canvas);
                    }
                }
            }
        }

        window.requestAnimationFrame(redrawCanvases.bind(this));
    };

    var drawCanvas = function (canvas) {
        var endStop = (1.5 - (2 * (data.get(canvas).current / data.get(canvas).max))) * Math.PI;

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
        context.fillText(data.get(canvas).text, canvas.width / 2, (canvas.height / 2) + (smallTextSize * 1.5));

        var largeTextSize = canvas.height / 5;
        context.font = largeTextSize + 'px ' + this.options.fontFace;
        context.fillText(Math.round(data.get(canvas).current), canvas.width / 2, (canvas.height / 2));
    };
})();
