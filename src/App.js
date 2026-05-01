import { useState, useEffect } from "react";

const API_KEY = "TA_CLE_API_ICI"; // 92d6d95f9796472b9e926158547d5267

export default function App() {
  const maintenance = true; // 👉 mettre false pour remettre le site

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

  const filtered = items.filter((item) => {
    if (filter === "tous") return true;
    if (filter === "favoris") return item.favorite;
    if (filter === "en cours") return item.status === "en cours";
    if (filter === "terminé") return item.status === "terminé";
    return true;
  });

  // 🚧 MODE MAINTENANCE
  if (maintenance) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#141414",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial",
        }}
      >
        <h1 style={{ color: "#E50914" }}>🚧 MyViews en maintenance</h1>
        <p>Le site revient bientôt avec de nouvelles fonctionnalités 🎬</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#141414", color: "white", fontFamily: "Arial" }}>
      
      <div style={{ background: "#000", padding: "20px 40px" }}>
        <h1 style={{ color: "#E50914" }}>🎬 MyViews</h1>
      </div>

      <div style={{ padding: "30px 40px" }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="🔍 Rechercher..."
          style={{ padding: 10, width: 300 }}
        />

        {suggestions.map((s) => (
          <div key={s.id} onClick={() => addItem(s)}>
            {s.title || s.name}
          </div>
        ))}
      </div>

      <div style={{ padding: 40 }}>
        {filtered.map((item, index) => (
          <div key={index}>
            {item.title}
          </div>
        ))}
      </div>
    </div>
  );
}