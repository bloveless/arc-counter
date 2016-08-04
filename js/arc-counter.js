/*
 * https://gist.github.com/gre/1650294
 * Easing Functions - inspired from http://gizma.com/easing/
 * only considering the t value for the range [0, 1] => [0, 1]
 */
EasingFunctions = {
    // no easing, no acceleration
    linear: function (t) { return t },
    // accelerating from zero velocity
    easeInQuad: function (t) { return t*t },
    // decelerating to zero velocity
    easeOutQuad: function (t) { return t*(2-t) },
    // acceleration until halfway, then deceleration
    easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
    // accelerating from zero velocity
    easeInCubic: function (t) { return t*t*t },
    // decelerating to zero velocity
    easeOutCubic: function (t) { return (--t)*t*t+1 },
    // acceleration until halfway, then deceleration
    easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
    // accelerating from zero velocity
    easeInQuart: function (t) { return t*t*t*t },
    // decelerating to zero velocity
    easeOutQuart: function (t) { return 1-(--t)*t*t*t },
    // acceleration until halfway, then deceleration
    easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
    // accelerating from zero velocity
    easeInQuint: function (t) { return t*t*t*t*t },
    // decelerating to zero velocity
    easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
    // acceleration until halfway, then deceleration
    easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
};

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
            easingFunction: 'easeInOutQuint'
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

        init.call(this);

    };

    // Public Methods

    ArcCounter.prototype.display = function () {
        // display code goes here
    };

    // Private Methods

    /**
     * Initialize the html for each arc counter.
     */
    var init = function () {
        var _ = this;

        // Create the html for each element
        this.elements.forEach(function (element) {

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


            drawCanvas.call(_, canvas);
            var time = new Date();
            canvas.dataset.startTime = time.getTime();

            element.appendChild(canvas);

            _.canvases.push(canvas);
        });

        window.requestAnimationFrame(redrawCanvases.bind(this));
    };

    var redrawCanvases = function()
    {
        var _ = this;
        var stillAnimating = 0;
        var time = new Date();

        this.canvases.forEach(function(canvas) {

            if(parseFloat(canvas.dataset.current) < parseFloat(canvas.dataset.number)) {
                // calculate the next position
                var difference = time.getTime() - parseInt(canvas.dataset.startTime);
                var percentage = difference / _.options.duration;
                canvas.dataset.current = EasingFunctions[_.options.easingFunction](percentage) * canvas.dataset.number;


                if(percentage <= 1) {
                    drawCanvas.call(_, canvas);
                    stillAnimating++;
                }
            }
        });

        if(stillAnimating > 0) {
            window.requestAnimationFrame(redrawCanvases.bind(_));
        }
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

        var smallTextSize = 15;
        context.font = smallTextSize + 'px ' + this.options.fontFace;
        context.fillStyle = this.options.textColor;
        context.textAlign = 'center';
        context.fillText(canvas.dataset.text, canvas.width / 2, (canvas.height / 2) + (smallTextSize * 1.5));

        var largeTextSize = 55;
        context.font = largeTextSize + 'px ' + this.options.fontFace;
        context.fillText(Math.ceil(canvas.dataset.current), canvas.width / 2, (canvas.height / 2));
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

new ArcCounter({
    strokeColor: '#a90d2c',
    fontFace: 'Lato'
});