import PrizeRef from './prize-ref';

export default function (id, name, points, action) {
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
};
