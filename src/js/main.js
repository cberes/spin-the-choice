'use strict';

import Bell from '../resources/bell.ogg';
import { Choice } from './choice';
import Display from './display';
import { GameAction } from './game-action';
import { clearNodes, createElementWithText } from './helpers';
import PointBank from './point-bank';
import Prize from './prize';
import SpinOption from './spin-option';
import SpinTheChoice from './spin-the-choice';
import State from './state';
import Wheel from './wheel';

function initHeader(d, id) {
    function isIntroClosedCookiePresent() {
        return d.cookie.replace(/(?:(?:^|.*;\s*)intro_closed\s*\=\s*([^;]*).*$)|^.*$/, "$1") === 'true';
    }

    function hideIfClosed() {
        var elem = d.getElementById(id);
        if (elem) {
            elem.hidden = isIntroClosedCookiePresent();
        }
    }

    hideIfClosed();
}

function initApplication(d) {
    function setIntroClosedCookie() {
        d.cookie = 'intro_closed=true; max-age=2592000'; // 1 month
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

    function start() {
        var bank = new PointBank(0),
            bell = new Audio(Bell),
            display = new Display(d),
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
                    if (state.getChoice() === Choice.CHOICE) {
                        state.addChoice();
                    } else {
                        state.addSpin();
                    }
                }, function (state) {
                    return [state.getChoice()];
                }),
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
                new Prize('mercedes', 'Mercedes', 7500)
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
        display.register('points-accrued', state.getTotalScore);
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

        d.getElementById('choose').addEventListener('click', function (evt) {
            game.choose(buttonUpdate, display.update);
            evt.preventDefault();
        });
        d.getElementById('spin').addEventListener('click', function (evt) {
            game.spin(buttonUpdate, display.update);
            evt.preventDefault();
        });
        d.getElementById('prize-wheel').addEventListener('click', function (evt) {
            game.spinPrizeWheel(buttonUpdate, display.update);
            evt.preventDefault();
        });
        d.getElementById('new-game').addEventListener('click', function (evt) {
            state.reset();
            display.update();
            evt.preventDefault();
        });
        d.getElementById('close-intro').addEventListener('click', function (evt) {
            d.getElementById('intro').hidden = true;
            setIntroClosedCookie();
            evt.preventDefault();
        });

        display.update();
    }

    start();
}

initHeader(document, 'intro');
initApplication(document);
