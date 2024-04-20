"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeDuplicates = void 0;
function removeDuplicates(array) {
    var uniqueElements = {};
    var result = [];
    for (var i = 0; i < array.length; i++) {
        var currentNode = array[i];
        if (!uniqueElements[currentNode.id]) {
            result.push(currentNode);
            uniqueElements[currentNode.id] = true;
        }
    }
    return result;
}
exports.removeDuplicates = removeDuplicates;
