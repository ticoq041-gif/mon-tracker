import { useState, useEffect } from "react";

const API_KEY = "92d6d95f9796472b9e926158547d5267";

export default function App() {
  const [title, setTitle] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [filter, setFilter] = useState("tous");
  const [editEp, setEditEp] = useState(null);
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("items");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (title.length < 2) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${title}&language=fr-FR`
      );
      const data = await res.json();
      setSuggestions(data.results?.slice(0, 5) || []);
    }, 400);
    return () => clearTimeout(timer);
  }, [title]);

  const addItem = (suggestion) => {
    const newItem = {
      title: suggestion.title || suggestion.name,
      poster: suggestion.poster_path
        ? `https://image.tmdb.org/t/p/w300${suggestion.poster_path}`
        : null,
      type: suggestion.media_type,
      favorite: false,
      status: "en cours",
      season: 1,
      episode: 1,
    };
    setItems([...items, newItem]);
    setTitle("");
    setSuggestions([]);
  };

  const toggleFavorite = (index) => {
    const newItems = [...items];
    newItems[index].favorite = !newItems[index].favorite;
    setItems(newItems);
  };

  const toggleStatus = (index) => {
    const newItems = [...items];
    newItems[index].status =
      newItems[index].status === "en cours" ? "terminé" : "en cours";
    setItems(newItems);
  };

  const deleteItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateEpisode = (index, season, episode) => {
    const newItems = [...items];
    newItems[index].season = season;
    newItems[index].episode = episode;
    setItems(newItems);
  };

  const filtered = items.filter(item => {
    if (filter === "tous") return true;
    if (filter === "favoris") return item.favorite;
    if (filter === "en cours") return item.status === "en cours";
    if (filter === "terminé") return item.status === "terminé";
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#141414", color: "white", fontFamily: "Arial" }}>

      {/* Header */}
      <div style={{ background: "#000", padding: "20px 40px" }}>
        <h1 style={{ color: "#E50914", margin: 0, fontSize: 28, fontWeight: "bold" }}>🎬 My Current Medias</h1>
      </div>

      {/* Search */}
      <div style={{ padding: "30px 40px" }}>
        <div style={{ position: "relative", maxWidth: 500 }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="🔍 Rechercher un film / série / animé..."
            style={{
              width: "100%", padding: "12px 16px", fontSize: 16,
              background: "#333", border: "1px solid #555", borderRadius: 6,
              color: "white", boxSizing: "border-box", outline: "none"
            }}
          />
          {suggestions.length > 0 && (
            <ul style={{
              position: "absolute", background: "#222", border: "1px solid #444",
              width: "100%", listStyle: "none", margin: 0, padding: 0,
              zIndex: 10, borderRadius: 6, overflow: "hidden"
            }}>
              {suggestions.map((s) => (
                <li key={s.id} onClick={() => addItem(s)} style={{
                  padding: "10px 16px", cursor: "pointer", display: "flex",
                  alignItems: "center", gap: 12, borderBottom: "1px solid #333"
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "#333"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {s.poster_path && (
                    <img src={`https://image.tmdb.org/t/p/w45${s.poster_path}`} alt="" style={{ width: 35, borderRadius: 4 }} />
                  )}
                  <span>{s.title || s.name}</span>
                  <small style={{ color: "#aaa", marginLeft: "auto" }}>{s.media_type}</small>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Filtres */}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          {["tous", "en cours", "terminé", "favoris"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "6px 16px", borderRadius: 20, border: "none",
              background: filter === f ? "#E50914" : "#333",
              color: "white", cursor: "pointer", fontWeight: filter === f ? "bold" : "normal"
            }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Grille */}
      <div style={{ padding: "0 40px 40px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 20 }}>
        {filtered.map((item, index) => {
          const realIndex = items.indexOf(item);
          return (
            <div key={index} style={{ position: "relative", borderRadius: 8, overflow: "hidden", background: "#222" }}
              onMouseEnter={e => e.currentTarget.querySelector(".overlay").style.opacity = 1}
              onMouseLeave={e => e.currentTarget.querySelector(".overlay").style.opacity = 0}
            >
              {item.poster
                ? <img src={item.poster} alt={item.title} style={{ width: "100%", display: "block" }} />
                : <div style={{ height: 200, background: "#333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🎬</div>
              }

              {/* Overlay */}
              <div className="overlay" style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                background: "rgba(0,0,0,0.85)", opacity: 0, transition: "opacity 0.3s",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 10
              }}>
                <button onClick={() => toggleFavorite(realIndex)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer" }}>
                  {item.favorite ? "❤️" : "🤍"}
                </button>
                <button onClick={() => toggleStatus(realIndex)} style={{
                  background: item.status === "en cours" ? "#E50914" : "#46d369",
                  border: "none", color: "white", padding: "4px 10px", borderRadius: 4, cursor: "pointer", fontSize: 12
                }}>
                  {item.status}
                </button>

                {/* Saison / Épisode — uniquement pour séries et animés */}
                {item.type !== "movie" && (
                  <div style={{ textAlign: "center" }}>
                    {editEp === realIndex ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ fontSize: 11, color: "#aaa" }}>S</span>
                          <input
                            type="number" min="1"
                            value={item.season}
                            onChange={e => updateEpisode(realIndex, parseInt(e.target.value) || 1, item.episode)}
                            style={{ width: 40, padding: 2, background: "#333", border: "1px solid #555", color: "white", borderRadius: 4, textAlign: "center" }}
                          />
                          <span style={{ fontSize: 11, color: "#aaa" }}>EP</span>
                          <input
                            type="number" min="1"
                            value={item.episode}
                            onChange={e => updateEpisode(realIndex, item.season, parseInt(e.target.value) || 1)}
                            style={{ width: 40, padding: 2, background: "#333", border: "1px solid #555", color: "white", borderRadius: 4, textAlign: "center" }}
                          />
                        </div>
                        <button onClick={() => setEditEp(null)} style={{ background: "#E50914", border: "none", color: "white", borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontSize: 11 }}>OK</button>
                      </div>
                    ) : (
                      <button onClick={() => setEditEp(realIndex)} style={{ background: "#555", border: "none", color: "white", borderRadius: 4, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>
                        S{String(item.season).padStart(2, "0")}E{String(item.episode).padStart(2, "0")}
                      </button>
                    )}
                  </div>
                )}

                <button onClick={() => deleteItem(realIndex)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>🗑️</button>
              </div>

              <div style={{ padding: "8px 10px" }}>
                <div style={{ fontWeight: "bold", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
                <div style={{ fontSize: 11, color: "#aaa" }}>
                  {item.type}
                  {item.type !== "movie" && ` · S${String(item.season).padStart(2, "0")}E${String(item.episode).padStart(2, "0")}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}