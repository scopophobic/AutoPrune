"use client";
import { useState } from "react";
import { Resource } from "sst"; // This magically imports the Lambda URL

export default function Home() {
  const [zombies, setZombies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  async function callApi(action: "scan" | "delete") {
    setLoading(true);
    setStatusMsg("");
    try {
      // Resource.AutopruneApi.url comes from SST
      const res = await fetch(Resource.AutopruneApi.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: action })
      });
      const data = await res.json();
      setZombies(data.zombies || []);
      setStatusMsg(data.message);
    } catch (e) {
      setStatusMsg("Error connecting to AutoPrune API");
      console.error(e);
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black text-white p-12 font-sans">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 flex justify-between items-center border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-4xl font-bold text-emerald-400">✂️ AutoPrune</h1>
            <p className="text-gray-400 mt-2">Cloud Cost Optimization & Zombie Hunter</p>
          </div>
          <button 
            onClick={() => callApi("scan")}
            disabled={loading}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Scanning..." : "🔍 Scan Now"}
          </button>
        </header>

        {statusMsg && (
          <div className="mb-8 p-4 bg-gray-900 border border-gray-700 rounded text-emerald-300">
            {statusMsg}
          </div>
        )}

        <div className="space-y-4">
          {zombies.length === 0 && !loading && (
            <div className="text-center py-20 text-gray-500">
              No zombies detected. Your cloud is clean!
            </div>
          )}

          {zombies.map((z) => (
            <div key={z.VolumeId} className="flex justify-between items-center p-5 bg-gray-900 border border-gray-800 rounded-xl hover:border-emerald-500/30 transition-all">
              <div>
                <p className="font-mono text-lg text-emerald-200">{z.VolumeId}</p>
                <p className="text-sm text-gray-500">{z.Size} GB • {z.State}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-white">${z.PricePerMonth.toFixed(2)}</p>
                <p className="text-xs text-gray-500">per month</p>
              </div>
            </div>
          ))}
        </div>

        {zombies.length > 0 && (
          <div className="mt-10 border-t border-gray-800 pt-6 text-right">
            <p className="text-gray-400 mb-4 text-sm">
              Ready to save <b>${zombies.reduce((acc, z) => acc + z.PricePerMonth, 0).toFixed(2)}</b> / month?
            </p>
            <button 
              onClick={() => callApi("delete")}
              disabled={loading}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg shadow-red-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔥 Prune All Volumes
            </button>
          </div>
        )}
      </div>
    </main>
  );
}




