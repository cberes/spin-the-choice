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

function clearNodes(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function createElementWithText(type, text) {
    var element = document.createElement(type);
    element.textContent = text;
    return element;
}

export { randomInt, clearNodes, createElementWithText };
