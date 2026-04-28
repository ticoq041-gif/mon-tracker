import { useState, useEffect } from "react";

const API_KEY = "92d6d95f9796472b9e926158547d5267";

export default function App() {
  const [title, setTitle] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("items");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (title.length < 2) {
      setSuggestions([]);
      return;
    }
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
        ? `https://image.tmdb.org/t/p/w200${suggestion.poster_path}`
        : null,
      type: suggestion.media_type,
      favorite: false,
      status: "en cours",
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
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial", maxWidth: 600, margin: "0 auto" }}>
      <h1>🎬 Mon Tracker</h1>

      <div style={{ position: "relative" }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Rechercher un film / série / animé..."
          style={{ padding: 8, width: "100%", fontSize: 16, boxSizing: "border-box" }}
        />

        {suggestions.length > 0 && (
          <ul style={{
            position: "absolute", background: "white", border: "1px solid #ccc",
            width: "100%", listStyle: "none", margin: 0, padding: 0, zIndex: 10
          }}>
            {suggestions.map((s) => (
              <li
                key={s.id}
                onClick={() => addItem(s)}
                style={{ padding: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
              >
                {s.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w45${s.poster_path}`}
                    alt=""
                    style={{ width: 30 }}
                  />
                )}
                <span>{s.title || s.name}</span>
                <small style={{ color: "gray" }}>({s.media_type})</small>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ul style={{ marginTop: 20, listStyle: "none", padding: 0 }}>
        {items.map((item, index) => (
          <li key={index} style={{
            marginBottom: 10, display: "flex", alignItems: "center",
            gap: 10, border: "1px solid #eee", padding: 10, borderRadius: 8
          }}>
            {item.poster && <img src={item.poster} alt="" style={{ width: 50, borderRadius: 4 }} />}
            <div style={{ flex: 1 }}>
              <strong>{item.title}</strong>
              <div style={{ fontSize: 12, color: "gray" }}>{item.type} — {item.status}</div>
            </div>
            <button onClick={() => toggleFavorite(index)}>
              {item.favorite ? "❤️" : "🤍"}
            </button>
            <button onClick={() => toggleStatus(index)}>
              {item.status === "en cours" ? "✅" : "🔄"}
            </button>
            <button onClick={() => deleteItem(index)}>🗑️</button>
          </li>
        ))}
      </ul>
    </div>
  );
}