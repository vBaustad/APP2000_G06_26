import { useState } from "react";

export default function TourForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("Lett");
  const [info, setInfo] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    onCreate({
      id: crypto.randomUUID(),
      title: title.trim(),
      level,
      info: info.trim(),
    });

    setTitle("");
    setLevel("Lett");
    setInfo("");
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
      <label>
        Tittel
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>

      <label>
        Vanskelighetsgrad
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option>Lett</option>
          <option>Middels</option>
          <option>Krevende</option>
        </select>
      </label>

      <label>
        Info (f.eks. 8 km • ca. 4 t)
        <input value={info} onChange={(e) => setInfo(e.target.value)} />
      </label>

      <button type="submit">Legg til tur</button>
    </form>
  );
}

