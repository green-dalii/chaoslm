# Changelog

All notable changes to the "chaoslm" project will be documented in this file.

## [Unreleased]

### Added
- **Refined Model Manager**: 
    - **Dropdown Selection**: Add providers cleanly via dropdown instead of a long list.
    - **Auto-Fill Base URLs**: Automatically sets correct Base URLs for DeepSeek (`api.deepseek.com`), Kimi (`api.moonshot.cn`), Minimax (`api.minimax.chat`), Zhipu (`open.bigmodel.cn`), and Ollama (`localhost:11434`).
- **AI Host Configuration**: 
    - When joining as a Participant or Observer, users can now explicitly choose the **Provider** and **Model** for the AI Moderator.
- **Strict Validation**:
    - Prevents adding agents without selecting a model.
    - Prevents starting the debate without a configured Host.
    - Input fields are clearer and safer.

### Changed
- **UI UX**: Improved `SetupScreen` layout with step-based wizard improvements and better visual feedback.
- **Provider Cards**: Model Manager displays active providers as clean cards.

### Fixed
- **Startup Logic**: Fixed issues where "Start Debate" might be clicked prematurely.
- **Agent Roles**: AI Host is properly distinguished in the system.
