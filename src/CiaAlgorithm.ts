import { readFile } from "fs";
import { MatrixNode, Node } from "./types/Node";
import { removeDuplicates } from "./utils/removeDuplicates";

// Global state
let trip: MatrixNode[] = [];
let totalCost = 0;
let matrix: MatrixNode[] = [];

function resetGlobalState() {
  trip = [];
  totalCost = 0;
}

// Refactored functions
function getTxtRawData(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function parseDataFromTxt(data: string): Node[] {
  return data
    .split("\n")
    .map((row: string) => {
      const [id, x, y] = row.split(" ");
      return { id: id, x: parseInt(x), y: parseInt(y) };
    })
    .filter((node) => node.x && node.y && node.id);
}

function createDistancesMatrix(nodes: Node[]) {
  return nodes.map((fromNode) => {
    return {
      ...fromNode,
      relations: nodes
        .map((toNode) => ({
          toId: toNode.id,
          distance: Math.hypot(fromNode.x - toNode.x, fromNode.y - toNode.y),
        }))
        .filter((relation) => relation.toId !== fromNode.id),
    };
  });
}

function insertFirstNodeRelationAndReturnNode() {
  // Compare the nodes to get the one with the chepeast relation among them
  let leastDistance = Infinity;
  let selectedNode = matrix[0];
  let closestRelation = matrix[0].relations[0];

  for (let node of matrix) {
    for (let relation of node.relations) {
      if (relation.distance < leastDistance) {
        leastDistance = relation.distance;
        closestRelation = relation;
        selectedNode = node;
      }
    }
  }

  const closestRelationNode = matrix.find(
    (node) => node.id === closestRelation.toId
  );
  if (!closestRelationNode) return;

  // We set the first three nodes in the trip (the cheapest relation and the return to the start)
  const RETURN_MULTIPLIER = 2;
  totalCost += leastDistance * RETURN_MULTIPLIER;
  trip.push(...[selectedNode, closestRelationNode, selectedNode]);
}

function calculateClosestNodeForInsertion() {
  // Get candidates
  const candidates = matrix.filter(
    (node) => !trip.some((_node) => _node.id === node.id)
  );

  // Get the node with the least distance from all possible nodes in trip
  let closestNode = candidates[0];
  let leastDistance = Infinity;

  candidates.forEach((candidate) => {
    removeDuplicates(trip).forEach((node: MatrixNode) => {
      const distanceFromCandidateToNode = candidate.relations.find(
        (relation) => node.id === relation.toId
      )!.distance;
      if (distanceFromCandidateToNode < leastDistance) {
        leastDistance = distanceFromCandidateToNode;
        closestNode = candidate;
      }
    });
  });

  return closestNode;
}

function insertChepeastInsertionPointInTrip(closestNode: MatrixNode) {
  // Calculate the cost of every possible insertion point
  let cheapestCost = Infinity;
  let cheapestPositionIndex = Infinity;
  for (let i = 0; i < trip.length - 2; i++) {
    const cik = trip[i].relations.find(
      (relation) => relation.toId === closestNode.id
    )!.distance;
    const ckj = closestNode.relations.find(
      (relation) => relation.toId === trip[i + 1].id
    )!.distance;
    const cij = trip[i].relations.find(
      (relation) => relation.toId === trip[i + 1].id
    )!.distance;
    const cost = cik + ckj - cij;
    if (cost < cheapestCost) {
      cheapestCost = cost;
      cheapestPositionIndex = i;
    }
  }
  // Add the node to the trip
  totalCost += cheapestCost;
  trip.splice(cheapestPositionIndex + 1, 0, closestNode);
}

function insertRestOfNodesByCia() {
  const RETURN_TO_INITIAL_NODE = 1;
  while (trip.length < matrix.length + RETURN_TO_INITIAL_NODE) {
    // Get closest node
    const closestNode = calculateClosestNodeForInsertion();
    //  Insert in the best position according to CIA
    insertChepeastInsertionPointInTrip(closestNode);
  }
}

// Process for calculating a trip with its cost
async function calculateTrip(): Promise<
  { trip: MatrixNode[]; cost: number } | "error"
> {
  // We get the raw information from the txt
  let txtRawData: string | null = null;
  try {
    txtRawData = await getTxtRawData("../references/101nodes.txt");
  } catch (error) {
    console.error(error);
    return "error";
  }

  // We parse/format the information
  if (!txtRawData) return "error";
  const nodes = parseDataFromTxt(txtRawData);

  // We create the matrix of distances
  matrix = createDistancesMatrix(nodes);
  if (!matrix.length) return "error";

  // We grab the cheapest relation of two nodes
  insertFirstNodeRelationAndReturnNode();

  // Iterate with the cheapest insertion
  insertRestOfNodesByCia();

  return { trip: trip, cost: totalCost };
}

// Main function that does two trip calculations, it starts with the cheapest cost relation but
// it swaps the order of those two to see which one gives a better result
async function main() {
  const result = await calculateTrip();
  if (result === "error") console.error("Hubo un error obteniendo el trip");
  else
    console.log(
      "TRIP: ",
      result.trip.map((node) => node.id),
      result.trip.slice(trip.length - 2, trip.length),
      "COST: ",
      result.cost
    );
}

main();
