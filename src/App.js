import { useState, useEffect } from "react";

export default function App() {
  const [title, setTitle] = useState("");

  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("items");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
  }, [items]);

  const addItem = () => {
    if (!title) return;

    setItems([
      ...items,
      { title, favorite: false, status: "en cours" }
    ]);

    setTitle("");
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

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>🎬 Mon Tracker</h1>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Ajouter un film / série / animé"
        style={{ padding: 5, marginRight: 10 }}
      />

      <button onClick={addItem}>Ajouter</button>

      <ul style={{ marginTop: 20 }}>
        {items.map((item, index) => (
          <li key={index} style={{ marginBottom: 10 }}>
            <strong>{item.title}</strong> — {item.status}

            <button onClick={() => toggleFavorite(index)} style={{ marginLeft: 10 }}>
              {item.favorite ? "❤️" : "🤍"}
            </button>

            <button onClick={() => toggleStatus(index)} style={{ marginLeft: 10 }}>
              changer statut
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
