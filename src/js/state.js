import { GameAction } from './game-action';

export default function State(initialChoicesRemaining, initialSpinsRemaining) {
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
        this.addChoice(-1);
    };

    this.getChoicesRemaining = function () {
        return choicesRemaining;
    };

    this.addChoice = function (delta) {
        choicesRemaining += (delta || 1);
        if (choicesRemaining < 0) {
            choicesRemaining = 0;
        }
    };

    this.getSpinsMade = function () {
        return spinsMade;
    };

    this.redeemSpin = function () {
        spinsMade += 1;
        this.addSpin(-1);
    };

    this.getSpinsRemaining = function () {
        return spinsRemaining;
    };

    this.addSpin = function (delta) {
        spinsRemaining += (delta || 1);
        if (spinsRemaining < 0) {
            spinsRemaining = 0;
        }
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

    this.getTotalScore = function () {
        return prizes.map(function (prize) {
            return prize.getPoints();
        }).reduce(function (acc, val) {
            return acc + val;
        }, points);
    };

    this.reset();
};
