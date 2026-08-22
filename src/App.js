import Logo from "./Logo";
import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const API_KEY = process.env.REACT_APP_TMDB_KEY;

const getPlatform = (item) => {
  const title = encodeURIComponent(item.title);
  const genres = item.genres || [];
  const isAnime = genres.includes(16) || item.originCountry?.includes("JP");
  if (isAnime) return { name: "Crunchyroll", url: `https://crunchyroll.com/search?q=${title}`, color: "#F47521" };
  if (item.type === "movie") return { name: "Prime Video", url: `https://www.primevideo.com/search?phrase=${title}`, color: "#00A8E1" };
  return { name: "Netflix", url: `https://www.netflix.com/search?q=${title}`, color: "#E50914" };
};

const AVATARS = ["🎬", "🎮", "🦁", "🐉", "🌙", "⚡", "🔥", "🎭"];

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);
  return isMobile;
};

export default function App() {
  const isMobile = useIsMobile();
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [screen, setScreen] = useState("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regAvatar, setRegAvatar] = useState("🎬");
  const [regError, setRegError] = useState("");
  const [title, setTitle] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [filter, setFilter] = useState("tous");
  const [editEp, setEditEp] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        const data = docSnap.exists() ? docSnap.data() : {};
        setCurrentUser({ name: user.displayName, avatar: data.avatar || "🎬", email: user.email });
        setItems(data.items || []);
        setScreen("app");
      } else {
        setCurrentUser(null);
        setScreen("login");
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentUser || loading) return;
    const saveData = async () => {
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          avatar: currentUser.avatar,
          items: items
        });
      }
    };
    const timer = setTimeout(saveData, 1000);
    return () => clearTimeout(timer);
  }, [items, currentUser, loading]);

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

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPass);
      setLoginError("");
    } catch {
      setLoginError("Email ou mot de passe incorrect");
    }
  };

  const handleRegister = async () => {
    if (!regName.trim()) { setRegError("Entre un nom d'utilisateur"); return; }
    if (regPass.length < 6) { setRegError("Mot de passe trop court (min 6)"); return; }
    try {
      const userCred = await createUserWithEmailAndPassword(auth, regEmail, regPass);
      await updateProfile(userCred.user, { displayName: regName });
      await setDoc(doc(db, "users", userCred.user.uid), { avatar: regAvatar, items: [] });
      setRegError("");
    } catch (e) {
      setRegError(e.message.includes("email") ? "Email invalide ou déjà utilisé" : "Erreur lors de la création");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setItems([]);
    setShowUserMenu(false);
  };

  const addItem = (suggestion) => {
    setItems([...items, {
      title: suggestion.title || suggestion.name,
      poster: suggestion.poster_path ? `https://image.tmdb.org/t/p/w300${suggestion.poster_path}` : null,
      type: suggestion.media_type,
      genres: suggestion.genre_ids || [],
      originCountry: suggestion.origin_country || [],
      favorite: false,
      status: "en cours",
      season: 1,
      episode: 1,
    }]);
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
    newItems[index].status = newItems[index].status === "en cours" ? "terminé" : "en cours";
    setItems(newItems);
  };

  const deleteItem = (index) => setItems(items.filter((_, i) => i !== index));

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

  const inputStyle = {
    width: "100%", padding: "10px 14px", marginBottom: 12,
    background: "#333", border: "1px solid #555", borderRadius: 6,
    color: "white", boxSizing: "border-box", outline: "none", fontSize: 15
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#141414", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#E50914", fontSize: 20 }}>🎬 Chargement...</p>
    </div>
  );

  if (screen === "login") return (
    <div style={{ minHeight: "100vh", background: "#141414", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial", padding: 20 }}>
      <div style={{ background: "#222", padding: isMobile ? 24 : 40, borderRadius: 12, width: "100%", maxWidth: 340 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}><Logo /></div>
        <input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Email" style={inputStyle} />
        <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Mot de passe"
          onKeyDown={e => e.key === "Enter" && handleLogin()} style={inputStyle} />
        {loginError && <p style={{ color: "#E50914", fontSize: 13, margin: "0 0 12px" }}>{loginError}</p>}
        <button onClick={handleLogin} style={{ width: "100%", padding: "12px", background: "#E50914", border: "none", borderRadius: 6, color: "white", fontWeight: "bold", cursor: "pointer", fontSize: 15, marginBottom: 12 }}>
          Se connecter
        </button>
        <button onClick={() => { setScreen("register"); setLoginError(""); }} style={{ width: "100%", padding: "12px", background: "#333", border: "none", borderRadius: 6, color: "white", cursor: "pointer", fontSize: 14 }}>
          Créer un compte
        </button>
      </div>
    </div>
  );

  if (screen === "register") return (
    <div style={{ minHeight: "100vh", background: "#141414", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial", padding: 20 }}>
      <div style={{ background: "#222", padding: isMobile ? 24 : 40, borderRadius: 12, width: "100%", maxWidth: 340 }}>
        <h2 style={{ color: "#E50914", textAlign: "center", margin: "0 0 24px" }}>Créer un compte</h2>
        <input value={regName} onChange={e => setRegName(e.target.value)} placeholder="Nom d'utilisateur" style={inputStyle} />
        <input value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="Email" style={inputStyle} />
        <input type="password" value={regPass} onChange={e => setRegPass(e.target.value)} placeholder="Mot de passe (min 6)" style={inputStyle} />
        <p style={{ color: "#aaa", fontSize: 13, margin: "0 0 10px" }}>Choisis ton avatar :</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {AVATARS.map(a => (
            <button key={a} onClick={() => setRegAvatar(a)} style={{
              fontSize: 22, background: regAvatar === a ? "#E50914" : "#333",
              border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer"
            }}>{a}</button>
          ))}
        </div>
        {regError && <p style={{ color: "#E50914", fontSize: 13, margin: "0 0 12px" }}>{regError}</p>}
        <button onClick={handleRegister} style={{ width: "100%", padding: "12px", background: "#E50914", border: "none", borderRadius: 6, color: "white", fontWeight: "bold", cursor: "pointer", fontSize: 15, marginBottom: 12 }}>
          Créer le compte
        </button>
        <button onClick={() => { setScreen("login"); setRegError(""); }} style={{ width: "100%", padding: "12px", background: "#333", border: "none", borderRadius: 6, color: "white", cursor: "pointer", fontSize: 14 }}>
          Retour
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#141414", color: "white", fontFamily: "Arial", display: "flex", flexDirection: "column" }}>

      <div style={{ background: "#000", padding: isMobile ? "12px 16px" : "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo />

        <div style={{ position: "relative" }}>
          <button onClick={() => setShowUserMenu(!showUserMenu)} style={{
            background: "#222", border: "1px solid #444", borderRadius: 8,
            color: "white", padding: isMobile ? "6px 10px" : "8px 14px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6
          }}>
            <span>{currentUser?.avatar}</span>
            {!isMobile && <span style={{ fontSize: 14 }}>{currentUser?.name}</span>}
            <span style={{ fontSize: 11, color: "#aaa" }}>▼</span>
          </button>

          {showUserMenu && (
            <div style={{
              position: "absolute", right: 0, top: "110%", background: "#222",
              border: "1px solid #444", borderRadius: 8, overflow: "hidden", minWidth: 180, zIndex: 100
            }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #333", color: "#aaa", fontSize: 12 }}>
                <div>{currentUser?.name}</div>
                <div style={{ fontSize: 11, marginTop: 2 }}>{currentUser?.email}</div>
              </div>
              <button onClick={handleLogout} style={{
                width: "100%", padding: "10px 16px", background: "none", border: "none",
                color: "#E50914", cursor: "pointer", textAlign: "left", fontSize: 14
              }}>🚪 Se déconnecter</button>
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>

        <div style={{ padding: isMobile ? "16px" : "30px 40px", width: "100%", maxWidth: 900, boxSizing: "border-box" }}>
          <div style={{ position: "relative" }}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="🔍 Rechercher un film / série / animé..."
              style={{
                width: "100%", padding: "12px 16px", fontSize: isMobile ? 14 : 16,
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
                    {s.poster_path && <img src={`https://image.tmdb.org/t/p/w45${s.poster_path}`} alt="" style={{ width: 35, borderRadius: 4 }} />}
                    <span style={{ fontSize: isMobile ? 13 : 14 }}>{s.title || s.name}</span>
                    <small style={{ color: "#aaa", marginLeft: "auto" }}>{s.media_type}</small>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center", flexWrap: "wrap" }}>
            {["tous", "en cours", "terminé", "favoris"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: isMobile ? "5px 12px" : "6px 16px", borderRadius: 20, border: "none",
                background: filter === f ? "#E50914" : "#333",
                color: "white", cursor: "pointer", fontSize: isMobile ? 12 : 14,
                fontWeight: filter === f ? "bold" : "normal"
              }}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: isMobile ? "0 12px 24px" : "0 40px 40px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: isMobile ? 12 : 20, maxWidth: 900, width: "100%", boxSizing: "border-box" }}>
          {filtered.map((item, index) => {
            const realIndex = items.indexOf(item);
            const platform = getPlatform(item);
            const cardWidth = isMobile ? 140 : 150;
            return (
              <div key={index} style={{ position: "relative", borderRadius: 8, overflow: "hidden", background: "#222", width: cardWidth }}
                onMouseEnter={e => e.currentTarget.querySelector(".overlay").style.opacity = 1}
                onMouseLeave={e => e.currentTarget.querySelector(".overlay").style.opacity = 0}
                onTouchStart={e => e.currentTarget.querySelector(".overlay").style.opacity = 1}
                onTouchEnd={e => setTimeout(() => { if (e.currentTarget) e.currentTarget.querySelector(".overlay").style.opacity = 0; }, 3000)}
              >
                {item.poster
                  ? <img src={item.poster} alt={item.title} style={{ width: "100%", display: "block" }} />
                  : <div style={{ height: 200, background: "#333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🎬</div>
                }

                <div className="overlay" style={{
                  position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                  background: "rgba(0,0,0,0.85)", opacity: 0, transition: "opacity 0.3s",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: 10
                }}>
                  <button onClick={() => toggleFavorite(realIndex)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer" }}>
                    {item.favorite ? "❤️" : "🤍"}
                  </button>

                  {item.type !== "movie" && (
                    <div style={{ textAlign: "center" }}>
                      {editEp === realIndex ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: 11, color: "#aaa" }}>S</span>
                            <input type="number" min="1" value={item.season}
                              onChange={e => updateEpisode(realIndex, parseInt(e.target.value) || 1, item.episode)}
                              style={{ width: 36, padding: 2, background: "#333", border: "1px solid #555", color: "white", borderRadius: 4, textAlign: "center" }}
                            />
                            <span style={{ fontSize: 11, color: "#aaa" }}>EP</span>
                            <input type="number" min="1" value={item.episode}
                              onChange={e => updateEpisode(realIndex, item.season, parseInt(e.target.value) || 1)}
                              style={{ width: 36, padding: 2, background: "#333", border: "1px solid #555", color: "white", borderRadius: 4, textAlign: "center" }}
                            />
                          </div>
                          <button onClick={() => setEditEp(null)} style={{ background: "#E50914", border: "none", color: "white", borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontSize: 11 }}>OK</button>
                        </div>
                      ) : (
                        <button onClick={() => setEditEp(realIndex)} style={{ background: "#555", border: "none", color: "white", borderRadius: 4, padding: "4px 8px", cursor: "pointer", fontSize: 11 }}>
                          S{String(item.season).padStart(2, "0")}E{String(item.episode).padStart(2, "0")}
                        </button>
                      )}
                    </div>
                  )}

                  <a href={platform.url} target="_blank" rel="noreferrer" style={{
                    background: platform.color, color: "white", borderRadius: 4,
                    padding: "4px 8px", fontSize: 11, textDecoration: "none", fontWeight: "bold"
                  }}>▶ {platform.name}</a>

                  {item.status !== "terminé" ? (
                    <button onClick={() => toggleStatus(realIndex)} style={{
                      background: "#46d369", border: "none", color: "white",
                      borderRadius: 4, padding: "4px 8px", cursor: "pointer", fontSize: 11, fontWeight: "bold"
                    }}>✅ Terminer</button>
                  ) : (
                    <button onClick={() => toggleStatus(realIndex)} style={{
                      background: "#E50914", border: "none", color: "white",
                      borderRadius: 4, padding: "4px 8px", cursor: "pointer", fontSize: 11, fontWeight: "bold"
                    }}>🔄 Remettre en cours</button>
                  )}

                  <button onClick={() => deleteItem(realIndex)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}>🗑️</button>
                </div>

                <div style={{ padding: "8px 10px" }}>
                  <div style={{ fontWeight: "bold", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
                  <div style={{ fontSize: 10, color: "#aaa" }}>
                    {item.type}
                    {item.type !== "movie" && ` · S${String(item.season).padStart(2, "0")}E${String(item.episode).padStart(2, "0")}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background: "#000", padding: "14px 20px", textAlign: "center", borderTop: "1px solid #222" }}>
        <span style={{ color: "#555", fontSize: 11 }}>My Current Medias — </span>
        <span style={{ background: "#E50914", color: "white", fontSize: 10, fontWeight: "bold", padding: "2px 6px", borderRadius: 4 }}>Version Bêta</span>
        <span style={{ color: "#555", fontSize: 11 }}> — Fait avec ❤️</span>
      </div>
    </div>
  );
}