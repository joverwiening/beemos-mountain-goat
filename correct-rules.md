# Mountain Goats - Correct Rules & Layout

## Physical Game vs BGA Digital

### Physical Game (from official rulebook)
- **18 Mountain Cards**: 4×(5,6), 3×(7,8), 2×(9,10)
  - Mountain 5: 4 cards/spaces tall
  - Mountain 6: 4 cards/spaces tall
  - Mountain 7: 3 cards/spaces tall
  - Mountain 8: 3 cards/spaces tall
  - Mountain 9: 2 cards/spaces tall
  - Mountain 10: 2 cards/spaces tall

- **Dice**: Roll 4 dice each turn
- **Grouping**: Make groups of dice that sum to 5-10
  - Example: roll [1,2,3,4] → group as (1+2+3=6), (4) = move on mountain 6 and... nothing for mountain 4
  - Example: roll [2,3,4,6] → group as (2+3=5), (4+6=10) = move on mountains 5 and 10

### BGA Digital Version (from screenshots)

**Board Layout:**
- 6 mountains arranged horizontally (left to right: 5, 6, 7, 8, 9, 10)
- Variable heights (BGA appears to use 3 max or simplified):
  - Mountains 5,6,7,8: 3 spaces tall
  - Mountains 9,10: 2 spaces tall (no bottom row)
- Each space is a colored tile with a number
- Grid layout: spaces are arranged in rows, not vertical stacks

**Dice System:**
- NO ROLLING - instead there's a POOL of available dice at the top
- Pool shows: 5×10, 6×9, 7×8, 8×7, 9×6, 10×5
  - This means: 10 dice showing "5", 9 dice showing "6", 8 dice showing "7", etc.
- Player SELECTS a die from the pool (not rolled)
- Selected die is REMOVED from pool (quantities decrease)
- When you select a die, you move a goat to a space matching that number

**Turn Structure (BGA):**
1. Select a die from available pool (e.g., select a "7")
2. Click a goat to move
3. Move that goat to any space showing "7"
4. Die is removed from pool (7×8 becomes 7×7)
5. Score if goat is on a peak

**Key Differences:**
| Physical | BGA Digital |
|----------|-------------|
| Roll 4 dice | Select 1 die from pool |
| Group dice to make 5-10 | Die value directly = space number |
| Multiple moves per turn | 1 move per turn |
| Dice reset each turn | Pool depletes permanently |
| Variable heights (4/4/3/3/2/2) | Simplified? (3/3/3/3/2/2) |

## What I Built Wrong

**My implementation:**
- Vertical mountains (each mountain rendered as a vertical column going upward)
- Rolling 4 random dice each turn
- Both are COMPLETELY WRONG

**Correct implementation should be:**
- Grid of tiles (6 columns × 3 rows with bottom row missing for mountains 9-10)
- Dice POOL selector at top with quantities
- Select ONE die, move ONE goat to matching space number
- No rolling, no grouping

## Next Steps

1. Completely rebuild board layout as grid of tiles
2. Implement dice pool with quantities (not random roll)
3. One move per turn (select die → select goat → move to matching number)
4. Variable mountain heights (mountains 9-10 only have 2 spaces)
