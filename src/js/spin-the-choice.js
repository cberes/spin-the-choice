import { Choice } from './choice';
import { GameAction } from './game-action';

export default function SpinTheChoice(gameWheel, prizeWheel, bank, state, bankPointsPerTurn) {
    function getDefaultActionsAllowed() {
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

    function getResultingActionsAllowed(result) {
        var actionsAllowed = result.getActionsAllowed();
        if (actionsAllowed === undefined) {
            return getDefaultActionsAllowed();
        }
        if (typeof actionsAllowed === 'function') {
            return actionsAllowed(state);
        }
        return actionsAllowed;
    }

    function spinGameWheel(preCallback, postCallback) {
        state.setActionsAllowed([]);
        preCallback();
        gameWheel.spin(function (result) {
            result.update(state);
            state.setActionsAllowed(getResultingActionsAllowed(result));
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
            state.setActionsAllowed(getDefaultActionsAllowed());
            postCallback();
        });
    };
};
