/** @type {const} */
const themeColors = {
  // Velth: Warm beige/tan palette for mindful money management
  primary: { light: '#D4A574', dark: '#D4A574' },  // Warm tan/gold accent
  background: { light: '#F5F1E8', dark: '#2A2520' },  // Soft beige background
  surface: { light: '#FFFBF5', dark: '#3D3530' },  // Cream white surface
  foreground: { light: '#3D3D3D', dark: '#F5F1E8' },  // Dark gray text
  muted: { light: '#8B8B8B', dark: '#B8A89F' },  // Medium gray secondary text
  border: { light: '#E8DFD5', dark: '#5A4F47' },  // Light beige border
  success: { light: '#6BA576', dark: '#8BC34A' },  // Soft green for income
  warning: { light: '#D97D6A', dark: '#FF7043' },  // Warm coral for expenses
  error: { light: '#D97D6A', dark: '#FF7043' },  // Same as warning for consistency
};

module.exports = { themeColors };
