export default class Heap<S> {
    protected nodes: S[] = [];
    protected condition: (a: S, b: S) => boolean;
    /**
     * Creates a heap with the provided condition
     * @param condition Should return true if a should be higher in the tree than b
     */
    public constructor(condition: (a: S, b: S) => boolean) {
        this.condition = condition;
    }

    /**
     * Inserts a new value to the heap
     * @param value The value to insert
     */
    public insert(value: S): void {
        let index = this.nodes.length;
        this.nodes.push(value);

        while (index > 0) {
            // Get parent data
            const parentIndex = this.getParent(index);
            const parentValue = this.nodes[parentIndex];

            // Check if the heap condition is met
            if (this.condition(parentValue, value)) return;

            // If not, swap the elements and loop for the parent
            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }

    /**
     * Extracts the top value from the heap
     * @returns The top value
     */
    public extract(): S {
        // Get the value to return
        const value = this.nodes[0];

        // Get the last value to replace the root
        const last = this.nodes.pop();

        if (this.nodes.length == 0) return value;

        // Restore heap condition
        (this.nodes[0] as any) = last;
        let index = 0;
        while (index < this.nodes.length) {
            // Retrieve both children
            const leftChildIndex = this.getLeft(index);
            const leftChild = this.nodes[leftChildIndex];
            const rightChildIndex = this.getRight(index);
            const rightChild = this.nodes[rightChildIndex];

            // Check what child should be higher in the tree, and select as child
            if (leftChild === undefined) return value;
            const leftHigher =
                rightChild === undefined || this.condition(leftChild, rightChild);
            const childIndex = leftHigher ? leftChildIndex : rightChildIndex;
            const child = leftHigher ? leftChild : rightChild;

            // Check if the heap condition is met
            if (this.condition(last as S, child)) return value;

            // If not, swap the elements and loop for the child
            this.swap(index, childIndex);
            index = childIndex;
        }
        return value;
    }

    // Some helper methods
    protected getLeft(index: number): number {
        return (index + 1) * 2 - 1;
    }
    protected getRight(index: number): number {
        return (index + 1) * 2;
    }
    protected getParent(index: number): number {
        return Math.floor((index - 1) / 2);
    }
    protected swap(index1: number, index2: number): void {
        const temp = this.nodes[index1];
        this.nodes[index1] = this.nodes[index2];
        this.nodes[index2] = temp;
    }
}
