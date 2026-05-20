/**
 * Algorithm implementations
 * Each algorithm tracks execution steps for visualization
 */

class Algorithm {
    constructor(name) {
        this.name = name;
        this.steps = [];
        this.solution = [];
        this.callStack = [];
    }

    reset() {
        this.steps = [];
        this.solution = [];
        this.callStack = [];
    }

    addStep(step) {
        this.steps.push({
            ...step,
            timestamp: this.steps.length,
        });
    }
}

/**
 * Combination Sum Algorithm
 * Find all combinations that sum to target
 */
class CombinationSum extends Algorithm {
    constructor() {
        super('Combination Sum');
    }

    solve(nums, target) {
        this.reset();
        const ans = [];
        const subset = [];

        this.addStep({
            type: 'init',
            message: `Starting with target=${target}, nums=${nums}`,
            subset: [],
            callDepth: 0,
        });

        this.backtrack(nums, target, 0, ans, subset, 0);

        this.solution = ans;
        this.addStep({
            type: 'complete',
            message: `Found ${ans.length} combinations`,
            subset: [],
            callDepth: 0,
        });

        return ans;
    }

    backtrack(nums, target, index, ans, subset, currsum) {
        this.callStack.push({ index, currsum });
        const depth = this.callStack.length - 1;
        
        this.addStep({
            type: 'enter',
            message: `backtrack(index=${index}, sum=${currsum}, subset=[${subset}])`,
            subset: [...subset],
            callDepth: depth,
            index,
            currsum,
        });

        if (currsum === target) {
            ans.push([...subset]);
            this.addStep({
                type: 'solution',
                message: `Found solution: [${subset}]`,
                subset: [...subset],
                callDepth: depth,
            });
        }

        if (currsum >= target || index >= nums.length) {
            if (currsum > target) {
                this.addStep({
                    type: 'prune',
                    message: `Prune: sum ${currsum} > target ${target}`,
                    subset: [...subset],
                    callDepth: depth,
                });
            }
            if (index >= nums.length) {
                this.addStep({
                    type: 'prune',
                    message: `Prune: reached end of array`,
                    subset: [...subset],
                    callDepth: depth,
                });
            }
            this.callStack.pop();
            return;
        }

        // Include current element
        subset.push(nums[index]);
        this.addStep({
            type: 'include',
            message: `Include ${nums[index]}, subset=[${subset}]`,
            subset: [...subset],
            callDepth: depth,
            element: nums[index],
        });

        this.backtrack(nums, target, index, ans, subset, currsum + nums[index]);

        subset.pop();
        this.addStep({
            type: 'backtrack',
            message: `Backtrack, remove ${nums[index]}, subset=[${subset}]`,
            subset: [...subset],
            callDepth: depth,
            element: nums[index],
        });

        // Move to next element
        this.backtrack(nums, target, index + 1, ans, subset, currsum);
        
        this.callStack.pop();
    }
}

/**
 * Subsets Algorithm
 * Find all subsets of an array
 */
class Subsets extends Algorithm {
    constructor() {
        super('Subsets');
    }

    solve(nums) {
        this.reset();
        const ans = [];
        const subset = [];

        this.addStep({
            type: 'init',
            message: `Starting with nums=${nums}`,
            subset: [],
            callDepth: 0,
        });

        this.backtrack(nums, 0, ans, subset);

        this.solution = ans;
        this.addStep({
            type: 'complete',
            message: `Found ${ans.length} subsets (2^${nums.length})`,
            subset: [],
            callDepth: 0,
        });

        return ans;
    }

    backtrack(nums, index, ans, subset) {
        this.callStack.push({ index });
        const depth = this.callStack.length - 1;

        this.addStep({
            type: 'enter',
            message: `backtrack(index=${index}, subset=[${subset}])`,
            subset: [...subset],
            callDepth: depth,
            index,
        });

        // Add current subset to result
        ans.push([...subset]);
        this.addStep({
            type: 'solution',
            message: `Add subset: [${subset}]`,
            subset: [...subset],
            callDepth: depth,
        });

        if (index === nums.length) {
            this.addStep({
                type: 'prune',
                message: `Reached end of array`,
                subset: [...subset],
                callDepth: depth,
            });
            this.callStack.pop();
            return;
        }

        for (let i = index; i < nums.length; i++) {
            subset.push(nums[i]);
            this.addStep({
                type: 'include',
                message: `Include ${nums[i]}, subset=[${subset}]`,
                subset: [...subset],
                callDepth: depth,
                element: nums[i],
            });

            this.backtrack(nums, i + 1, ans, subset);

            subset.pop();
            this.addStep({
                type: 'backtrack',
                message: `Backtrack, remove ${nums[i]}, subset=[${subset}]`,
                subset: [...subset],
                callDepth: depth,
                element: nums[i],
            });
        }
        
        this.callStack.pop();
    }
}

/**
 * Algorithm factory
 */
const AlgorithmFactory = {
    'combination-sum': () => new CombinationSum(),
    'subsets': () => new Subsets(),
};
