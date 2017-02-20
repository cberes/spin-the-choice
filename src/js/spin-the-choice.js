/*jslint browser: true*/
/*global Audio: false*/
(function (d) {
    'use strict';

    var Choice = {
        CHOICE: 'choice',
        SPIN: 'spin',

        values: function () {
            return [this.CHOICE, this.SPIN];
        }
    };

    function Display() {
        var handlers = [];

        this.register = function (id, valueFunc) {
            this.registerCustom(id, function (element) {
                element.textContent = valueFunc();
            });
        };

        this.registerCustom = function (id, handler) {
            handlers.push({
                element: d.getElementById(id),
                handler: handler
            });
        };

        this.update = function () {
            var i;
            for (i = 0; i < handlers.length; i += 1) {
                handlers[i].handler(handlers[i].element);
            }
        };
    }

    function State() {
        var choice = null,
            choicesMade = 0,
            choicesRemaining = 0,
            spinsMade = 0,
            spinsRemaining = 0,
            points = 0,
            prizes = [];

        this.getChoice = function () {
            return choice;
        };

        this.setChoice = function (nextChoice) {
            choice = nextChoice;
        };

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

    function clearNodes(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    function createElementWithText(type, text) {
        var element = d.createElement(type);
        element.textContent = text;
        return element;
    }

    function createChoiceSpinHandler(choice, points) {
        return function (state) {
            var multiplier = state.getChoice() === choice ? 1 : -1;
            state.addPoints(multiplier * points);
        };
    }

    function initApplication() {
        var bank = new PointBank(0),
            bell = new Audio('assets/sound/bell.ogg'),
            display = new Display(),
            state = new State(),
            spinOptions = [
                new SpinOption('spin', 'Spin', createChoiceSpinHandler(Choice.SPIN, 100)),
                new SpinOption('choice', 'Choice', createChoiceSpinHandler(Choice.CHOICE, 100)),
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

        display.register('choices-made', state.getChoicesMade);
        display.register('choices-remaining', state.getChoicesRemaining);
        display.register('spins-made', state.getSpinsMade);
        display.register('spins-remaining', state.getSpinsRemaining);
        display.register('points-accrued', state.getPoints);
        display.register('points-bank', bank.getPoints);
        display.registerCustom('prizes-earned', function (element) {
            var prizes = state.getPrizes(),
                i;
            clearNodes(element);
            for (i = 0; i < prizes.length; i += 1) {
                element.appendChild(createElementWithText('li', prizes[i].getName()));
            }
        });
        display.update();
        document.getElementById('choose').addEventListener('click', function (evt) {
            state.setChoice(Choice.CHOICE);
            evt.preventDefault();
        });
        document.getElementById('spin').addEventListener('click', function (evt) {
            state.setChoice(Choice.SPIN);
            evt.preventDefault();
        });
        document.getElementById('prize-wheel').addEventListener('click', function (evt) {
            bell.play();
            evt.preventDefault();
        });
    }

    d.onreadystatechange = function () {
        if (d.readyState === 'interactive') {
            initApplication();
        }
    };
}(document));
