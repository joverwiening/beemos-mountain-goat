# Mountain Goats - Layout Analysis

## Physical Game (from rulebook PDF)

**Components:**
- 18 Mountain Cards: 4×(5,6), 3×(7,8), 2×(9,10)
- 4 Dice (rolled each turn)
- 24 Goats (6 per player for 4 players)
- Point Tokens stacked on mountain tops

**Mountain Heights:**
- Mountain 5: 4 cards tall
- Mountain 6: 4 cards tall
- Mountain 7: 3 cards tall
- Mountain 8: 3 cards tall
- Mountain 9: 2 cards tall
- Mountain 10: 2 cards tall

**Gameplay:**
1. Roll 4 dice
2. Group dice to make numbers 5-10 (e.g., 1+2=3 won't work, but 2+3=5 works)
3. For each group, move one goat up one space on that mountain
4. Multiple goats can share spaces EXCEPT at the top
5. Reaching top = claim point token, kick other goat down

## BGA Digital Version (from screenshots)

Looking at board-viewport.png:
- 6 columns (one per mountain: 5, 6, 7, 8, 9, 10)
- Different colored backgrounds per mountain
- Dice pool at top showing: 5×10, 6×9, 7×8, 8×7, 9×6, 10×5
- No rolling - seems like you SELECT a die from the pool
- Quantities next to each die (×10, ×9, etc.)

**Key differences from physical:**
- Physical: roll 4 dice, group them
- BGA: select from depleting pool of dice

**Questions to resolve:**
1. How many spaces (rows) does each mountain actually have in BGA?
2. Are the mountains different heights or uniform 3-row grid?
3. How does the dice selection work - do you pick ONE die per turn?
4. When you pick a die, does it deplete from the pool permanently?

**Need to examine:**
- Count actual visible spaces per mountain in screenshots
- Understand if board layout matches physical (variable heights) or is adapted
