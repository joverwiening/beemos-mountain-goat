# Mountain Goats - Final Correct Understanding

## BGA Screenshot Analysis

**Top section (dark area):**
- 4 small circular tokens showing dice values (current roll: appears to be 5, 6, 7, 8)
- Below that: 6 larger circles showing "5 ×10, 6 ×9, 7 ×8, 8 ×7, 9 ×6, 10 ×5"
  - These are POINT TOKENS, not dice to select
  - Format: [mountain number] × [quantity remaining]

**Board (colorful grid):**
Row 1 (top): 5 (black circle), 6 (black circle), 7 (black circle), 8 (black circle), 9 (black circle), 10 (black circle)
- These BLACK circles appear to be the PEAK indicators or scoring zones

Row 2: 5 (cyan tile), 6 (orange tile), 7 (brown tile), 8 (gray tile), 9 (cyan tile), 10 (light blue tile)
Row 3: 5 (green tile), 6 (orange tile), 7 (brown tile), 8 (gray tile), 9 (cyan tile), 10 (light blue tile)
Row 4: 5 (green tile), 6 (orange tile), 7 (brown tile), 8 (gray tile), [dark], [dark]

So the actual playable spaces are:
- Mountains 5,6,7,8: 3 spaces each (rows 2-4)
- Mountains 9,10: 2 spaces each (rows 2-3 only)
- Top row (row 1): Peak markers, not moveable spaces (just visual indicators)

## Physical Game Structure (from rulebook)

18 Mountain Cards laid out:
- Mountain 5: 4 cards (but BGA shows only 3 spaces?)
- Mountain 6: 4 cards (but BGA shows only 3 spaces?)
- Mountain 7: 3 cards ✓
- Mountain 8: 3 cards ✓
- Mountain 9: 2 cards ✓
- Mountain 10: 2 cards ✓

**Possible explanations:**
1. BGA simplified mountains 5 & 6 from 4→3 spaces
2. OR there's a 5th row I'm not seeing in the screenshot
3. OR the black circles at top ARE the 4th space for mountains 5-6?

## Game Mechanics (CORRECT)

**Turn Flow:**
1. Roll 4 dice
2. Player makes groups of dice that sum to 5-10
3. For each valid group, move one goat to a space matching that number
4. Can move from any space to any space with matching number (cross mountains)
5. Reaching a peak: claim point token, kick other goats off

**NOT** selecting from a pool. **YES** rolling dice each turn.

## What I Need to Build

1. **Dice Rolling UI**: Roll 4 dice, show results
2. **Dice Grouping**: Let player select which dice to group together
3. **Board Grid**: 6 columns × 3-4 rows depending on mountain
4. **Movement**: Click goat → click destination space matching die group sum
5. **Point Tokens**: Display at top showing quantities (5×10, 6×9, etc.)
6. **Scoring**: Claim tokens when reaching peaks

## Next Steps

1. Clarify exact board dimensions (do mountains 5-6 have 3 or 4 spaces in BGA?)
2. Build dice rolling + grouping UI
3. Rebuild board as proper grid
4. Implement movement and scoring rules
