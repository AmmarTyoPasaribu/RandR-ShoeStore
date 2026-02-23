import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function AdminRecommendations({ accessToken }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [trainingResult, setTrainingResult] = useState(null);

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/shoe_recommendations", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setRecommendations(response.data || []);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTrainModel = async () => {
    setTraining(true);
    setTrainingResult(null);
    try {
      const response = await axios.post("http://localhost:5000/api/train_recommendation", {}, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setTrainingResult({ success: true, message: response.data.message || "Training completed!", status: response.data.status });
      Swal.fire({
        icon: response.data.status === "skipped" ? "info" : "success",
        title: response.data.status === "skipped" ? "Skipped" : "Complete!",
        text: response.data.message,
        background: '#1c1917', color: '#fff', confirmButtonColor: '#f59e0b', timer: 3000, timerProgressBar: true,
      });
      await fetchRecommendations();
    } catch (error) {
      console.error("Error training model:", error);
      const errorMsg = error.response?.data?.error || "Failed to train model.";
      setTrainingResult({ success: false, message: errorMsg });
      Swal.fire({ icon: "error", title: "Failed", text: errorMsg, background: '#1c1917', color: '#fff', confirmButtonColor: '#ef4444' });
    } finally {
      setTraining(false);
    }
  };

  const handleDeleteRecommendation = async (id) => {
    const result = await Swal.fire({
      title: "Delete recommendation?", text: "This action cannot be undone.", icon: "warning",
      showCancelButton: true, confirmButtonColor: "#ef4444", cancelButtonColor: "#57534e", confirmButtonText: "Delete",
      background: '#1c1917', color: '#fff',
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/shoe_recommendations/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setRecommendations((prev) => prev.filter((rec) => rec.id_shoe_recomendation !== id));
        Swal.fire({ icon: "success", title: "Deleted!", timer: 1500, showConfirmButton: false, background: '#1c1917', color: '#fff' });
      } catch (error) {
        console.error("Error deleting recommendation:", error);
        Swal.fire({ icon: "error", title: "Failed", text: error.response?.data?.message || "Failed to delete.", background: '#1c1917', color: '#fff', confirmButtonColor: '#ef4444' });
      }
    }
  };

  const groupedByUser = recommendations.reduce((acc, rec) => {
    const userId = rec.id_user;
    if (!acc[userId]) acc[userId] = [];
    acc[userId].push(rec);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-stone-950 p-4 sm:p-6 lg:p-8" style={{fontFamily:'Outfit,sans-serif'}}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Recommendation Engine</h1>
            <p className="text-sm text-stone-500 mt-1">Train model and manage user recommendations</p>
          </div>
          <button onClick={handleTrainModel} disabled={training}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              training ? "bg-stone-800 text-stone-500 cursor-not-allowed" : "bg-amber-500 hover:bg-amber-400 text-stone-950"
            }`}>
            {training ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                Training...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                Train Model
              </>
            )}
          </button>
        </div>

        {/* Banner */}
        {trainingResult && (
          <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-2 text-sm ${
            trainingResult.success
              ? trainingResult.status === "skipped" ? "bg-amber-500/5 border-amber-500/20 text-amber-400" : "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/5 border-red-500/20 text-red-400"
          }`}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={trainingResult.success ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
            </svg>
            <span className="font-medium">{trainingResult.message}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Total", value: recommendations.length, color: "text-white" },
            { label: "Users", value: Object.keys(groupedByUser).length, color: "text-amber-400" },
            { label: "Avg/User", value: Object.keys(groupedByUser).length > 0 ? Math.round(recommendations.length / Object.keys(groupedByUser).length) : 0, color: "text-amber-400" },
          ].map((s, i) => (
            <div key={i} className="bg-stone-900 rounded-2xl border border-stone-800 p-4">
              <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-stone-700"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin"></div>
            </div>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-12 text-center">
            <svg className="w-12 h-12 text-stone-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="text-lg font-bold text-stone-300 mb-1">No Recommendations</h3>
            <p className="text-sm text-stone-500">Click "Train Model" to generate recommendations.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedByUser).map(([userId, recs]) => (
              <div key={userId} className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
                <div className="px-5 py-3 border-b border-stone-800 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-amber-400">{userId}</span>
                  </div>
                  <span className="text-sm font-medium text-white">User #{userId}</span>
                  <span className="text-xs text-stone-500">{recs.length} recs</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-stone-800/50">
                        {['Shoe','Price','Size','Stock',''].map((h,i) => (
                          <th key={i} className={`px-5 py-2 text-[10px] font-semibold text-stone-500 uppercase tracking-widest ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recs.map((rec) => (
                        <tr key={rec.id_shoe_recomendation} className="border-b border-stone-800/30 hover:bg-stone-800/20 transition-colors">
                          <td className="px-5 py-2.5 text-sm font-medium text-white">{rec.shoe_name}</td>
                          <td className="px-5 py-2.5 text-sm text-emerald-400">{rec.shoe_price?.toLocaleString("id-ID", {style: "currency", currency: "IDR", minimumFractionDigits: 0})}</td>
                          <td className="px-5 py-2.5 text-sm text-stone-300">{rec.shoe_size}</td>
                          <td className="px-5 py-2.5">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${rec.stock > 10 ? 'bg-emerald-500/10 text-emerald-400' : rec.stock > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                              {rec.stock}
                            </span>
                          </td>
                          <td className="px-5 py-2.5 text-right">
                            <button onClick={() => handleDeleteRecommendation(rec.id_shoe_recomendation)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminRecommendations;
