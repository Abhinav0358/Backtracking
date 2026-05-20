/**
 * Main Application
 * Orchestrates algorithm execution, visualization, and UI updates
 */

class AlgorithmVisualizer {
    constructor() {
        // DOM Elements
        this.problemButtons = document.querySelectorAll('.problem-btn');
        this.visualizeBtn = document.getElementById('visualize-btn');
        this.numbersInput = document.getElementById('numbers-input');
        this.targetInput = document.getElementById('target-input');
        this.speedSlider = document.getElementById('speed-slider');
        this.speedValue = document.getElementById('speed-value');
        this.solutionOutput = document.getElementById('solution-output');
        this.statsOverlay = document.getElementById('stats-overlay');
        this.problemTitle = document.getElementById('problem-title');
        this.targetGroup = document.getElementById('target-group');

        this.canvas = document.getElementById('visualization-canvas');
        this.visualizer = new BacktrackingVisualizer(this.canvas);
        
        // Set up stats update callback
        this.visualizer.onStepChange = (progress) => this.updateStats();
        
        // Set up solution found callback
        this.visualizer.onSolutionFound = (solution) => this.addSolutionItem(solution);

        // State
        this.currentProblem = 'combination-sum';
        this.algorithm = null;

        // Problem configs
        this.problemConfigs = {
            'combination-sum': {
                title: 'Combination Sum',
                description: 'Find all combinations that sum to target',
                input: { nums: '2, 3, 6, 7', target: 7 },
                hasTarget: true,
            },
            'subsets': {
                title: 'Subsets',
                description: 'Generate all subsets of an array',
                input: { nums: '1, 2, 3', target: null },
                hasTarget: false,
            },
        };

        this.initializeEventListeners();
        this.initializeUI();
        this.loadProblem('combination-sum');
    }
    
    initializeUI() {
        // Initialize speed value display
        this.speedValue.textContent = `${this.speedSlider.value}x`;
    }

    initializeEventListeners() {
        // Problem selection - desktop sidebar
        this.problemButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const problemId = e.currentTarget.dataset.problem;
                this.switchProblem(problemId);
            });
        });

        // Problem selection - mobile dropdown
        const mobileSelector = document.getElementById('mobile-problem-selector');
        if (mobileSelector) {
            mobileSelector.addEventListener('change', (e) => {
                this.switchProblem(e.target.value);
            });
        }

        // Theme toggle - mobile
        const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
        if (mobileThemeToggle) {
            mobileThemeToggle.addEventListener('click', () => {
                window.themeManager.toggleTheme();
            });
        }

        // Visualization
        this.visualizeBtn.addEventListener('click', () => this.runVisualization());

        // Speed control
        this.speedSlider.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            this.visualizer.setSpeed(speed);
            this.speedValue.textContent = `${speed}x`;
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.runVisualization();
            if (e.key === ' ') {
                e.preventDefault();
                this.visualizer.isPlaying
                    ? this.visualizer.pause()
                    : this.visualizer.play();
            }
            if (e.key === 'ArrowRight') this.visualizer.nextStep();
            if (e.key === 'ArrowLeft' && this.visualizer.currentStepIndex > 0) {
                this.visualizer.currentStepIndex--;
                this.visualizer.redraw();
            }
            if (e.key === 'f' || e.key === 'F') this.visualizer.fitToScreen();
        });
    }

    switchProblem(problemId) {
        this.currentProblem = problemId;
        this.loadProblem(problemId);

        // Update UI - desktop buttons
        this.problemButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.problem === problemId);
        });

        // Update UI - mobile selector
        const mobileSelector = document.getElementById('mobile-problem-selector');
        if (mobileSelector) {
            mobileSelector.value = problemId;
        }
    }

    loadProblem(problemId) {
        const config = this.problemConfigs[problemId];
        const input = config.input;

        // Update UI
        this.problemTitle.textContent = config.title;
        this.numbersInput.value = Array.isArray(input.nums)
            ? input.nums.join(', ')
            : input.nums;

        if (config.hasTarget) {
            this.targetGroup.style.display = 'block';
            this.targetInput.value = input.target;
        } else {
            this.targetGroup.style.display = 'none';
        }

        this.solutionOutput.innerHTML =
            '<p class="placeholder">Run visualization to see results</p>';
        this.visualizer.reset();
    }

    parseInput() {
        const numsStr = this.numbersInput.value.trim();
        const nums = numsStr
            .split(',')
            .map(n => parseInt(n.trim()))
            .filter(n => !isNaN(n));

        if (nums.length === 0) {
            this.showError('Please enter valid numbers');
            return null;
        }

        const result = { nums };

        if (this.problemConfigs[this.currentProblem].hasTarget) {
            const target = parseInt(this.targetInput.value);
            if (isNaN(target)) {
                this.showError('Please enter a valid target');
                return null;
            }
            result.target = target;
        }

        return result;
    }

    runVisualization() {
        const input = this.parseInput();
        if (!input) return;

        try {
            // Create algorithm instance
            this.algorithm = AlgorithmFactory[this.currentProblem]();

            // Solve
            let solution;
            if (this.currentProblem === 'combination-sum') {
                solution = this.algorithm.solve(input.nums, input.target);
            } else if (this.currentProblem === 'subsets') {
                solution = this.algorithm.solve(input.nums);
            }

            // Set up visualization
            this.visualizer.setSteps(this.algorithm.steps);
            this.visualizer.setSpeed(parseFloat(this.speedSlider.value));

            // Display solution
            this.displaySolution(solution);

            // Update stats
            this.updateStats();

            // Start animation
            setTimeout(() => this.visualizer.play(), 300);
        } catch (error) {
            this.showError(`Error: ${error.message}`);
        }
    }

    displaySolution(solution) {
        this.solutionOutput.innerHTML = '';

        if (solution.length === 0) {
            this.solutionOutput.innerHTML =
                '<p class="placeholder">No solutions found</p>';
            return;
        }

        this.solutionTitle = document.createElement('div');
        this.solutionTitle.style.cssText =
            'padding: 12px; border-bottom: 1px solid var(--border); margin-bottom: 8px; font-weight: 600; color: var(--text-primary);';
        this.solutionTitle.textContent = `Finding solutions...`;
        this.solutionOutput.appendChild(this.solutionTitle);
        
        this.solutionCount = 0;
    }
    
    addSolutionItem(item) {
        this.solutionCount = (this.solutionCount || 0) + 1;
        
        // Update title with current count
        if (this.solutionTitle) {
            this.solutionTitle.textContent = `Found ${this.solutionCount} solution${this.solutionCount !== 1 ? 's' : ''}`;
        }
        
        const div = document.createElement('div');
        div.className = 'solution-item';
        div.textContent = `[${item.join(', ')}]`;
        this.solutionOutput.appendChild(div);
    }

    updateStats() {
        const progress = this.visualizer.getProgress();
        this.statsOverlay.innerHTML = `
            <div style="margin-bottom: 8px; font-weight: 600; color: #0066cc;">Execution Stats</div>
            <div style="color: #000000;">Steps: ${progress.current} / ${progress.total}</div>
            <div style="color: #000000;">Progress: ${Math.round(progress.percentage)}%</div>
            <div style="margin-top: 8px; font-size: 11px; color: #333333;">
                Space: Play/Pause<br>
                →: Next Step<br>
                Enter: Run
            </div>
        `;
    }

    showError(message) {
        this.solutionOutput.innerHTML = `<p class="placeholder" style="color: var(--error);">${message}</p>`;
    }
}

// Theme management
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.init();
    }

    init() {
        // Load saved theme or default to light mode
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);

        // Add click listener
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    setTheme(theme) {
        const html = document.documentElement;
        
        if (theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
            this.themeToggle.querySelector('.theme-icon').textContent = '☀️';
            // Update mobile theme toggle too
            const mobileToggle = document.getElementById('mobile-theme-toggle');
            if (mobileToggle) {
                mobileToggle.querySelector('.theme-icon').textContent = '☀️';
            }
            localStorage.setItem('theme', 'dark');
        } else {
            html.removeAttribute('data-theme');
            this.themeToggle.querySelector('.theme-icon').textContent = '🌙';
            // Update mobile theme toggle too
            const mobileToggle = document.getElementById('mobile-theme-toggle');
            if (mobileToggle) {
                mobileToggle.querySelector('.theme-icon').textContent = '🌙';
            }
            localStorage.setItem('theme', 'light');
        }

        // Update visualizer colors
        if (window.app && window.app.visualizer) {
            window.app.visualizer.onThemeChange();
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AlgorithmVisualizer();
    window.themeManager = new ThemeManager();

    // Add animation to stats overlay
    const observer = new MutationObserver(() => {
        const overlay = document.getElementById('stats-overlay');
        if (overlay && overlay.innerHTML) {
            overlay.style.animation = 'slideIn 0.3s ease';
        }
    });

    observer.observe(document.getElementById('stats-overlay'), {
        childList: true,
        subtree: true,
    });
});
