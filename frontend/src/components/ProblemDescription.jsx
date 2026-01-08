import { getDifficultyBadgeClass } from "../lib/utils";

/**
 * Render a detailed problem view with header, difficulty badge, selector, description, examples, and constraints.
 *
 * @param {Object} props
 * @param {Object} props.problem - Problem data: { title, difficulty, category, description, examples, constraints }.
 *   description: { text: string, notes: string[] }.
 *   examples: Array<{ input: string, output: string, explanation?: string }>.
 *   constraints: string[].
 * @param {string|number} props.currProblemID - Currently selected problem ID used by the selector.
 * @param {(id: string|number) => void} props.onProblemChange - Callback invoked with the newly selected problem ID.
 * @param {Array<{ id: string|number, title: string, difficulty: string }>} props.allProblems - List of problems to populate the selector.
 * @returns {import('react').ReactElement} A React element representing the problem detail pane.
 */
function ProblemDescription({
  problem,
  currProblemID,
  onProblemChange,
  allProblems,
}) {
  return (
    <div className="h-full overflow-y-auto bg-base-200">
      {/*Header Section*/}
      <div className="p-6 bg-base-100 border-b border-base-300">
        <div className="flex items-start justify-between mb-3">
          <h1 className="text-3xl font-bold text-base-content">
            {problem.title}
          </h1>
          <span
            className={`badge ${getDifficultyBadgeClass(problem.difficulty)}`}
          >
            {problem.difficulty}
          </span>
        </div>
        <p className="text-base-content/60">{problem.category}</p>

        {/*Problem selector*/}
        <div className="mt-4">
          <select
            className="select select-sm w-full"
            value={currProblemID}
            onChange={(e) => onProblemChange(e.target.value)}
          >
            {allProblems.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} - {p.difficulty}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Problem Description */}
        <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
          <h2 className="text-xl font-bold text-base-content">Description</h2>
          <div className="space-y-3 text-base leading-relaxed">
            <p className="text-base-content/90">{problem.description.text}</p>
            {problem.description.notes.map((note, idx) => (
              <p key={idx} className="text-base-content/90">
                {note}
              </p>
            ))}
          </div>
        </div>

        {/*Examples Section*/}
        <div className="bg-base-100 rounded-xl shadow-sm  p-5  border border-base-300">
          <h2 className="text-xl font-bold mb-4 text-base-content">Examples</h2>
          <div className="space-y-4">
            {problem.examples.map((example, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-sm">{idx + 1}</span>
                  <p className="font-semibold text-base-content">
                    Example {idx + 1}
                  </p>
                </div>
                <div className="bg-base-200 rounded-lg p-4 font-mono text-sm space-y-1.5">
                  <div className="flex gap-2">
                    <span className="text-primary font-bold min-w-[70px]">
                      Input:
                    </span>
                    <span>{example.input}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-secondary font-bold min-w-[70px]">
                      Output:
                    </span>
                    <span>{example.output}</span>
                  </div>
                  {example.explanation && (
                    <div className="pt-2 border-t border-base-300 mt-2">
                      <span className="text-base-content/60 font-sans text-xs">
                        <span className="font-semibold">Explanation:</span>{" "}
                        {example.explanation}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/*Constraint Section*/}
        <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
          <h2 className="text-xl font-bold mb-4 text-base-content">Constraints</h2>
          <ul className="space-y-2 text-base-content/90">
          {problem.constraints.map((constraint,idx)=>(
            <li key={idx} className="flex gap-2">
              <span className="text-emerald-600">•</span>
              <code className="text-sm">{constraint}</code>
            </li>
          ))}</ul>
        </div>
      </div>
    </div>
  );
}

export default ProblemDescription;