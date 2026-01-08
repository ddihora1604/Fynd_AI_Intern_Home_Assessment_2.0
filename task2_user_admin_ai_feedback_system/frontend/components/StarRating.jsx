export default function StarRating({ value, onChange }) {
  return (
    <div className="row" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className="btnSecondary"
          onClick={() => onChange(n)}
          aria-pressed={value === n}
        >
          {n}★
        </button>
      ))}
    </div>
  );
}
