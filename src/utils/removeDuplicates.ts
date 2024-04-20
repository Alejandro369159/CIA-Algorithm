import { MatrixNode } from "../types/Node";

export function removeDuplicates(array: MatrixNode[]): MatrixNode[] {
  let uniqueElements: { [key: string]: boolean } = {};
  let result: MatrixNode[] = [];

  for (let i = 0; i < array.length; i++) {
    const currentNode = array[i];
    if (!uniqueElements[currentNode.id]) {
      result.push(currentNode);
      uniqueElements[currentNode.id] = true;
    }
  }

  return result;
}
