import { useEffect, useState } from "react";
import API from "../api";

export default function History() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      const res = await API.get("/review/history", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReviews(res.data.reviews);
    };

    fetchData();
  }, []);

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold mb-4">Review History</h1>

      {reviews.map((r) => (
        <div key={r._id} className="border p-3 mb-3 rounded">
          <p><b>Language:</b> {r.language}</p>
          <p><b>Code:</b> {r.code}</p>
          <p><b>Review:</b> {r.review}</p>
        </div>
      ))}
    </div>
  );
}