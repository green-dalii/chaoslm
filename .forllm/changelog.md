# Changelog

All notable changes to the "chaoslm" project will be documented in this file.

## [Phase 34] - 2026-02-15
### Added
- **ChaosLM System Model Configuration**: New settings page section to configure the default model for ChaosLM system operations (bootstrap generation, etc.).
- **Homepage Configuration Check**: Modal dialog on homepage that checks if model providers and system model are configured before allowing new sessions.
- **AI Host Configuration in Step 1**: When user selects non-host role, AI moderator configuration now appears immediately in Step 1 instead of Step 2.
- **Auto-fill from System Model**: AI Host configuration is automatically pre-filled from the ChaosLM system model settings.
- **Configuration Status Indicators**: Visual badges on homepage showing configuration status for model providers and system model.

### Fixed
- **Internal Instructions Leak**: Fixed bug where internal scheduling instructions like `[OPENING_AI_HOST]:` were being displayed in chat. Now only non-internal messages are shown.

## [Phase 33] - 2026-02-15
### Added
- **Universal Input Box**: All user roles (including observers) can now see the input box and join discussion anytime.
- **Smart Send Button**: Send button is disabled during AI turns and enabled only when it's the user's turn.
- **Detailed Description Field**: Optional textarea in setup screen for additional context/instructions that gets injected into all participants' prompts.
- **Auto-deduplication for Member Names**: When adding agents without explicit names, system automatically appends counters to avoid duplicates (e.g., "GPT-4o", "GPT-4o-2", "GPT-4o-3").

### Changed
- Updated member name placeholder to indicate auto-naming behavior.
- Enhanced input UX with context-aware placeholders and tooltips.
- **Setup Screen Layout Fix**: Moved member list from left column (which was getting cut off) to right sidebar "Live Preview" area for better visibility and scrolling.

## [Unreleased]

### Added
- **Multi-language Support (i18n)**: 
    - Full support for **English** and **Chinese**.
    - Persistent language preference via `useSettingsStore`.
- **Global Navbar**:
    - Persistent navigation across all screens.
    - Integrated language switcher.
- **Enhanced Setup Screen**:
    - Completely localized form labels and tooltips.
    - Dynamic agent prompts that respect the selected language.

### Phase 24: Terminology Refinement & Layout Fixes
#### Added
- Holistic terminology pivot from "Debate" to "Discussion/Arena" across English and Chinese localizations.
#### Changed
- Redesigned `/arena` layout to a fixed-sidebar model with localized scrollable chat area.
- Optimization of `/setup` screen: Auto-hides "Stance" selection in Standard discussion mode for a cleaner UX.
- Improved i18n key consistency and resolved related TypeScript lint errors.
## [Phase 26] - 2026-02-10
### Added
- Manual Theme Switcher (Light/Dark/System) in the Navbar.
- Theme state management in `use-settings-store.ts`.
- `motion` animations for Navbar items.

### Changed
- Refined Navbar alignment: removed `max-w-7xl` constraint and standardized padding to align with page content.
- Fixed Setup screen layout: resolved Navbar overlap by adjusting container padding and margin.
- Expanded `Models & Keys` column in Setup screen for better breathing room on larger screens.
- Improved `ModelManager` component styling: unified color palette for light/dark modes and added better spacing/icons.
- Enhanced `Live Preview` box in Setup screen with a more structured and modern look.

### Fixed
- General UI consistency issues across theme switches (text contrast, input visibility).
- Navbar items alignment with the overall grid.

## [Phase 25] - 2026-02-10
### Fixed
- **Arena Layout**: Forced internal scrolling by setting root layout to `overflow-hidden`. Sidebars are now truly fixed.
- **Missing Buttons**: Restored "Stop Output" and "End Discussion" buttons in the Arena header with improved visibility.
- **Setup Navigation**: Added a "Back" button to Step 2 (Member Management) to allow returning to Step 1.
- **Mobile Responsiveness**: Fixed "Models & Keys" section on the Setup screen; it now stacks vertically on smaller screens instead of being hidden.
- **Layout Hardening**: Standardized header heights and container sizing across the app.

### Changed
- **Homepage**: Improved with direct Arena entry point and localized content.
- **Chat Arena**: Localized all participant info, session tags, and system messages.
- **UI UX**: Refined layouts to accommodate the global Navbar and improve mobile/desktop responsiveness.

### Fixed
- **Startup Logic**: Fixed issues where "Start Debate" might be clicked prematurely.
- **Agent Roles**: AI Host is properly distinguished in the system.
