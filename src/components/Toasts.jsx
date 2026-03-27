// src/components/Toasts.jsx
import { useToast } from "../hooks/useToast";

function Toasts() {
  const { toasts, loading } = useToast();

  console.log("loading from Toasts:", loading);

  return (
    <div
      className="position-fixed"
      style={{
        top: "80px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1100,
        width: "100%",
        maxWidth: "360px",
        padding: "0 16px",
        pointerEvents: "none",
      }}
    >
      {/* 吐司 */}
      <div className="toast-container w-100" style={{ pointerEvents: "auto" }}>
        {toasts.map((t) => (
          <div key={t.id} className={`toast show text-bg-${t.type} mb-2`}>
            <div className="toast-body">{t.message}</div>
          </div>
        ))}
      </div>

      {/* 吐司下方 loading 圖示 */}
      {loading && (
        <div className="d-flex justify-content-center mt-2">
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "1.5rem", height: "1.5rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Toasts;
