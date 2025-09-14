// Home route component (meta handled via index.html or future head manager)

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome to your productivity hub
          </h2>
          <p className="text-muted-foreground">
            Stay organized and productive with your tasks
          </p>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">
              Ready to build your todo app! 🚀
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
