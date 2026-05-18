import { useState, useContext } from "react";
import api from "@/api/axiosInstance";
import { AuthContext } from "@/contexts/AuthContext";
import Modal from "@/components/Modal";
import "./styles.scss";

const PROFILE_PICTURE = "https://pbs.twimg.com/media/Fvpd8chWcAEPllN.jpg";
const DEFAULT_BANNER = "https://image.tensorartassets.com/cdn-cgi/image/anim=true,plain=false,w=2048,f=jpeg,q=85/posts/images/646889879699062307/8f152d51-dd42-404f-898d-8a1c38f12a6b.jpg";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ProfileEditModal = ({ isOpen, setIsOpen, userData, onSaved }) => {
  const { user: loggedInUser, setUser } = useContext(AuthContext);

  const [tab, setTab] = useState("info");

  // ── Tab Info ──────────────────────────────────────────────
  const [info, setInfo] = useState({
    name: userData?.name || "",
    username: userData?.username || "",
    email: userData?.email || "",
    bio: userData?.bio || "",
  });
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [previewBanner, setPreviewBanner] = useState(null);
  const [infoStatus, setInfoStatus] = useState({ loading: false, error: "", success: "" });

  // ── Tab Contraseña ────────────────────────────────────────
  const [pwData, setPwData] = useState({ current: "", next: "", confirm: "" });
  const [pwStatus, setPwStatus] = useState({ loading: false, error: "", success: "" });

  // ── Handlers Info ─────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewAvatar(URL.createObjectURL(file));
    const form = new FormData();
    form.append("profileImage", file);
    try {
      await api.post(`/users/upload-profile-image/${loggedInUser.id}`, form);
    } catch {
      setPreviewAvatar(null);
    }
  };

  const handleBannerChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewBanner(URL.createObjectURL(file));
    const form = new FormData();
    form.append("bannerImage", file);
    try {
      await api.post(`/users/upload-banner-image/${loggedInUser.id}`, form);
    } catch {
      setPreviewBanner(null);
    }
  };

  const validateInfo = () => {
    if (!info.name.trim()) return "El nombre es obligatorio.";
    if (!info.username.trim()) return "El usuario es obligatorio.";
    if (info.email && !EMAIL_RE.test(info.email)) return "El email no es válido.";
    if (info.bio.length > 160) return "La bio no puede superar 160 caracteres.";
    return null;
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    const err = validateInfo();
    if (err) return setInfoStatus({ loading: false, error: err, success: "" });

    setInfoStatus({ loading: true, error: "", success: "" });
    try {
      await api.put(`/users/update/${loggedInUser.id}`, {
        name: info.name.trim(),
        username: info.username.trim().toLowerCase(),
        email: info.email,
        bio: info.bio,
      });
      setUser((prev) => ({ ...prev, name: info.name.trim(), username: info.username.trim().toLowerCase() }));
      setInfoStatus({ loading: false, error: "", success: "Perfil actualizado correctamente." });
      onSaved(info.username.trim().toLowerCase());
    } catch (error) {
      const msg = error?.response?.data?.message;
      setInfoStatus({ loading: false, error: msg || "Error al guardar los cambios.", success: "" });
    }
  };

  // ── Handlers Contraseña ───────────────────────────────────
  const validatePassword = () => {
    if (!pwData.current) return "Ingresá tu contraseña actual.";
    if (!pwData.next) return "Ingresá la nueva contraseña.";
    if (pwData.next.length < 6) return "La nueva contraseña debe tener al menos 6 caracteres.";
    if (pwData.next !== pwData.confirm) return "Las contraseñas no coinciden.";
    if (pwData.current === pwData.next) return "La nueva contraseña debe ser diferente a la actual.";
    return null;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const err = validatePassword();
    if (err) return setPwStatus({ loading: false, error: err, success: "" });

    setPwStatus({ loading: true, error: "", success: "" });
    try {
      await api.post(`/users/change-password/${loggedInUser.id}`, {
        currentPassword: pwData.current,
        newPassword: pwData.next,
      });
      setPwData({ current: "", next: "", confirm: "" });
      setPwStatus({ loading: false, error: "", success: "Contraseña actualizada correctamente." });
    } catch (error) {
      const msg = error?.response?.data?.message;
      setPwStatus({ loading: false, error: msg || "Error al cambiar la contraseña.", success: "" });
    }
  };

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} title="Editar perfil">
      <div className="pem">
        {/* Tabs */}
        <div className="pem__tabs">
          <button
            className={`pem__tab${tab === "info" ? " pem__tab--active" : ""}`}
            onClick={() => setTab("info")}
            type="button"
          >
            Información
          </button>
          <button
            className={`pem__tab${tab === "password" ? " pem__tab--active" : ""}`}
            onClick={() => setTab("password")}
            type="button"
          >
            Contraseña
          </button>
        </div>

        {/* ── TAB INFO ── */}
        {tab === "info" && (
          <form className="pem__form" onSubmit={handleSaveInfo}>
            {/* Banner */}
            <div className="pem__banner">
              <img src={previewBanner || userData?.bannerImage || DEFAULT_BANNER} alt="Banner" />
              <label className="pem__overlay" title="Cambiar banner">
                <i className="fa-solid fa-camera" />
                <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleBannerChange} />
              </label>
            </div>

            {/* Avatar */}
            <div className="pem__avatar">
              <img src={previewAvatar || userData?.imagen || PROFILE_PICTURE} alt="Avatar" />
              <label className="pem__overlay pem__overlay--small" title="Cambiar foto">
                <i className="fa-solid fa-camera" />
                <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleAvatarChange} />
              </label>
            </div>

            <div className="pem__fields">
              <div className="pem__field">
                <label>Nombre</label>
                <input
                  value={info.name}
                  maxLength={50}
                  onChange={(e) => setInfo({ ...info, name: e.target.value })}
                  placeholder="Tu nombre"
                />
              </div>

              <div className="pem__field">
                <label>Usuario</label>
                <div className="pem__input-prefix">
                  <span>@</span>
                  <input
                    value={info.username}
                    maxLength={30}
                    onChange={(e) => setInfo({ ...info, username: e.target.value.toLowerCase().replace(/\s/g, "") })}
                    placeholder="username"
                  />
                </div>
              </div>

              <div className="pem__field">
                <label>Email</label>
                <input
                  type="email"
                  value={info.email}
                  onChange={(e) => setInfo({ ...info, email: e.target.value })}
                  placeholder="tu@email.com"
                />
              </div>

              <div className="pem__field">
                <label>
                  Bio
                  <span className="pem__char-count">{info.bio.length}/160</span>
                </label>
                <textarea
                  value={info.bio}
                  maxLength={160}
                  rows={3}
                  onChange={(e) => setInfo({ ...info, bio: e.target.value })}
                  placeholder="Contá algo sobre vos..."
                />
              </div>
            </div>

            {infoStatus.error && <p className="pem__msg pem__msg--error">{infoStatus.error}</p>}
            {infoStatus.success && <p className="pem__msg pem__msg--success">{infoStatus.success}</p>}

            <button className="pem__submit" type="submit" disabled={infoStatus.loading}>
              {infoStatus.loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        )}

        {/* ── TAB CONTRASEÑA ── */}
        {tab === "password" && (
          <form className="pem__form" onSubmit={handleChangePassword}>
            <div className="pem__fields pem__fields--password">
              <div className="pem__field">
                <label>Contraseña actual</label>
                <input
                  type="password"
                  value={pwData.current}
                  onChange={(e) => setPwData({ ...pwData, current: e.target.value })}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              <div className="pem__field">
                <label>Nueva contraseña</label>
                <input
                  type="password"
                  value={pwData.next}
                  onChange={(e) => setPwData({ ...pwData, next: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                />
                {pwData.next.length > 0 && (
                  <div className="pem__pw-strength">
                    <div
                      className={`pem__pw-bar pem__pw-bar--${
                        pwData.next.length >= 10 ? "strong" : pwData.next.length >= 6 ? "medium" : "weak"
                      }`}
                    />
                    <span>{pwData.next.length >= 10 ? "Fuerte" : pwData.next.length >= 6 ? "Aceptable" : "Débil"}</span>
                  </div>
                )}
              </div>

              <div className="pem__field">
                <label>Confirmar nueva contraseña</label>
                <input
                  type="password"
                  value={pwData.confirm}
                  onChange={(e) => setPwData({ ...pwData, confirm: e.target.value })}
                  placeholder="Repetí la contraseña"
                  autoComplete="new-password"
                />
                {pwData.confirm.length > 0 && pwData.next !== pwData.confirm && (
                  <p className="pem__field-hint">Las contraseñas no coinciden</p>
                )}
              </div>
            </div>

            {pwStatus.error && <p className="pem__msg pem__msg--error">{pwStatus.error}</p>}
            {pwStatus.success && <p className="pem__msg pem__msg--success">{pwStatus.success}</p>}

            <button
              className="pem__submit"
              type="submit"
              disabled={pwStatus.loading || pwData.next !== pwData.confirm}
            >
              {pwStatus.loading ? "Actualizando..." : "Cambiar contraseña"}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default ProfileEditModal;
