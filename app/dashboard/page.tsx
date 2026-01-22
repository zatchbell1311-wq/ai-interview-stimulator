export default function DashboardPage() {
    return (
        <div className="min-h-screen p-12 bg-neutral-950 text-white flex flex-col items-center">
            <h1 className="text-4xl font-bold mb-8">Performance Report</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
                <div className="p-6 border border-zinc-800 rounded bg-zinc-900/50">
                    <h3 className="text-zinc-500 text-sm uppercase mb-2">Confidence Score</h3>
                    <p className="text-5xl font-bold text-emerald-400">82%</p>
                </div>

                <div className="p-6 border border-zinc-800 rounded bg-zinc-900/50">
                    <h3 className="text-zinc-500 text-sm uppercase mb-2">Filler Words</h3>
                    <p className="text-5xl font-bold text-yellow-400">12</p>
                </div>

                <div className="p-6 border border-zinc-800 rounded bg-zinc-900/50">
                    <h3 className="text-zinc-500 text-sm uppercase mb-2">Est. Hire Probability</h3>
                    <p className="text-5xl font-bold text-zinc-200">High</p>
                </div>
            </div>

            <div className="mt-12 w-full max-w-4xl">
                <h3 className="text-xl mb-4">Feedback</h3>
                <div className="p-6 bg-zinc-900 rounded border border-zinc-800">
                    <p className="text-zinc-400">
                        "Good structural use of the STAR method, but you tended to speed up when discussing failures.
                        Try to maintain a steady pace to project authority."
                    </p>
                </div>
            </div>
        </div>
    );
}
