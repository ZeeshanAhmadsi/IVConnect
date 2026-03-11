import { Code2Icon, Loader, LoaderIcon, PlusIcon } from "lucide-react";
import { PROBLEMS } from "../data/problem";
/**
 * Renders a modal for configuring and creating a new coding session.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {() => void} props.onClose - Callback invoked to close the modal.
 * @param {{problem: string, difficulty?: string}} props.roomConfig - Current room configuration; `problem` is the selected problem title.
 * @param {(config: {problem: string, difficulty?: string}) => void} props.setRoomConfig - Setter for updating the room configuration.
 * @param {() => void} props.onCreateRoom - Callback invoked to create the room.
 * @param {boolean} props.isCreating - Whether room creation is in progress.
 * @returns {JSX.Element|null} The modal element when open, or `null` if closed.
 */
function CreateSessionModal({
  isOpen,
  onClose,
  roomConfig,
  setRoomConfig,
  onCreateRoom,
  isCreating,
}) {
  const problems = Object.values(PROBLEMS);

  if (!isOpen) return null; // if create session is not opened

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-2xl mb-6">Create New Session</h3>

        <div className="space-y-8">
          {/* PROBLEM SELECTION */}
          <div className="space-y-2">
            <label className="label">
              <span className="label-text font-semibold">Select Problem</span>
              <span className="label-text-alt text-error">*</span>
            </label>

            <select className="select w-full"
              value={roomConfig.problem}
              onChange={(e) => {
                const selectedProblem = problems.find(
                  p => p.title === e.target.value,
                );
                setRoomConfig({
                  difficulty: selectedProblem.difficulty,
                  problem: e.target.value,
                });
              }}
            >
              <option value="" disabled>
                Choose a coding problem...
              </option>
              {problems.map((problem) => (
                <option key={problem.id} value={problem.title}>
                  {problem.title} {problem.difficulty}
                </option>
              ))}
            </select>
          </div>

          {/* Room Summary */}
          {roomConfig.problem && (
            <div className="alert alert-success">
              <Code2Icon className="size-5" />
              <div>
                <p className="font-semibold">Room Summary:</p>
                <p>
                  Problem:{" "}
                  <span className="font-medium">{roomConfig.problem}</span>
                </p>
                <p>
                  Max Participants:{" "}
                  <span className="font-medium">2 (1-on-1 session)</span>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>

          <button className="btn btn-primary gap-2"
            onClick={onCreateRoom}
            disabled={isCreating || !roomConfig.problem}>
              {isCreating ? (
                <LoaderIcon className="size-5 animation-spin"/>
              ):(
                <PlusIcon className="size-5"/>
              )}
              {isCreating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

export default CreateSessionModal;
