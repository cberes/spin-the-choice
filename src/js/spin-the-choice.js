/*jslint browser: true*/
(function (d) {
    'use strict';

    function State() {
        var choicesMade = 0,
            choicesRemaining = 0,
            spinsMade = 0,
            spinsRemaining = 0,
            points = 0,
            prizes = [];

        this.getChoicesMade = function () {
            return choicesMade;
        };

        this.redeemChoice = function () {
            choicesMade += 1;
            choicesRemaining -= 1;
        };

        this.getChoicesRemaining = function () {
            return choicesRemaining;
        };

        this.addChoice = function (delta) {
            choicesRemaining += (delta || 1);
        };

        this.getSpinsMade = function () {
            return spinsMade;
        };

        this.redeemSpin = function () {
            spinsMade += 1;
            spinsRemaining -= 1;
        };

        this.getSpinsRemaining = function () {
            return spinsRemaining;
        };

        this.addSpin = function (delta) {
            spinsRemaining += (delta || 1);
        };

        this.getPoints = function () {
            return points;
        };

        this.addPoints = function (newPoints) {
            points += newPoints;
        };

        this.getPrizes = function () {
            return prizes;
        };

        this.addPrize = function (prize) {
            prizes.push(prize);
        };
    }

    function SpinOption(id, name, action) {
        this.getId = function () {
            return id;
        };

        this.getName = function () {
            return name;
        };

        this.update = function (state) {
            action(state);
        };
    }

    function PrizeRef(id, name, points) {
        this.getId = function () {
            return id;
        };

        this.getName = function () {
            return name;
        };

        this.getPoints = function () {
            return points;
        };
    }

    function Prize(id, name, points, action) {
        this.getId = function () {
            return id;
        };

        this.getName = function () {
            return name;
        };

        this.getPoints = function () {
            return points;
        };

        this.update = action || function (state) {
            state.addPrize(new PrizeRef(id, name, points));
        };
    }

    function PointBank(initialBank) {
        var bank = initialBank || 0;

        this.getPoints = function () {
            return bank;
        };

        this.addPoints = function (delta) {
            bank += delta;
        };

        this.reset = function () {
            bank = 0;
        };
    }

    function SpinTheChoice(spinOptions, prizeOptions, bank, state) {
        this.choose = function () {
            state.redeemChoice();
        };

        this.spin = function () {
            state.redeemSpin();
        };
    }

    function initApplication() {
        var bank = new PointBank(0),
            bell = new Audio(''),
            state = new State(),
            spinOptions = [
                new SpinOption('spin', 'Spin', function (state) {
                    // TODO
                }),
                new SpinOption('choice', 'Choice', function (state) {
                    // TODO
                }),
                new SpinOption('lose_spin', 'Lose a Spin', function (state) {
                    state.addSpin(-1);
                }),
                new SpinOption('spin_again', 'Spin Again', function (state) {
                    // TODO like Free Spin? But forced to spin on the next turn?
                    // TODO does this affect the spin totals?
                    state.addSpin();
                }),
                new SpinOption('prize', 'Prize Winner', function (state) {
                    // TODO spin prize wheel
                    bell.play();
                }),
                new SpinOption('free_spin', 'Free Spin', function (state) {
                    state.addSpin();
                }),
                new SpinOption('lose_choice', 'Lose a Choice', function (state) {
                    state.addChoice(-1);
                }),
                new SpinOption('free_choice', 'Free Choice', function (state) {
                    state.addChoice();
                })
            ],
            prizeOptions = [
                new Prize('free_spin', 'Free Spin', 0, function (state) {
                    state.addSpin();
                }),
                new Prize('winnebago', 'Winnebago', 10000),
                new Prize('free_choice', 'Free Choice', 0, function (state) {
                    state.addChoice();
                }),
                new Prize('washer_dryer', 'Washer Dryer', 1000),
                new Prize('mazda', 'Mazda', 5000),
                new Prize('microwave', 'Microwave Oven', 500),
                new Prize('points', 'Point Bank', 0, function (state) {
                    state.addPoints(bank.getPoints());
                    bank.reset();
                }),
                new Prize('mercedes', 'Mercedes', 7500),
            ],
            game = new SpinTheChoice(spinOptions, prizeOptions, bank, state);
        d.getElementById('main').textContent = 'Ready';
    }

    d.onreadystatechange = function () {
        if (d.readyState === 'interactive') {
            initApplication();
        }
    };
}(document));
