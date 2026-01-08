import { useState } from "react";
import StarRating from "./StarRating";

const ratingLabels = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent"
};

export default function ReviewForm({ onSubmit, loading }) {
  const [rating, setRating] = useState(null);
  const [review, setReview] = useState("");
  const [ratingError, setRatingError] = useState(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (rating == null) {
          setRatingError("Please select a rating (1–5) before submitting.");
          return;
        }

        setRatingError(null);
        onSubmit({ rating, review });
      }}
      className="card"
    >
      <h2 style={{ marginTop: 0, marginBottom: 8 }}>Leave a review</h2>
      <p className="muted" style={{ marginTop: 0, marginBottom: 28 }}>
        Your feedback helps us improve. Rate your experience and share your thoughts below.
      </p>

      <div className="formSection">
        <div className="formLabel">How would you rate your experience?</div>
        <StarRating
          value={rating}
          onChange={(next) => {
            setRating(next);
            setRatingError(null);
          }}
        />
        {rating && (
          <div className="ratingFeedback">
            You selected: <strong>{rating}★ — {ratingLabels[rating]}</strong>
          </div>
        )}
        {ratingError && <div className="fieldError">{ratingError}</div>}
      </div>

      <div className="formSection">
        <div className="formLabel">Tell us more (optional)</div>
        <p className="muted" style={{ marginTop: 0, marginBottom: 12 }}>
          What did you like? What could be better? Your detailed feedback is valuable.
        </p>
        <textarea
          className="textarea"
          rows={6}
          maxLength={8000}
          placeholder="Share your experience, suggestions, or any specific feedback..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />
        <div className="muted" style={{ marginTop: 8 }}>{review.length}/8000 characters</div>
      </div>

      <div className="formSection" style={{ marginBottom: 0 }}>
        <button className="btn" disabled={loading} type="submit">
          {loading ? "Submitting..." : "Submit Review"}
        </button>
        <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
          💡 Our AI will analyze your feedback and provide a personalized response.
        </p>
      </div>
    </form>
  );
}
