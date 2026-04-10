import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fornavn: "", etternavn: "", epost: "" });

  useEffect(() => {
    const token = localStorage.getItem("token"); // Hent "nøkkelen"
    
    // Hent nåværende data fra MariaDB
    fetch("http://localhost:4000/api/bruker/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setFormData({
          fornavn: data.fornavn || "",
          etternavn: data.etternavn || "",
          epost: data.epost || ""
        });
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Send de nye endringene til databasen
    const res = await fetch("http://localhost:4000/api/bruker/me", {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      alert("Profilen er oppdatert i databasen!");
      navigate("/mypage"); // Send brukeren tilbake til Min Side
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Rediger Profil</h1>
      <div className="space-y-4">
        <input 
          className="w-full p-2 border rounded"
          placeholder="Fornavn"
          value={formData.fornavn}
          onChange={(e) => setFormData({...formData, fornavn: e.target.value})}
        />
        <input 
          className="w-full p-2 border rounded"
          placeholder="Etternavn"
          value={formData.etternavn}
          onChange={(e) => setFormData({...formData, etternavn: e.target.value})}
        />
        <input 
          className="w-full p-2 border rounded"
          placeholder="E-post"
          value={formData.epost}
          onChange={(e) => setFormData({...formData, epost: e.target.value})}
        />
        <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded">
          Lagre endringer
        </button>
      </div>
    </form>
  );
}