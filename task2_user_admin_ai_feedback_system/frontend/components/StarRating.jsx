const ratingEmoji = {
  1: "😞",
  2: "😐",
  3: "🙂",
  4: "😊",
  5: "🤩"
};

export default function StarRating({ value, onChange }) {
  return (
    <div className="ratingRow" role="radiogroup" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={value === n ? "ratingButton ratingButtonActive" : "ratingButton"}
          onClick={() => onChange(n)}
          role="radio"
          aria-checked={value === n}
        >
          <span className="ratingEmoji">{ratingEmoji[n]}</span>
          <span className="ratingNumber">{n}★</span>
        </button>
      ))}
    </div>
  );
}
