export async function getTours() {
  const res = await fetch("http://localhost:4000/tours");

  if (!res.ok) {
    throw new Error("Kunne ikke hente turer");
  }

  return res.json();
}