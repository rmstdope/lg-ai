// Home route component (meta handled via index.html or future head manager)
import { NavLink } from "react-router-dom";
import { SineScroller } from "../components/sine-scroller";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
      <div className="max-w-4xl mx-auto flex-1">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome to your productivity hub
          </h2>
          <p className="text-muted-foreground">
            Stay organized and productive with your tasks
          </p>
        </div>

        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">
              Ready to build your todo app! 🚀
            </span>
          </div>
          {/* Sine Scroller moved higher up */}
          <div>
            <SineScroller 
              text="*** WELCOME TO THE 80s RETRO EXPERIENCE *** STAY PRODUCTIVE AND ORGANIZED *** "
              className="border border-cyan-500/30 rounded-lg shadow-lg shadow-cyan-500/20"
              speed={3}
              amplitude={15}
              frequency={0.008}
            />
          </div>
          <NavLink
            to="/todos"
            className={({ isActive }) =>
              `inline-flex items-center px-5 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium ${isActive ? '' : ''}`
            }
          >
            Go to Todos →
          </NavLink>
          <NavLink
            to="/kanban"
            className={({ isActive }) =>
              `inline-flex items-center px-5 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-medium ${isActive ? '' : ''}`
            }
          >
            Go to Kanban →
          </NavLink>
        </div>
      </div>
    </div>
  );
}
