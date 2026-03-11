import { TrophyIcon, UsersIcon } from "lucide-react";

/**
 * Render two statistic cards showing active and recent session counts.
 *
 * @param {Object} props
 * @param {number} props.activeSessionsCount - Current number of active sessions displayed in the "Live" card.
 * @param {number} props.recentSessionsCount - Total number of recent sessions displayed in the "Total Sessions" card.
 * @returns {JSX.Element} A container element with two styled cards: one for active sessions and one for recent/total sessions.
 */
function StatsCards({ activeSessionsCount, recentSessionsCount }) {
  return (
    <div className="lg:col-span-1 grid grid-cols-1 gap-6">
      {/* Active Count */}
      <div className="card bg-base-100 border-2 border-emerald-300/55 hover:border-emerald-400/85">
        <div className="card-body">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <UsersIcon className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="badge bg-emerald-600 text-black border-none rounded-full">Live</div>
          </div>
          <div className="text-4xl font-black mb-1">{activeSessionsCount}</div>
          <div className="text-sm opacity-60">Active Sessions</div>
        </div>
      </div>

      {/* Recent Count */}
      <div className="card bg-base-100 border-2 border-emerald-300/55 hover:border-emerald-400/85">
        <div className="card-body">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-secondary/10 rounded-2xl">
              <TrophyIcon className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
          <div className="text-4xl font-black mb-1">{recentSessionsCount}</div>
          <div className="text-sm opacity-60">Total Sessions</div>
        </div>
      </div>
    </div>
  );
}

export default StatsCards;