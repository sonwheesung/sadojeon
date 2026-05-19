// Shared constants for tab-bar layout. Kept in a leaf module so that both
// `useTabBarScreenOptions` and `ActiveTabBg` can import without forming a
// circular dependency.

export const TAB_BAR_HEIGHT = 76;
export const TAB_BAR_PADDING_V = 6;
export const TAB_BAR_LABEL_SIZE = 11;
export const TAB_BAR_LABEL_LINE_HEIGHT = 14;
export const TAB_BAR_LABEL_MARGIN_TOP = 5;
export const TAB_BAR_BORDER_WIDTH = 1;

// Vertical inset of the active card relative to the tab cell. Negative values
// push the card into the tab bar's vertical padding so the card stays taller
// than the icon+label content area (gives the label breathing room).
export const TAB_ACTIVE_BG_INSET_V = -5;
export const TAB_ACTIVE_BG_INSET_H = -12;
