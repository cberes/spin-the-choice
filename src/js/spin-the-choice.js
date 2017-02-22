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
            PRIZE_WHEEL: 'prize_wheel',
            GAME_OVER: 'game_over',

            values: function () {
                return [this.CHOICE, this.SPIN, this.PRIZE_WHEEL, this.GAME_OVER];
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
                id: id,
                element: d.getElementById(id),
                handler: handler
            });
        };

        this.update = function (ids) {
            var handlersToInvoke = ids === undefined ? handlers : handlers.filter(function (handler) {
                return ids.indexOf(handler.id) !== -1;
            });
            handlersToInvoke.forEach(function (handler) {
                handler.handler(handler.element);
            });
        };
    }

    function State(initialChoicesRemaining, initialSpinsRemaining) {
        var actionsAllowed,
            choice,
            choicesMade,
            choicesRemaining,
            spinsMade,
            spinsRemaining,
            points,
            prizes;

        this.reset = function () {
            actionsAllowed = [GameAction.CHOICE, GameAction.SPIN];
            choice = null;
            choicesMade = 0;
            choicesRemaining = initialChoicesRemaining || 0;
            spinsMade = 0;
            spinsRemaining = initialSpinsRemaining || 0;
            points = 0;
            prizes = [];
        };

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

        this.reset();
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
            if (actions.length === 0) {
                actions.push(GameAction.GAME_OVER);
            }
            return actions;
        }

        function spinGameWheel(preCallback, postCallback) {
            state.setActionsAllowed([]);
            preCallback();
            gameWheel.spin(function (result) {
                result.update(state);
                state.setActionsAllowed(result.getActionsAllowed() || getActionsAllowed());
                bank.addPoints(bankPointsPerTurn || 1);
                postCallback();
            });
        }

        this.choose = function (preCallback, postCallback) {
            state.setChoice(Choice.CHOICE);
            state.redeemChoice();
            spinGameWheel(preCallback, postCallback);
        };

        this.spin = function (preCallback, postCallback) {
            state.setChoice(Choice.SPIN);
            state.redeemSpin();
            spinGameWheel(preCallback, postCallback);
        };

        this.spinPrizeWheel = function (preCallback, postCallback) {
            state.setActionsAllowed([]);
            preCallback();
            prizeWheel.spin(function (result) {
                result.update(state);
                state.setActionsAllowed(getActionsAllowed());
                postCallback();
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

    function createGameActionHandler(state, action) {
        return function (element) {
            element.disabled = state.getActionsAllowed().indexOf(action) === -1;
        };
    }

    function initApplication() {
        var bank = new PointBank(0),
            bell = new Audio('assets/sound/bell.ogg'),
            display = new Display(),
            buttonUpdate = function () {
                display.update(['choose', 'spin', 'prize-wheel', 'new-game']);
            },
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
                }, [GameAction.PRIZE_WHEEL]),
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
            gameWheel = new Wheel(spinOptions, function () {
                display.update(['wheel-outcome']);
            }),
            prizeWheel = new Wheel(prizeOptions, function () {
                display.update(['prize-outcome']);
            }),
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
        display.registerCustom('choose', createGameActionHandler(state, GameAction.CHOICE));
        display.registerCustom('spin', createGameActionHandler(state, GameAction.SPIN));
        display.registerCustom('prize-wheel', createGameActionHandler(state, GameAction.PRIZE_WHEEL));
        display.registerCustom('new-game', createGameActionHandler(state, GameAction.GAME_OVER));

        document.getElementById('choose').addEventListener('click', function (evt) {
            game.choose(buttonUpdate, display.update);
            evt.preventDefault();
        });
        document.getElementById('spin').addEventListener('click', function (evt) {
            game.spin(buttonUpdate, display.update);
            evt.preventDefault();
        });
        document.getElementById('prize-wheel').addEventListener('click', function (evt) {
            game.spinPrizeWheel(buttonUpdate, display.update);
            evt.preventDefault();
        });
        document.getElementById('new-game').addEventListener('click', function (evt) {
            state.reset();
            display.update();
            evt.preventDefault();
        });
        document.getElementById('close-intro').addEventListener('click', function (evt) {
            document.getElementById('intro').hidden = true;
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
