document.addEventListener('DOMContentLoaded', function() {
    // Initialize CodeMirror for syntax highlighting
    const codeEditor = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
        mode: "python",
        theme: "dracula",
        lineNumbers: true,
        indentUnit: 4,
        smartIndent: true,
        indentWithTabs: false,
        lineWrapping: true,
        extraKeys: {
            "Tab": (cm) => {
                if (cm.somethingSelected()) {
                    cm.indentSelection("add");
                } else {
                    cm.replaceSelection("    ", "end");
                }
            },
            "Ctrl-Enter": function() {
                runCode();
            }
        }
    });

    // Example code to show when the page loads
    const exampleCode = `# Welcome to Python Practice Terminal!
# Try running some Python code.
# For example:

print("Hello, Python World!")

# Basic calculation
result = 5 * 10
print(f"5 x 10 = {result}")

# Create a simple list and iterate through it
fruits = ["apple", "banana", "cherry"]
print("List of fruits:")
for fruit in fruits:
    print(f"- {fruit}")`;

    codeEditor.setValue(exampleCode);

    // Initialize elements
    const outputElement = document.getElementById('output');
    const runButton = document.getElementById('runCode');
    const clearConsoleButton = document.getElementById('clearConsole');
    const resetTerminalButton = document.getElementById('resetTerminal');
    const commandHistoryElement = document.getElementById('commandHistory');
    const copyOutputButton = document.getElementById('copyOutput');
    const copyCodeButton = document.getElementById('copyCode');
    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    const errorText = document.getElementById('errorText');

    // Command history array
    let commandHistory = [];
    
    // Function to run the Python code
    async function runCode() {
        const code = codeEditor.getValue();
        
        if (!code.trim()) {
            return;
        }
        
        // Disable run button and show spinner
        runButton.disabled = true;
        runButton.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Running...';
        
        try {
            const response = await fetch('/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Add to output console
            let outputContent = '';
            if (data.output) {
                outputContent += data.output;
            }
            if (data.error) {
                outputContent += `\n<span class="text-danger">${data.error}</span>`;
                
                // Show error modal for serious errors
                if (data.error.includes('Execution timed out') || 
                    data.error.includes('Internal server error')) {
                    errorText.textContent = data.error;
                    errorModal.show();
                }
            }
            
            // Update output
            outputElement.innerHTML += `<div class="mb-3">
                <div class="text-info mb-1"># Command:</div>
                <pre class="mb-2 ps-3">${escapeHtml(code)}</pre>
                <div class="text-info mb-1"># Output:</div>
                <pre class="ps-3">${outputContent || '<span class="text-muted">(No output)</span>'}</pre>
                <hr>
            </div>`;
            
            // Auto-scroll to the bottom of the output
            outputElement.scrollTop = outputElement.scrollHeight;
            
            // Add to command history if it's not already there
            if (!commandHistory.some(cmd => cmd === code)) {
                commandHistory.unshift(code);
                // Keep only last 10 commands
                commandHistory = commandHistory.slice(0, 10);
                updateCommandHistory();
            }
            
        } catch (error) {
            console.error('Error:', error);
            outputElement.innerHTML += `<div class="text-danger mb-3">Error: ${error.message}</div>`;
        } finally {
            // Re-enable run button
            runButton.disabled = false;
            runButton.innerHTML = '<i class="fas fa-play me-1"></i>Run';
        }
    }
    
    // Update the command history display
    function updateCommandHistory() {
        commandHistoryElement.innerHTML = '';
        
        commandHistory.forEach((cmd, index) => {
            const previewText = cmd.split('\n')[0].substring(0, 50) + (cmd.length > 50 ? '...' : '');
            
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item command-item';
            listItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <span class="command-item-code">${escapeHtml(previewText)}</span>
                    <button class="btn btn-sm btn-outline-secondary load-command">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                </div>
            `;
            
            // Add event listener to load the command
            listItem.querySelector('.load-command').addEventListener('click', () => {
                codeEditor.setValue(cmd);
                codeEditor.focus();
            });
            
            commandHistoryElement.appendChild(listItem);
        });
        
        // Show message if no commands in history
        if (commandHistory.length === 0) {
            commandHistoryElement.innerHTML = '<li class="list-group-item text-muted">No command history yet</li>';
        }
    }
    
    // Clear the console output
    function clearConsole() {
        outputElement.innerHTML = '';
    }
    
    // Reset the terminal to initial state
    function resetTerminal() {
        clearConsole();
        codeEditor.setValue(exampleCode);
        commandHistory = [];
        updateCommandHistory();
    }
    
    // Copy output to clipboard
    function copyOutput() {
        const text = outputElement.innerText;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyOutputButton.innerHTML;
            copyOutputButton.innerHTML = '<i class="fas fa-check me-1"></i>Copied!';
            setTimeout(() => {
                copyOutputButton.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    }
    
    // Copy code to clipboard
    function copyCode() {
        const text = codeEditor.getValue();
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyCodeButton.innerHTML;
            copyCodeButton.innerHTML = '<i class="fas fa-check me-1"></i>Copied!';
            setTimeout(() => {
                copyCodeButton.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    }
    
    // Helper function to escape HTML
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // Add event listeners
    runButton.addEventListener('click', runCode);
    clearConsoleButton.addEventListener('click', clearConsole);
    resetTerminalButton.addEventListener('click', resetTerminal);
    copyOutputButton.addEventListener('click', copyOutput);
    copyCodeButton.addEventListener('click', copyCode);
    
    // Initialize command history
    updateCommandHistory();
    
    // Focus on the code editor
    codeEditor.focus();
});
