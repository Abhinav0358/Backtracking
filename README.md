# Backtracking Visualizer

A clean, professional web application for visualizing backtracking algorithms as interactive trees with Desmos-style design.

## Features

###  **Interactive Tree Visualization**
- **Proper binary tree layout**: Each branch splits visually
- **Pan & Zoom controls**: Navigate large trees
- **Fit to screen (F key)**: Automatically zoom to see entire tree
- **Smooth animations**: Watch the recursion unfold branch-by-branch
- Real-time node highlighting showing current execution

###  **Playback Controls**
- Play/Pause with Space bar
- Step forward/backward with Arrow keys
- Adjustable speed (0.25x - 4x)
- Clear progress stats overlay

###  **Multiple Problems Pre-built**
- **Combination Sum**: Find all combinations summing to target
- **Subsets**: Generate all subsets of array
- Easily extensible for more problems

##  How to Use

1. **Select a problem**: Click buttons in left sidebar
2. **Enter inputs**: Modify values (pre-populated)
3. **Click Visualize**: Watch the tree grow step-by-step

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| Enter | Run visualization |
| Space | Play/Pause |
| → | Next step |
| ← | Previous step |
| F | Fit tree to screen |
| Scroll | Zoom in/out |
| Drag | Pan around tree |

## How Trees are Visualized

For **Combination Sum** with `nums=[2,3,6,7], target=7`:

```
                        []
                       /  \
                     [2]   [3] [6] [7]
                    /  \    |   |   |
                  [2,2] [2,3][3,6][7]
                  /      |    |    \
               [2,2,2] [2,3,2] ...  ∅
```

- **White nodes**: Regular states
- **Red nodes**: Active/Include operations
- **Green nodes**: Solutions found
- **Yellow nodes**: Backtrack points
- **Purple nodes**: Pruned branches

## Step Types in Visualization

| Type | Color | Meaning |
|------|-------|---------|
| `init` | Gray | Algorithm initialization |
| `enter` | Gray | Entering recursive call |
| `include` | Red | Adding element to state |
| `backtrack` | Yellow | Removing element (backtrack) |
| `prune` | Purple | Eliminating branch |
| `solution` | Green | Valid solution found |
| `complete` | Gray | Algorithm finished |

## Tree Layout Algorithm

The tree uses recursive positioning:

1. **Root**: Centered horizontally
2. **Children spacing**: Decreases with depth (prevents crowding)
3. **Vertical gap**: Fixed 80px between levels
4. **Auto-layout**: Recalculates as tree grows
5. **Pan/Zoom**: Maintains all interactivity

Large trees (100+ nodes) automatically scale. Use **F key** to fit entire tree.

## Customization

### Change Color Scheme

Change color scheme by toggling between light and dark modes in the settings menu.

## Performance Notes

- **Optimal**: Up to 200-300 nodes (typical for small inputs)
- **Good**: Up to 1000 nodes (might require panning)
- **Large**: 1000+ nodes (animation may slow)

For heavy computations, consider:
1. Increasing animation delay
2. Reducing input size
3. Limiting recursion depth display

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ❌ IE11 (uses ES6+)

**Enjoy visualizing!** 🌳✨
