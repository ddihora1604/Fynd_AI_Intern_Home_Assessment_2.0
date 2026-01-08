import { useState } from "react";
import StarRating from "./StarRating";

export default function ReviewForm({ onSubmit, loading }) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ rating, review });
      }}
      className="card"
    >
      <h2 style={{ marginTop: 0 }}>Leave a review</h2>

      <div style={{ marginBottom: 12 }}>
        <div className="muted">Rating (1–5)</div>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <div className="muted">Short review</div>
        <textarea
          className="textarea"
          rows={5}
          maxLength={8000}
          placeholder="Write a short review..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />
        <div className="muted">{review.length}/8000</div>
      </div>

      <button className="btn" disabled={loading} type="submit">
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
