export default function PointBank(initialBank) {
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
};
