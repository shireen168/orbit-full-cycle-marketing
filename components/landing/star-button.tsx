export function StarButton({ onClick }: { onClick?: React.MouseEventHandler<HTMLButtonElement> }) {
  return (
    <button className="orbit-star-btn" onClick={onClick} type="button">
      <strong>Sign in</strong>
      <div className="orbit-star-container">
        <div className="orbit-star-field" />
      </div>
      <div className="orbit-star-glow">
        <div className="orbit-circle" />
        <div className="orbit-circle" />
      </div>
    </button>
  );
}
