# Velth Mobile App Design

## Overview

Velth is a personal finance app for mindful money management in India. The app uses a calming, beige-toned color palette with smooth animations to create an intentional and peaceful experience for users tracking their finances.

---

## Screen List

1. **Envelope Budgeting** (Tab 1)
   - View all envelopes with allocated budgets
   - See remaining balance per envelope
   - Create new envelope
   - Edit/delete envelope
   - Add/remove entries within envelope

2. **Cashbook** (Tab 2)
   - Manual transaction log (digital ledger)
   - View all transactions with date, amount, category, notes
   - Add new transaction
   - Edit/delete transaction
   - Filter by date or category

3. **Reports & Insights** (Tab 3)
   - Visual spending summary
   - Category-wise breakdown (pie/bar chart)
   - Monthly overview
   - Spending trends

---

## Primary Content & Functionality

### Screen 1: Envelope Budgeting

**Content:**
- Header: "Envelopes" with total budget overview
- List of envelope cards showing:
  - Envelope name (e.g., "Food", "Rent", "Travel")
  - Allocated budget amount
  - Spent amount
  - Remaining balance (visual progress bar)
  - Percentage used
- Floating Action Button (FAB) to create new envelope

**Functionality:**
- Tap envelope → Detail view to add/remove entries
- Long-press envelope → Edit/delete options
- FAB → Modal to create new envelope with name and budget amount
- Progress bar fills as spending increases (visual feedback)

### Screen 2: Cashbook

**Content:**
- Header: "Cashbook" with total transactions count
- List of transaction entries showing:
  - Date
  - Amount (color-coded: expense in red/warm, income in green)
  - Category/Envelope name
  - Notes (if any)
  - Edit/delete buttons
- Floating Action Button (FAB) to add new transaction

**Functionality:**
- Tap transaction → Edit modal
- FAB → Modal to add new transaction (date picker, amount, category dropdown, notes)
- Swipe to delete (optional)
- Filter by date range or category

### Screen 3: Reports & Insights

**Content:**
- Header: "Reports"
- Summary cards:
  - Total spent (this month)
  - Total budget (this month)
  - Remaining budget
- Visual charts:
  - Pie chart: Category-wise spending breakdown
  - Bar chart: Monthly spending trend (last 6 months)
- Category list below charts with amounts

**Functionality:**
- Charts are interactive (tap to see details)
- Responsive to data changes
- Display "No data" state if no transactions

---

## Key User Flows

### Flow 1: Set Up Budget Envelope

1. User opens app → Envelope tab
2. Tap FAB "Create Envelope"
3. Enter envelope name (e.g., "Food")
4. Enter budget amount (e.g., ₹5000)
5. Confirm → Envelope appears in list
6. Tap envelope to add entries

### Flow 2: Log a Transaction

1. User opens app → Cashbook tab
2. Tap FAB "Add Transaction"
3. Pick date (default: today)
4. Enter amount (e.g., ₹500)
5. Select category/envelope (dropdown)
6. Add optional notes (e.g., "Groceries at XYZ store")
7. Confirm → Transaction appears in list

### Flow 3: View Spending Insights

1. User opens app → Reports tab
2. See summary cards (total spent, budget, remaining)
3. View pie chart for category breakdown
4. View bar chart for monthly trends
5. Tap chart to see detailed breakdown

---

## Color Palette

**Primary Colors (Beige/Warm Tones):**
- Background: `#F5F1E8` (soft beige)
- Surface: `#FFFBF5` (cream white)
- Accent: `#D4A574` (warm tan/gold)
- Text Primary: `#3D3D3D` (dark gray)
- Text Secondary: `#8B8B8B` (medium gray)

**Status Colors:**
- Success/Income: `#6BA576` (soft green)
- Warning/Expense: `#D97D6A` (warm coral)
- Neutral: `#B8A89F` (taupe)

**Borders & Dividers:**
- Border: `#E8DFD5` (light beige)

---

## Typography

- **Headings:** Bold, 24-28px (Envelope/Cashbook/Reports titles)
- **Subheadings:** Semi-bold, 16-18px (Card titles, section headers)
- **Body Text:** Regular, 14-16px (Transaction details, labels)
- **Small Text:** Regular, 12-14px (Hints, secondary info)

---

## Animations & Interactions

### Subtle Animations

1. **Card Entrance:** Fade-in + slight scale (duration: 250ms)
2. **Button Press:** Scale 0.97 + haptic feedback (duration: 80ms)
3. **Progress Bar Fill:** Smooth transition (duration: 300ms)
4. **Chart Rendering:** Staggered bar/pie segment animation (duration: 400ms)
5. **Tab Transition:** Fade + slide (duration: 200ms)

### Wave-Inspired Metaphor

- Envelope cards have subtle wave-like shadow/depth
- Progress bars use gradient fills suggesting flow
- Transitions between screens feel fluid and natural

---

## Layout Principles

- **One-Handed Usage:** All interactive elements within thumb reach (bottom half of screen)
- **Safe Area:** Proper padding for notch and home indicator
- **Spacing:** Generous padding (16-24px) for breathing room
- **Lists:** Use FlatList for performance
- **Modals:** Bottom sheet style for data entry (feels less intrusive)

---

## Accessibility

- Color contrast: WCAG AA compliant
- Touch targets: Minimum 44x44pt
- Text sizes: Readable at default system size
- Haptic feedback: Subtle, not overwhelming

---

## State Management

- Use React Context + AsyncStorage for local persistence
- No backend required for MVP (local-only data)
- Data structure:
  - Envelopes: `{ id, name, budget, createdAt }`
  - Transactions: `{ id, amount, category, date, notes, createdAt }`

