// src/pages/SignUpPage/SignUpPage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import axios from "axios"; // ✅ Прямой импорт
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setUser, setUserLoading, setUserError } from "../../store/slices/userSlice";
import { ROUTES } from "../../Routes";
import "../SignInPage/SignInPage.css";

export default function SignUpPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useAppSelector((s) => s.user);
  const [form, setForm] = useState({ login: "", password: "", password2: "" });
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) navigate(ROUTES.TIRES, { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.password !== form.password2) {
      setSubmitError("Пароли не совпадают");
      return;
    }
    if (!form.login || !form.password) {
      setSubmitError("Заполните все поля");
      return;
    }

    dispatch(setUserLoading(true));
    setSubmitError(null);
    dispatch(setUserError(null));

    try {
      // ✅ Регистрация: ПРЯМОЙ AXIOS
      await axios.post("/api/users/signup", {
        login: form.login,
        password: form.password,
        is_moderator: false,
      }, {
        headers: { "Content-Type": "application/json" },
      });

      // ✅ Автоматический вход после регистрации
      const loginRes = await axios.post("/api/users/signin", {
        login: form.login,
        password: form.password,
      });

      const { token } = loginRes.data;
      if (token) {
        localStorage.setItem("token", token);
        dispatch(setUser({ login: form.login, token }));
      }

      navigate(ROUTES.TIRES, { replace: true });
      
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Ошибка регистрации";
      setSubmitError(msg);
      dispatch(setUserError(msg));
    } finally {
      dispatch(setUserLoading(false));
    }
  };

  const mismatch = form.password && form.password2 && form.password !== form.password2;

  return (
    <div className="auth-page">
      <div className="auth-page__panel">
        <h1 className="auth-page__title">Регистрация</h1>
        
        {(error || submitError) && <div className="auth-page__error">{error || submitError}</div>}
        {mismatch && <div className="auth-page__error">Пароли не совпадают</div>}
        
        <form onSubmit={handleSubmit} className="auth-page__form">
          <label className="auth-page__label" htmlFor="signup-login">Логин</label>
          <input
            id="signup-login"
            className="auth-page__input"
            type="text"
            value={form.login}
            onChange={(e) => setForm({ ...form, login: e.target.value })}
            required
            disabled={loading}
            autoComplete="username"
          />
          
          <label className="auth-page__label" htmlFor="signup-password">Пароль</label>
          <input
            id="signup-password"
            className="auth-page__input"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            disabled={loading}
            autoComplete="new-password"
          />
          
          <label className="auth-page__label" htmlFor="signup-password2">Повтор пароля</label>
          <input
            id="signup-password2"
            className="auth-page__input"
            type="password"
            value={form.password2}
            onChange={(e) => setForm({ ...form, password2: e.target.value })}
            required
            disabled={loading}
            autoComplete="new-password"
          />
          
          <button
            type="submit"
            className="auth-page__submit"
            disabled={loading || Boolean(mismatch)}
          >
            {loading ? (
              <><Spinner animation="border" size="sm" className="auth-page__spinner" /> Регистрация…</>
            ) : "Зарегистрироваться"}
          </button>
        </form>
        
        <p className="auth-page__footer">
          Уже есть аккаунт? <Link to={ROUTES.SIGN_IN}>Войти</Link>
        </p>
      </div>
    </div>
  );
}