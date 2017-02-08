/*jslint browser: true*/
(function (w, d) {
    'use strict';

    function initApplication() {
        d.getElementById('main').textContent = 'Ready';
    }

    d.onreadystatechange = function () {
        if (d.readyState === 'interactive') {
            initApplication();
        }
    };
}(window, document));
