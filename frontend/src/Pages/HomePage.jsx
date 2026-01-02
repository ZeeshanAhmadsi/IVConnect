import {
  SignInButton,
} from "@clerk/clerk-react";
import { Link } from "react-router";
import { ArrowRightIcon, CheckIcon, Code2Icon, Orbit, UsersIcon, VideoIcon, ZapIcon } from "lucide-react";
function HomePage() {
  return (
    <div className="bg-gradient-to-br from-base-100 via-base-200 to-base-300">
      {/*Navbar*/}
      <nav className="bg-base-100/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
          {/*Logo*/}
          <Link
            to={"/"}
            className="flex items-center gap-3 hover:scale-105 transition-transform duration-200"
          >
            <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-emerald-800 flex items-center justify-center shadow-lg">
              <Orbit className="size-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-600 bg-clip-text text-transparent font-mono tracking-wider">
                IVConnect
              </span>
              <span className="text-sm text-base-content/60 font-medium">
                Code Together
              </span>
            </div>
          </Link>

          {/*Auth Btn */}
          <SignInButton mode="modal">
            <button className="group px-6 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700  rounded-xl text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2">
              <span>Get Started</span>
              <ArrowRightIcon className="size-4 group-hover:translate-x-0.5"/>
            </button>
          </SignInButton>
        </div>
      </nav>

      {/*Hero Section*/}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/*Left Section*/}
          <div className="space-y-8">
            <div className="badge badge-lg  text-white bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900 rounded-full">
              <ZapIcon className="size-4"/>
              Real-time Collaboration
            </div>
            <h1 className="text-5xl lg:text-7xl font-black leading-tight">
              <span className="bg-gradient-to-r from-[#73f0ddeb] via-[#3eec6c] to-[#31f0c7] bg-clip-text text-transparent">
                Code Together,
              </span>
              <br/>
              <span className="bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-200 bg-clip-text text-transparent">
                Learn Together
              </span>
            </h1>
            <p className="text-xl text-base-content/60 leading-relaxed max-w-xl">
              The ultimate platform for collaborative coding interviews and pair programming.
              Connect face-to-face, code in real-time, and ace your technical interviews. 
            </p>

            {/*Feature Pills */}
            <div className="flex flex-wrap gap-3">
              <div className="badge badge-lg badge-outline rounded-4xl">
                <CheckIcon className="size-4 text-success"/>
                Live Video Chat
              </div>
              <div className="badge badge-lg badge-outline rounded-4xl">
                <CheckIcon className="size-4 text-success"/>
                Code Editor
              </div>
              <div className="badge badge-lg badge-outline rounded-4xl">
                <CheckIcon className="size-4 text-success"/>
                Multi-Language
              </div>
            </div>

            {/*Call To Action buttons*/}
          <div className="flex flex-wrap gap-4">
              <SignInButton mode="modal">
                <button className="btn btn-lg bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full">
                  Start Coding Now
                  <ArrowRightIcon className="size-5"/>
                </button>
              </SignInButton>
              <button className="btn btn-outline btn-lg rounded-full">
                <VideoIcon className="size-5"/>
                Watch Demo
              </button>
          </div>

          {/*Stats*/}
          <div className="stats stats-vertical lg:stats-horizontal bg-base-100 shadow-lg">
            <div className="stat">
              <div className="stat-value text-emerald-400">10K+</div>
              <div className="stat-title">Active Users</div>
            </div>

            <div className="stat">
              <div className="stat-value text-emerald-500">50K+</div>
              <div className="stat-title">Sessions</div>
            </div>

            <div className="stat">
              <div className="stat-value text-emerald-600">99.9%</div>
              <div className="stat-title">Uptime</div>
            </div>
         </div>


        </div>

          {/*Right Section*/}
          <img
          src="/hero.png"
          alt= "CodeCollboration platform"
          className="w-full h-auto rounded-3xl shadow-2xl border-4 border-base-100 hover:scale-105 transition-transform duration-500"/>
        </div>
      </div>

      {/* Footer Feature Sections */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Everything You Need to <span className="text-emerald-600 font-mono">Succeed</span> 
          </h2>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Powerful features designed to make your coding interviews seamless and productive
          </p>
        </div>
        
        {/*Features grid*/}
        <div className="grid md:grid-cols-3 gap-8">

          {/*Feature 1 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <VideoIcon className="size-8 text-emerald-500"/>
              </div>
              <h3 className="card-title">HD Video Call</h3>
              <p className="text-based-content/70">
              Crystal clear video and audio for seamless communication during interviews</p>
            </div>
          </div>

          {/*Feature 2 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Code2Icon className="size-8 text-emerald-500"/>
              </div>
              <h3 className="card-title">Live Code Editor</h3>
              <p className="text-based-content/70">
              Collaborate in real-time with syntax highlighting and multiple language support </p>
            </div>
          </div>

          {/*Feature 3 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <UsersIcon className="size-8 text-emerald-500"/>
              </div>
              <h3 className="card-title">Easy Collaboration</h3>
              <p className="text-based-content/70">
              Share your screen, discuss solutions, and learn from each other in real-time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
