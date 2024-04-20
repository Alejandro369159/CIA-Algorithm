"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var removeDuplicates_1 = require("./utils/removeDuplicates");
// Global state
var trip = [];
var totalCost = 0;
var matrix = [];
function resetGlobalState() {
    trip = [];
    totalCost = 0;
}
// Refactored functions
function getTxtRawData(filePath) {
    return new Promise(function (resolve, reject) {
        (0, fs_1.readFile)(filePath, "utf8", function (err, data) {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}
function parseDataFromTxt(data) {
    return data
        .split("\n")
        .map(function (row) {
        var _a = row.split(" "), id = _a[0], x = _a[1], y = _a[2];
        return { id: id, x: parseInt(x), y: parseInt(y) };
    })
        .filter(function (node) { return node.x && node.y && node.id; });
}
function createDistancesMatrix(nodes) {
    return nodes.map(function (fromNode) {
        return __assign(__assign({}, fromNode), { relations: nodes
                .map(function (toNode) { return ({
                toId: toNode.id,
                distance: Math.hypot(fromNode.x - toNode.x, fromNode.y - toNode.y),
            }); })
                .filter(function (relation) { return relation.toId !== fromNode.id; }) });
    });
}
function insertFirstNodeRelationAndReturnNode() {
    // Compare the nodes to get the one with the chepeast relation among them
    var leastDistance = Infinity;
    var selectedNode = matrix[0];
    var closestRelation = matrix[0].relations[0];
    for (var _i = 0, matrix_1 = matrix; _i < matrix_1.length; _i++) {
        var node = matrix_1[_i];
        for (var _a = 0, _b = node.relations; _a < _b.length; _a++) {
            var relation = _b[_a];
            if (relation.distance < leastDistance) {
                leastDistance = relation.distance;
                closestRelation = relation;
                selectedNode = node;
            }
        }
    }
    var closestRelationNode = matrix.find(function (node) { return node.id === closestRelation.toId; });
    if (!closestRelationNode)
        return;
    // We set the first three nodes in the trip (the cheapest relation and the return to the start)
    var RETURN_MULTIPLIER = 2;
    totalCost += leastDistance * RETURN_MULTIPLIER;
    trip.push.apply(trip, [selectedNode, closestRelationNode, selectedNode]);
}
function calculateClosestNodeForInsertion() {
    // Get candidates
    var candidates = matrix.filter(function (node) { return !trip.some(function (_node) { return _node.id === node.id; }); });
    // Get the node with the least distance from all possible nodes in trip
    var closestNode = candidates[0];
    var leastDistance = Infinity;
    candidates.forEach(function (candidate) {
        (0, removeDuplicates_1.removeDuplicates)(trip).forEach(function (node) {
            var distanceFromCandidateToNode = candidate.relations.find(function (relation) { return node.id === relation.toId; }).distance;
            if (distanceFromCandidateToNode < leastDistance) {
                leastDistance = distanceFromCandidateToNode;
                closestNode = candidate;
            }
        });
    });
    return closestNode;
}
function insertChepeastInsertionPointInTrip(closestNode) {
    // Calculate the cost of every possible insertion point
    var cheapestCost = Infinity;
    var cheapestPositionIndex = Infinity;
    var _loop_1 = function (i) {
        var cik = trip[i].relations.find(function (relation) { return relation.toId === closestNode.id; }).distance;
        var ckj = closestNode.relations.find(function (relation) { return relation.toId === trip[i + 1].id; }).distance;
        var cij = trip[i].relations.find(function (relation) { return relation.toId === trip[i + 1].id; }).distance;
        var cost = cik + ckj - cij;
        if (cost < cheapestCost) {
            cheapestCost = cost;
            cheapestPositionIndex = i;
        }
    };
    for (var i = 0; i < trip.length - 2; i++) {
        _loop_1(i);
    }
    // Add the node to the trip
    totalCost += cheapestCost;
    trip.splice(cheapestPositionIndex + 1, 0, closestNode);
}
function insertRestOfNodesByCia() {
    var RETURN_TO_INITIAL_NODE = 1;
    while (trip.length < matrix.length + RETURN_TO_INITIAL_NODE) {
        // Get closest node
        var closestNode = calculateClosestNodeForInsertion();
        //  Insert in the best position according to CIA
        insertChepeastInsertionPointInTrip(closestNode);
    }
}
// Process for calculating a trip with its cost
function calculateTrip() {
    return __awaiter(this, void 0, void 0, function () {
        var txtRawData, error_1, nodes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    txtRawData = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, getTxtRawData("../references/101nodes.txt")];
                case 2:
                    txtRawData = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error(error_1);
                    return [2 /*return*/, "error"];
                case 4:
                    // We parse/format the information
                    if (!txtRawData)
                        return [2 /*return*/, "error"];
                    nodes = parseDataFromTxt(txtRawData);
                    // We create the matrix of distances
                    matrix = createDistancesMatrix(nodes);
                    if (!matrix.length)
                        return [2 /*return*/, "error"];
                    // We grab the cheapest relation of two nodes
                    insertFirstNodeRelationAndReturnNode();
                    // Iterate with the cheapest insertion
                    insertRestOfNodesByCia();
                    return [2 /*return*/, { trip: trip, cost: totalCost }];
            }
        });
    });
}
// Main function that does two trip calculations, it starts with the cheapest cost relation but
// it swaps the order of those two to see which one gives a better result
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, calculateTrip()];
                case 1:
                    result = _a.sent();
                    if (result === "error")
                        console.error("Hubo un error obteniendo el trip");
                    else
                        console.log("TRIP: ", result.trip.map(function (node) { return node.id; }), result.trip.slice(trip.length - 2, trip.length), "COST: ", result.cost);
                    return [2 /*return*/];
            }
        });
    });
}
main();
