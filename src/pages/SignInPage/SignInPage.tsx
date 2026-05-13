// src/pages/SignInPage/SignInPage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import axios from "axios"; // ✅ Прямой импорт, без api.*
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setUser, setUserLoading, setUserError, logoutUser } from "../../store/slices/userSlice"; // ✅ Только синхронные экшены
import { ROUTES } from "../../Routes";
import "./SignInPage.css";

export default function SignInPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useAppSelector((s) => s.user);
  const [form, setForm] = useState({ login: "", password: "" });

  // 🔹 Редирект если уже авторизован
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.TIRES, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    if (!form.login || !form.password) {
      dispatch(setUserError("Заполните все поля"));
      return;
    }

    dispatch(setUserLoading(true));
    dispatch(setUserError(null));

    try {
      // ✅ ПРЯМОЙ AXIOS — не через api.users, не через thunk
      const response = await axios.post("/api/users/signin", {
        login: form.login,
        password: form.password,
      }, {
        headers: { "Content-Type": "application/json" },
      });

      const { token, user } = response.data;
      
      if (token) {
        localStorage.setItem("token", token);
        // ✅ Обновляем Redux синхронным экшеном
        dispatch(setUser({ login: form.login, token }));
      }

      navigate(ROUTES.TIRES, { replace: true });
      
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Ошибка входа";
      dispatch(setUserError(msg));
    } finally {
      dispatch(setUserLoading(false));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__panel">
        <h1 className="auth-page__title">Вход в систему</h1>
        
        {error && <div className="auth-page__error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-page__form">
          <label className="auth-page__label" htmlFor="signin-login">Логин</label>
          <input
            id="signin-login"
            className="auth-page__input"
            type="text"
            value={form.login}
            onChange={(e) => setForm({ ...form, login: e.target.value })}
            required
            disabled={loading}
            autoComplete="username"
          />
          
          <label className="auth-page__label" htmlFor="signin-password">Пароль</label>
          <input
            id="signin-password"
            className="auth-page__input"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            disabled={loading}
            autoComplete="current-password"
          />
          
          <button 
            type="submit" 
            className="auth-page__submit" 
            disabled={loading}
          >
            {loading ? (
              <><Spinner animation="border" size="sm" className="auth-page__spinner" /> Вход…</>
            ) : "Войти"}
          </button>
        </form>
        
        <p className="auth-page__footer">
          Нет аккаунта? <Link to={ROUTES.SIGN_UP}>Регистрация</Link>
        </p>
      </div>
    </div>
  );
}