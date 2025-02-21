/* scripts.js
-----------
This file handles the typing animation within the code editor.
It types out and then deletes sample Roblox scripts with a human-like effect.
The minimap updates in real time.
It also handles FAQ item toggling.
*/

// Array of sample Roblox scripts
const scripts = [
  `local player = game.Players.LocalPlayer
local character = player.CharacterAdded:Wait()

local function speedBoost()
  local humanoid = character:WaitForChild("Humanoid")
  humanoid.WalkSpeed = 50
end

speedBoost()`,
  `local TweenService = game:GetService("TweenService")
local part = script.Parent

local tweenInfo = TweenInfo.new(
  2, -- Duration in seconds
  Enum.EasingStyle.Quad, -- Easing style
  Enum.EasingDirection.Out -- Easing direction
)

local goals = {
  Position = part.Position + Vector3.new(0, 10, 0)
}

local tween = TweenService:Create(part, tweenInfo, goals)

tween:Play()`,
  `local function createESP()
  for _, player in pairs(game.Players:GetPlayers()) do
    if player.Character then
      local highlight = Instance.new("Highlight")
      highlight.Parent = player.Character
      highlight.FillTransparency = 0.5
      highlight.OutlineColor = Color3.fromRGB(255, 0, 0)
    end
  end
end

createESP()`
];

let currentScriptIndex = 0; // Index of the current script
let currentCharIndex = 0;   // Current character index for the script
let errorChance = 0.02;       // Chance of making a typo
let backspaceSpeed = 20;      // Delay for backspacing in ms

// Get DOM elements
const codeDisplay = document.getElementById("code-display");
const lineNumbers = document.getElementById("line-numbers");
const minimapCodeDisplay = document.getElementById("minimap-code-display");

/**
 * Updates the minimap content to match the current code with syntax highlighting.
 */
function updateMinimap() {
  if (minimapCodeDisplay) {
    minimapCodeDisplay.innerHTML = Prism.highlight(codeDisplay.textContent, Prism.languages.lua, 'lua');
  }
}

/**
 * Updates the line numbers based on the number of lines in the code.
 * @param {string} text - The current code content.
 */
function updateLineNumbers(text) {
  const lineCount = text.split('\n').length;
  lineNumbers.innerHTML = Array.from({ length: lineCount }, (_, i) => `<div>${i + 1}</div>`).join('');
}

/**
 * Types a character with realistic delays and occasional errors.
 */
function typeCharacter() {
  const currentScript = scripts[currentScriptIndex];
  if (currentCharIndex <= currentScript.length) {
    let char = currentScript[currentCharIndex];
    let delay = Math.random() * 50 + 25; // Base typing speed

    // Slower typing for punctuation and spaces
    if (/[.,\/#!$%\^&\*;:{}=\-_`~() ]/.test(char)) {
      delay += Math.random() * 50 + 50;
    }
    // Pause for new lines
    if (char === '\n') {
      delay += 150;
    }

    // Simulate typo
    if (Math.random() < errorChance) {
      simulateTypo();
      return; // Will resume typing in simulateTypo after correction
    }

    codeDisplay.textContent += char;
    updateLineNumbers(codeDisplay.textContent);
    Prism.highlightElement(codeDisplay);
    updateMinimap();
    currentCharIndex++;
    setTimeout(typeCharacter, delay);
  } else {
    // Wait 2 seconds after typing is done, then start deleting
    setTimeout(deleteScript, 2000);
  }
}

/**
 * Simulates a typo by backspacing and re-typing a character.
 */
function simulateTypo() {
  let currentText = codeDisplay.textContent;
  if (currentText.length > 0) {
    codeDisplay.textContent = currentText.slice(0, -1); // Backspace
    updateLineNumbers(codeDisplay.textContent);
    Prism.highlightElement(codeDisplay);
    updateMinimap();
    setTimeout(() => {
      // Re-type the correct character after backspacing
      const correctChar = scripts[currentScriptIndex][currentCharIndex];
      codeDisplay.textContent += correctChar;
      updateLineNumbers(codeDisplay.textContent);
      Prism.highlightElement(codeDisplay);
      updateMinimap();
      currentCharIndex++;
      setTimeout(typeCharacter, Math.random() * 50 + 50); // Slightly slower after error
    }, backspaceSpeed); // Quick backspace
  } else {
    // If for some reason we try to backspace on empty, just continue typing
    typeCharacter();
  }
}

/**
 * Recursively deletes the code one character at a time,
 * using a random delay to mimic human deletion.
 */
function deleteScript() {
  if (codeDisplay.textContent.length > 0) {
    // Remove the last character
    codeDisplay.textContent = codeDisplay.textContent.slice(0, -1);
    updateLineNumbers(codeDisplay.textContent);
    Prism.highlightElement(codeDisplay);
    updateMinimap();
    // Random delay between 20ms and 50ms per deletion
    const delay = 20 + Math.random() * 30;
    setTimeout(deleteScript, delay);
  } else {
    // Move to the next script when deletion is complete
    currentScriptIndex = (currentScriptIndex + 1) % scripts.length;
    currentCharIndex = 0;
    setTimeout(typeCharacter, 500);
  }
}

/**
 * Starts the typing animation.
 */
function startTyping() {
  codeDisplay.textContent = ''; // Clear any existing text
  currentCharIndex = 0; // Reset character index
  typeCharacter();
}

// Initialize the typing animation
startTyping();