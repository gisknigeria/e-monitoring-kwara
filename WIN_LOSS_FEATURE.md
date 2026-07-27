# Win/Loss Analysis Feature

## Overview
Added a comprehensive win/loss analysis tab to the Results Center showing which wards and LGAs each of the top 6 parties are winning or losing.

## How It Works

### 1. **Top 6 Detection**
- Automatically identifies the 6 parties with the highest total votes
- Updates dynamically as new polling unit results are submitted

### 2. **Ward-Level Analysis**
- Groups all polling unit results by LGA + Ward
- Sums votes for each of the top 6 parties per ward
- Determines the winner (party with most votes in that ward)
- Shows a ✓ for the winning party, ✗ for others

### 3. **LGA-Level Analysis**
- Aggregates all polling units within each LGA
- Calculates totals for top 6 parties per LGA
- Identifies the leading party in each Local Government Area

### 4. **Per-Party Breakdown**
- Click any of the top 6 party chips to see detailed win/loss stats
- **LGAs Won**: Lists all LGAs where this party leads, with vote count and lead margin
- **LGAs Lost**: Shows LGAs where another party is ahead, with the winner and vote gap
- **Wards Won**: All wards where this party has the most votes, with lead margin
- **Wards Lost**: Wards where the party is not leading, showing winner and gap

## User Interface

### Navigation
1. Open **Results** button from the sidebar or analytics panel
2. Click **Win / Loss Map** tab (shows badge with number of top parties)
3. Choose view:
   - **By Ward** — complete ward breakdown
   - **By LGA** — LGA-level summary
   - Click any party chip to see its **detailed win/loss report**

### Visual Design
- **Color-coded party chips** — each top 6 party gets a distinct color
- **Win/Loss indicators** — green background with ✓ for wins, red with ✗ for losses
- **Winner badges** — styled with party color
- **Lead/Gap columns** — shows margin of victory or deficit
- **Responsive layout** — works on mobile and desktop

## Data Structure

### Input Data
- Reads from `incidents` array where `reportType === "Polling Unit Result"`
- Each result has:
  - `lga`, `ward`, `pollingUnit` — location identifiers
  - `resultCount` — JSON array like `[{party: "APC", votes: 234}, ...]`

### Computed Summaries
- **`top6`** — array of 6 party names sorted by total votes (descending)
- **`winLossSummary.byWard`** — array of ward objects:
  ```js
  { lga, ward, votes: {APC: 123, PDP: 89, ...}, winner: "APC", units: 5 }
  ```
- **`winLossSummary.byLga`** — array of LGA objects:
  ```js
  { lga, votes: {...}, winner: "PDP", wards: 12, units: 43 }
  ```

## Technical Notes

### Performance
- All computations use `useMemo` to avoid re-calculating on every render
- Efficient grouping with `Map` lookups
- Sorting by LGA + Ward for consistent display order

### Styling
- New CSS classes in `styles.css`:
  - `.rc-tab-bar`, `.rc-tab` — tab navigation
  - `.wl-*` — win/loss panel components (party chips, tables, detail view)
- Uses CSS custom properties (`--chip-color`) for dynamic party colors
- Responsive breakpoints adjust layout on small screens

## Future Enhancements
- Export to CSV/PDF
- Historical trend charts (win/loss over time if multiple snapshots)
- Map overlay showing wins geographically
- Configurable top-N (not just 6)
- Drill-down from LGA → wards within that LGA
