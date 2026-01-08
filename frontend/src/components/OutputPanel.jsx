/**
 * Render an output panel that shows a prompt when no run has been executed or the run results when available.
 *
 * @param {{success: boolean, output?: string, error?: string}|null} output - The run result to display, or `null` when no run has occurred.
 *   - When an object:
 *     - `success`: whether the run completed successfully.
 *     - `output` (optional): standard output text to show.
 *     - `error` (optional): error text to show when `success` is false.
 * @returns {JSX.Element} The panel element containing the header and the appropriate output or prompt content.
 */
function OutputPanel({output}) {
  return  <div className="h-full bg-base-100 flex flex-col">
    <div className="px-4 py-2 bg-base-200 border-b border-base-300 
    font-semibold text-sm">Output</div>
    <div className="flex-1 overflow-auto p-4">
      {output === null ? (
        <p className="text-sm font-mono text-success whitespace-pre-wrap"> 
          Click "Run Code" to see the output here... 
        </p>
      ):(
       output.success ? (
        <pre className="text-sm font-mono text-success whitespace-pre-wrap">{output.output}</pre>
       ):(
        <div>{ output.output && (
        <pre className="text-sm font-mono text-success whitespace-pre-wrap mb-2">
          {output.output}
        </pre>)}
        <pre className="text-sm font-mono text-success whitespace-pre-wrap">
          {output.error}
        </pre>
        </div>
       )
      )}
    </div>
    </div>
}

export default OutputPanel;