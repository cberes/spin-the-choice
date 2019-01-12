import { randomInt } from './helpers';

export default function Wheel(options, animationCallback) {
    // start with the first option selected (a wheel always has something selected)
    var index = 0;

    function getAnimationDelayInMillis(itersRemaining) {
        if (itersRemaining > 15) {
            return 50;
        }
        if (itersRemaining > 5) {
            return 100;
        }
        if (itersRemaining > 1) {
            return 250;
        }
        return 500;
    }

    function animateSpin(iters, callback) {
        index = (index + 1) % options.length;
        if (iters === 0) {
            callback(options[index]);
        } else {
            animationCallback();
            setTimeout(animateSpin, getAnimationDelayInMillis(iters), iters - 1, callback);
        }
    }

    this.getResult = function () {
        return options[index];
    };

    this.spin = function (callback) {
        var iters = 4 * options.length + randomInt(options.length);
        animateSpin(iters, callback);
    };
};
