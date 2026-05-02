# Mountain Goats - Visual Design Specification

Extracted from BGA implementation on 2026-05-01.

## Board Layout

**6 Mountains arranged horizontally:**
- Each mountain has 3 spaces stacked vertically
- Spaces numbered 5 (bottom) → 6 (middle) → 7/8/9/10 (top varies by mountain)
- Mountains have distinct color themes and nature artwork

**Mountain themes (left to right):**
1. Green/forest mountain (grassland)
2. Orange/desert mountain (sandy/autumn)
3. Brown/rocky mountain (earthy/stone)
4. Gray/slate mountain (misty/rain)
5. Cyan/water mountain (aqua/river)
6. Light blue/snow mountain (ice/winter)

## Visual Elements

**Spaces:**
- Rounded square tiles (~80-100px each)
- Large white number in center
- Nature-themed background art (trees, rocks, water, etc.)
- Color gradient matching mountain theme
- Slight depth/shadow effect

**Goat Pieces:**
- Colored goat silhouettes
- Multiple colors for different players (yellow, red, brown, cyan, pink visible)
- Placed on mountain spaces
- ~30-40px size

**Dice Pool (top):**
- Circular dice tokens showing numbers 5-10
- Each die has colored background matching its number's mountain theme
- Shows quantity available (× N)
- 4 smaller mountain peak icons above dice (scoring indicators)

**Player Panels (right side):**
- Player name + score
- Colored goat inventory showing count per die value
- Goat icon × quantity for each number

## Color Palette

**Mountain 5 (Green):** #4a9d5f, #6db87d (forest green)
**Mountain 6 (Orange):** #d4853d, #e69a52 (sandy orange)
**Mountain 7 (Brown):** #8b5a3c, #a67458 (rocky brown)
**Mountain 8 (Gray):** #6b7b8a, #8695a3 (slate gray)
**Mountain 9 (Cyan):** #5ba7c2, #7ec4d9 (water blue)
**Mountain 10 (White/Light Blue):** #a8d5e8, #c5e7f2 (ice blue)

**Goat Colors:**
- Green: #6db87d
- Orange: #e69a52
- Brown: #8b5a3c
- Cyan: #5ba7c2
- Pink/Red: #d65f5f

## Layout Structure

```
+----------------------------------------------------------+
|  [Dice Pool: 5 6 7 8 9 10]     [Player Panel]            |
+----------------------------------------------------------+
|  [Mt5] [Mt6] [Mt7] [Mt8] [Mt9] [Mt10]  [Scores]         |
|   10    10    10    10    10     10                      |
|    9     9     9     9     9      9                      |
|    8     8     8     8     8      8                      |
|    7     7     7     7     7      7                      |
|    6     6     6     6     6      6                      |
|    5     5     5     5     5      5                      |
+----------------------------------------------------------+
```

## Technical Notes

- Board appears to use SVG or CSS-styled divs (not canvas)
- Smooth animations likely on piece movement
- Responsive layout - scales to screen
- Dark background (#2a2f35) behind mountains
- Mountains have subtle shadow/depth effects

## Next Steps

1. Create HTML structure with mountain grid
2. Style spaces with colors and numbers
3. Add goat piece SVGs or CSS shapes
4. Build dice pool UI
5. Implement player panels
6. Add interactivity (click to move, dice selection)
