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
        },
        GameAction = {
            CHOICE: Choice.CHOICE,
            SPIN: Choice.SPIN,
            PRIZE: 'prize',

            values: function () {
                return [this.CHOICE, this.SPIN, this.PRIZE];
            }
        };

    function randomInt(boundA, boundB) {
        var minInclusive, maxExclusive;
        if (boundB === undefined) {
            maxExclusive = boundA;
            minInclusive = 0;
        } else {
            maxExclusive = boundB;
            minInclusive = boundA;
        }
        return Math.floor(Math.random() * maxExclusive) + minInclusive;
    }

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

    function State(initialChoicesRemaining, initialSpinsRemaining) {
        var actionsAllowed = [GameAction.CHOICE, GameAction.SPIN],
            choice = null,
            choicesMade = 0,
            choicesRemaining = initialChoicesRemaining || 0,
            spinsMade = 0,
            spinsRemaining = initialSpinsRemaining || 0,
            points = 0,
            prizes = [];

        this.getActionsAllowed = function () {
            return actionsAllowed;
        };

        this.setActionsAllowed = function (actions) {
            actionsAllowed = actions;
        };

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

    function SpinOption(id, name, action, actionsAllowed) {
        this.getId = function () {
            return id;
        };

        this.getName = function () {
            return name;
        };

        this.update = function (state) {
            action(state);
        };

        this.getActionsAllowed = function () {
            return actionsAllowed;
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

    function Wheel(options) {
        // start with the first option selected (a wheel always has something selected)
        var result = options[0];

        this.getResult = function () {
            return result;
        };

        this.spin = function (callback) {
            var index = randomInt(options.length);
            result = options[index];
            callback(result);
        };
    }

    function SpinTheChoice(gameWheel, prizeWheel, bank, state, bankPointsPerTurn) {
        function getActionsAllowed() {
            var actions = [];
            if (state.getChoicesRemaining() > 0) {
                actions.push(GameAction.CHOICE);
            }
            if (state.getSpinsRemaining() > 0) {
                actions.push(GameAction.SPIN);
            }
            return actions;
        }

        function spinGameWheel(callback) {
            gameWheel.spin(function (result) {
                result.update(state);
                state.setActionsAllowed(result.getActionsAllowed() || getActionsAllowed());
                bank.addPoints(bankPointsPerTurn || 1);
                callback();
            });
        }

        this.choose = function (callback) {
            state.setChoice(Choice.CHOICE);
            state.redeemChoice();
            spinGameWheel(callback);
        };

        this.spin = function (callback) {
            state.setChoice(Choice.SPIN);
            state.redeemSpin();
            spinGameWheel(callback);
        };

        this.spinPrizeWheel = function (callback) {
            prizeWheel.spin(function (result) {
                result.update(state);
                state.setActionsAllowed(getActionsAllowed());
                callback();
            });
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

    function createWheelResultSupplier(wheel) {
        return function () {
            var result = wheel.getResult();
            return (result && result.getName()) || '';
        };
    }

    function initApplication() {
        var bank = new PointBank(0),
            bell = new Audio('assets/sound/bell.ogg'),
            display = new Display(),
            state = new State(3, 3),
            spinOptions = [
                new SpinOption('spin', 'Spin', createChoiceSpinHandler(Choice.SPIN, 100)),
                new SpinOption('choice', 'Choice', createChoiceSpinHandler(Choice.CHOICE, 100)),
                new SpinOption('lose_spin', 'Lose a Spin', function (state) {
                    state.addSpin(-1);
                }),
                new SpinOption('spin_again', 'Spin Again', function (state) {
                    state.addSpin();
                }, [GameAction.SPIN]),
                new SpinOption('prize', 'Prize Wheel', function () {
                    bell.play();
                }, [GameAction.PRIZE]),
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
            gameWheel = new Wheel(spinOptions),
            prizeWheel = new Wheel(prizeOptions),
            game = new SpinTheChoice(gameWheel, prizeWheel, bank, state, 10);

        display.register('choices-made', state.getChoicesMade);
        display.register('choices-remaining', state.getChoicesRemaining);
        display.register('spins-made', state.getSpinsMade);
        display.register('spins-remaining', state.getSpinsRemaining);
        display.register('points-accrued', state.getPoints);
        display.register('points-bank', bank.getPoints);
        display.register('wheel-outcome', createWheelResultSupplier(gameWheel));
        display.register('prize-outcome', createWheelResultSupplier(prizeWheel));
        display.registerCustom('prizes-earned', function (element) {
            var prizes = state.getPrizes(),
                item,
                i;
            clearNodes(element);
            if (prizes.length) {
                for (i = 0; i < prizes.length; i += 1) {
                    item = createElementWithText('li', prizes[i].getName());
                    item.className = 'list-group-item';
                    element.appendChild(item);
                }
            } else {
                item = createElementWithText('li', 'None');
                item.className = 'list-group-item placeholder';
                element.appendChild(item);
            }
        });
        display.registerCustom('choose', function (element) {
            element.disabled = state.getActionsAllowed().indexOf(GameAction.CHOICE) === -1;
        });
        display.registerCustom('spin', function (element) {
            element.disabled = state.getActionsAllowed().indexOf(GameAction.SPIN) === -1;
        });
        display.registerCustom('prize-wheel', function (element) {
            element.disabled = state.getActionsAllowed().indexOf(GameAction.PRIZE) === -1;
        });

        document.getElementById('choose').addEventListener('click', function (evt) {
            game.choose(function () {
                display.update();
            });
            evt.preventDefault();
        });
        document.getElementById('spin').addEventListener('click', function (evt) {
            game.spin(function () {
                display.update();
            });
            evt.preventDefault();
        });
        document.getElementById('prize-wheel').addEventListener('click', function (evt) {
            game.spinPrizeWheel(function () {
                display.update();
            });
            evt.preventDefault();
        });

        display.update();
    }

    d.onreadystatechange = function () {
        if (d.readyState === 'interactive') {
            initApplication();
        }
    };
}(document));
