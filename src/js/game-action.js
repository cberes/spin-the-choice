import { Choice } from './choice';

export var GameAction = {
    CHOICE: Choice.CHOICE,
    SPIN: Choice.SPIN,
    PRIZE_WHEEL: 'prize_wheel',
    GAME_OVER: 'game_over',

    values: function () {
        return [this.CHOICE, this.SPIN, this.PRIZE_WHEEL, this.GAME_OVER];
    }
};
