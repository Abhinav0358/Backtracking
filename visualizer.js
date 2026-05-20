/**
 * Backtracking Tree Visualizer
 * Displays algorithm execution as an interactive tree structure
 */

class BacktrackingVisualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.steps = [];
    this.currentStepIndex = 0;
    this.isPlaying = false;
    this.speed = 1;
    this.animationFrameId = null;
    this.onStepChange = null; // Callback for step changes
    this.onSolutionFound = null; // Callback when solution is found
    this.lastSolutionStepIndex = -1; // Track which solutions have been reported

    // Pan and zoom
    this.panX = 0;
    this.panY = 0;
    this.zoom = 1;
    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;

    this.setupCanvas();
    this.setupPanZoom();

    // Initialize colors based on current theme
    this.updateColors();
  }

  updateColors() {
    // Check if dark theme is enabled
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark";

    // Desmos-style colors (adapts to theme)
    this.colors = isDark
      ? {
          // Dark theme
          bg: "#1a1a1a",
          grid: "rgba(100, 100, 100, 0.4)",
          gridBold: "rgba(120, 120, 120, 0.6)",
          nodeDefault: "#333333",
          nodeBorder: "#cccccc",
          nodeActive: "#ff6b6b",
          nodeSolution: "#51cf66",
          nodeBacktrack: "#ffd43b",
          nodePrune: "#a8aeff",
          text: "#ffffff",
          textSecondary: "#e0e0e0",
          edge: "#cccccc",
          edgeActive: "#ff6b6b",
        }
      : {
          // Light theme
          bg: "#ffffff",
          grid: "rgba(180, 180, 180, 0.5)",
          gridBold: "rgba(140, 140, 140, 0.7)",
          nodeDefault: "#ffffff",
          nodeBorder: "#000000",
          nodeActive: "#ff6b6b",
          nodeSolution: "#51cf66",
          nodeBacktrack: "#ffd43b",
          nodePrune: "#a8aeff",
          text: "#000000",
          textSecondary: "#555555",
          edge: "#000000",
          edgeActive: "#ff6b6b",
        };

    this.treeNodes = {};
    this.treeRoot = null;
    this.nodeRadius = 20;
    this.verticalGap = 100;
    this.horizontalGap = 15;
  }

  setupCanvas() {
    const container = this.canvas.parentElement;
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;

    window.addEventListener("resize", () => {
      this.canvas.width = container.clientWidth;
      this.canvas.height = container.clientHeight;
      this.redraw();
    });
  }

  setupPanZoom() {
    // Mouse events
    this.canvas.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.lastX;
        const dy = e.clientY - this.lastY;
        this.panX += dx;
        this.panY += dy;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.redraw();
      }
    });

    this.canvas.addEventListener("mouseup", () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.isDragging = false;
    });

    // Wheel zoom
    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const zoomSpeed = 0.1;
      const newZoom = this.zoom + (e.deltaY > 0 ? -zoomSpeed : zoomSpeed);
      this.zoom = Math.max(0.3, Math.min(3, newZoom));
      this.redraw();
    });

    // Touch events for mobile/tablet
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartDist = 0;

    this.canvas.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        // Two-finger pinch for zoom
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        touchStartDist = Math.sqrt(dx * dx + dy * dy);
      }
    });

    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();

      if (e.touches.length === 1 && this.isDragging) {
        // Single finger pan
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        this.panX += dx;
        this.panY += dy;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        this.redraw();
      } else if (e.touches.length === 2) {
        // Two-finger pinch zoom
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        const currentDist = Math.sqrt(dx * dx + dy * dy);

        if (touchStartDist > 0) {
          const zoomFactor = currentDist / touchStartDist;
          const newZoom = this.zoom * zoomFactor;
          this.zoom = Math.max(0.3, Math.min(3, newZoom));
          touchStartDist = currentDist;
          this.redraw();
        }
      }
    });

    this.canvas.addEventListener("touchend", () => {
      this.isDragging = false;
      touchStartDist = 0;
    });
  }

  // Public method to handle theme changes
  onThemeChange() {
    this.updateColors();
    this.redraw();
  }

  setSteps(steps) {
    this.steps = steps;
    this.currentStepIndex = 0;
    this.treeNodes = {};
    this.treeRoot = null;
    this.panX = 0;
    this.panY = 0;
    this.zoom = 1;
    this.lastSolutionStepIndex = -1; // Reset solution tracking
    this.redraw();

    // Auto-fit tree after a short delay to ensure positions are calculated
    setTimeout(() => this.fitToScreen(), 100);
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  play() {
    if (this.isPlaying || this.currentStepIndex >= this.steps.length) return;
    this.isPlaying = true;
    this.animate();
  }

  pause() {
    this.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  reset() {
    this.pause();
    this.currentStepIndex = 0;
    this.treeNodes = {};
    this.treeRoot = null;
    this.panX = 0;
    this.panY = 0;
    this.zoom = 1;
    this.redraw();
  }

  nextStep() {
    if (this.currentStepIndex < this.steps.length) {
      this.processStep(this.steps[this.currentStepIndex]);
      this.currentStepIndex++;
      this.redraw();
    }
  }

  animate() {
    if (!this.isPlaying || this.currentStepIndex >= this.steps.length) {
      this.isPlaying = false;
      return;
    }

    this.processStep(this.steps[this.currentStepIndex]);
    this.currentStepIndex++;
    this.redraw();

    const delayMs = 600 / this.speed;
    this.animationFrameId = setTimeout(() => this.animate(), delayMs);
  }

  processStep(step) {
    const stepIndex = this.currentStepIndex;

    // Find parent node (previous "enter" step at relevant depth)
    let parentId = null;
    const stepDepth = step.callDepth || 0;
    if (stepIndex > 0) {
      if (step.type === "enter") {
        for (let i = stepIndex - 1; i >= 0; i--) {
          const prevStep = this.steps[i];
          if (prevStep.type === "enter" && prevStep.callDepth < stepDepth) {
            parentId = `step-${i}`;
            break;
          }
        }
      } else {
        for (let i = stepIndex - 1; i >= 0; i--) {
          const prevStep = this.steps[i];
          if (prevStep.type === "enter" && prevStep.callDepth <= stepDepth) {
            parentId = `step-${i}`;
            break;
          }
        }
      }
    }
    if (
      !parentId &&
      this.treeRoot &&
      step.type === "enter" &&
      stepDepth === 0
    ) {
      parentId = this.treeRoot;
    }

    let color = this.colors.nodeBorder;
    if (step.type === "solution") color = this.colors.nodeSolution;
    if (step.type === "prune") color = this.colors.nodePrune;
    if (step.type === "backtrack") color = this.colors.nodeBacktrack;
    if (step.type === "include") color = this.colors.nodeActive;

    const nodeId = `step-${stepIndex}`;
    const node = {
      id: nodeId,
      parentId,
      subset: step.subset,
      message: step.message,
      type: step.type,
      color,
      depth: stepDepth,
      index: step.index,
      currsum: step.currsum,
      x: 0,
      y: 0,
    };

    this.treeNodes[nodeId] = node;

    console.log(
      `Step ${stepIndex}: Created node ${nodeId}, parent: ${parentId}, type: ${step.type}, depth: ${node.depth}`,
    );

    // Set root if this is the first node
    if (!this.treeRoot && step.type === "init") {
      this.treeRoot = nodeId;
      console.log(`Root set to: ${nodeId}`);
    }

    // Layout tree
    this.layoutTree();
  }

  layoutTree() {
    if (!this.treeRoot || Object.keys(this.treeNodes).length === 0) return;

    const root = this.treeNodes[this.treeRoot];
    const canvasWidth = this.canvas.width;
    const centerX = canvasWidth / 2;

    console.log(
      `Laying out tree with ${Object.keys(this.treeNodes).length} nodes, root: ${this.treeRoot}`,
    );

    // Calculate tree layout using recursive positioning
    const visited = new Set();
    this.calculateNodePositions(this.treeRoot, centerX, 50, visited);
  }

  calculateNodePositions(nodeId, x, y, visited) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = this.treeNodes[nodeId];
    node.x = x;
    node.y = y;

    console.log(
      `  Node ${nodeId}: positioned at (${x.toFixed(0)}, ${y.toFixed(0)}), subset: [${node.subset}]`,
    );

    // Find all children
    const children = Object.values(this.treeNodes).filter(
      (n) => n.parentId === nodeId,
    );

    console.log(`  Node ${nodeId}: has ${children.length} children`);

    if (children.length === 0) return;

    // Calculate spacing for children - use logarithmic scaling to prevent extreme spreading
    const depthFactor = Math.max(1, 5 - node.depth);
    // Use logarithm to prevent spreading from multiplying with child count
    const childCountFactor = Math.log(Math.max(2, children.length));
    const childSpacing = this.horizontalGap * depthFactor * childCountFactor;
    const totalWidth = (children.length - 1) * childSpacing;
    const startX = x - totalWidth / 2;

    console.log(
      `  Node ${nodeId}: depthFactor=${depthFactor}, childCountFactor=${childCountFactor.toFixed(2)}, childSpacing=${childSpacing.toFixed(0)}, totalWidth=${totalWidth.toFixed(0)}`,
    );

    children.forEach((child, index) => {
      const childX = startX + index * childSpacing;
      const childY = y + this.verticalGap;
      this.calculateNodePositions(child.id, childX, childY, visited);
    });
  }

  redraw() {
    // Clear canvas
    this.ctx.fillStyle = this.colors.bg;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Save context
    this.ctx.save();

    // Apply pan and zoom transformations around canvas center
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    this.ctx.translate(centerX, centerY);
    this.ctx.scale(this.zoom, this.zoom);
    this.ctx.translate(this.panX - centerX, this.panY - centerY);

    // Draw grid
    this.drawGrid();

    // Draw all edges first
    Object.values(this.treeNodes).forEach((node) => {
      if (node.parentId && this.treeNodes[node.parentId]) {
        const parent = this.treeNodes[node.parentId];
        this.drawEdge(parent.x, parent.y, node.x, node.y, node);
      }
    });

    // Draw all nodes
    const nodeCount = Object.keys(this.treeNodes).length;
    Object.values(this.treeNodes).forEach((node) => {
      const isActive =
        this.steps[this.currentStepIndex - 1]?.type === node.type &&
        this.steps[this.currentStepIndex - 1]?.subset?.toString() ===
          node.subset?.toString();
      this.drawNode(node, isActive);
    });

    if (nodeCount > 0) {
      console.log(
        `Redraw: Drawing ${nodeCount} nodes, current step: ${this.currentStepIndex}`,
      );
    }

    this.ctx.restore();

    // Draw UI elements on canvas (legend) - commented out since using HTML overlay
    this.drawLegend();
    // Don't draw controls as stats are shown in HTML overlay
    // this.drawControls();

    // Call step change callback for stats update
    if (this.onStepChange) {
      this.onStepChange(this.getProgress());
    }

    // Check for new solution steps and report them
    if (this.onSolutionFound && this.currentStepIndex > 0) {
      const currentStep = this.steps[this.currentStepIndex - 1];
      if (
        currentStep.type === "solution" &&
        this.currentStepIndex - 1 > this.lastSolutionStepIndex
      ) {
        this.lastSolutionStepIndex = this.currentStepIndex - 1;
        this.onSolutionFound(currentStep.subset);
      }
    }
  }

  drawGrid() {
    const gridSize = 20;
    const margin = this.canvas.width + this.canvas.height; // Large margin for zooming out
    const startX =
      Math.floor((-this.panX / (gridSize * this.zoom)) * gridSize) - margin;
    const startY =
      Math.floor((-this.panY / (gridSize * this.zoom)) * gridSize) - margin;
    const endX = startX + this.canvas.width / this.zoom + margin * 2;
    const endY = startY + this.canvas.height / this.zoom + margin * 2;

    // Minor grid lines
    this.ctx.strokeStyle = this.colors.grid;
    this.ctx.lineWidth = 0.5 / this.zoom;

    for (let x = startX; x < endX; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, startY);
      this.ctx.lineTo(x, endY);
      this.ctx.stroke();
    }

    for (let y = startY; y < endY; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(startX, y);
      this.ctx.lineTo(endX, y);
      this.ctx.stroke();
    }

    // Bold grid lines (every 5 minor grids)
    this.ctx.strokeStyle = this.colors.gridBold;
    this.ctx.lineWidth = 1.5 / this.zoom;

    for (let x = startX; x < endX; x += gridSize * 5) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, startY);
      this.ctx.lineTo(x, endY);
      this.ctx.stroke();
    }

    for (let y = startY; y < endY; y += gridSize * 5) {
      this.ctx.beginPath();
      this.ctx.moveTo(startX, y);
      this.ctx.lineTo(endX, y);
      this.ctx.stroke();
    }
  }

  drawEdge(x1, y1, x2, y2, childNode) {
    const isActiveChild =
      this.currentStepIndex > 0 &&
      this.steps[this.currentStepIndex - 1]?.type === "enter" &&
      JSON.stringify(this.steps[this.currentStepIndex - 1]?.subset) ===
        JSON.stringify(childNode.subset);

    this.ctx.strokeStyle = isActiveChild
      ? this.colors.edgeActive
      : this.colors.edge;
    this.ctx.lineWidth = isActiveChild ? 2.5 / this.zoom : 1.5 / this.zoom;
    this.ctx.lineCap = "round";

    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  drawNode(node, isActive) {
    const radius = isActive ? this.nodeRadius + 3 : this.nodeRadius;
    const lineWidth = isActive ? 3 : 2;

    // Draw circle
    this.ctx.fillStyle =
      node.color === this.colors.nodeBorder
        ? this.colors.nodeDefault
        : node.color;
    this.ctx.strokeStyle = node.color;
    this.ctx.lineWidth = lineWidth / this.zoom;

    this.ctx.beginPath();
    this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // Draw text
    this.ctx.fillStyle = this.colors.text;
    this.ctx.font = `bold ${12 / this.zoom}px monospace`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    const subsetStr =
      node.subset.length > 0 ? `[${node.subset.join(",")}]` : "∅";
    this.ctx.fillText(subsetStr, node.x, node.y);

    // Draw tooltip on hover (optional - shows full info)
    if (isActive) {
      this.ctx.font = `11px sans-serif`;
      this.ctx.fillStyle = this.colors.textSecondary;
      this.ctx.textAlign = "center";
      const infoY = node.y - radius - 25;
      this.ctx.fillText(node.message, node.x, infoY);
    }
  }

  drawLegend() {
    const padding = 16;
    const legendX = padding;
    const legendY = padding;
    const itemHeight = 20;
    const rectWidth = 180;
    const rectHeight = 100;

    // Background
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    this.ctx.strokeStyle = "#000000";
    this.ctx.lineWidth = 1;
    this.ctx.fillRect(legendX, legendY, rectWidth, rectHeight);
    this.ctx.strokeRect(legendX, legendY, rectWidth, rectHeight);

    // Title
    this.ctx.fillStyle = "#000000";
    this.ctx.font = "bold 12px sans-serif";
    this.ctx.textAlign = "left";
    this.ctx.fillText("Legend", legendX + 10, legendY + 18);

    // Items
    const items = [
      { color: this.colors.nodeActive, label: "Include" },
      { color: this.colors.nodeSolution, label: "Solution" },
      { color: this.colors.nodeBacktrack, label: "Backtrack" },
      { color: this.colors.nodePrune, label: "Prune" },
    ];

    this.ctx.font = "11px sans-serif";
    items.forEach((item, index) => {
      const y = legendY + 30 + index * itemHeight;

      // Color circle
      this.ctx.fillStyle = item.color;
      this.ctx.strokeStyle = "#000000";
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(legendX + 12, y, 5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Label
      this.ctx.fillStyle = "#000000";
      this.ctx.textAlign = "left";
      this.ctx.fillText(item.label, legendX + 25, y + 4);
    });
  }

  drawControls() {
    const textY = this.canvas.height - 40;
    const padding = 16;

    // Background
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    this.ctx.strokeStyle = "#000000";
    this.ctx.lineWidth = 1;
    this.ctx.fillRect(padding, textY - 15, 300, 35);
    this.ctx.strokeRect(padding, textY - 15, 300, 35);

    // Text
    this.ctx.fillStyle = "#555555";
    this.ctx.font = "11px sans-serif";
    this.ctx.textAlign = "left";
    this.ctx.fillText(
      "Drag: Pan | Scroll: Zoom | Space: Play/Pause | →: Step",
      padding + 10,
      textY,
    );
  }

  getCurrentStep() {
    if (
      this.currentStepIndex <= 0 ||
      this.currentStepIndex > this.steps.length
    ) {
      return null;
    }
    return this.steps[this.currentStepIndex - 1];
  }

  getProgress() {
    return {
      current: this.currentStepIndex,
      total: this.steps.length,
      percentage: (this.currentStepIndex / this.steps.length) * 100,
    };
  }

  fitToScreen() {
    if (Object.keys(this.treeNodes).length === 0) return;

    const nodes = Object.values(this.treeNodes);
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    nodes.forEach((node) => {
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y);
    });

    const padding = 100;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;

    const scaleX = this.canvas.width / width;
    const scaleY = this.canvas.height / height;

    this.zoom = Math.min(scaleX, scaleY, 1);

    // Calculate pan to center the tree
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    this.panX = this.canvas.width / 2 - centerX;
    this.panY = this.canvas.height / 2 - centerY;

    this.redraw();
  }
}
