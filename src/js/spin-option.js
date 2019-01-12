export default function SpinOption(id, name, action, actionsAllowed) {
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
};
