export default function Display(d) {
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
};
