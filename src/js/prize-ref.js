export default function PrizeRef(id, name, points) {
    this.getId = function () {
        return id;
    };

    this.getName = function () {
        return name;
    };

    this.getPoints = function () {
        return points;
    };
};
