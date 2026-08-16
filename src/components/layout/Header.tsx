import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Icon from '../common/Icon';
import Input from '../common/Input';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../context/AuthModalContext';
import styles from './Header.module.css';

const NAV_ITEMS = [
  { to: '/', label: '홈' },
  { to: '/companies', label: '기업 분석' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { openAuthModal } = useAuthModal();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/companies?q=${encodeURIComponent(keyword)}`);
    setMobileOpen(false);
  };

  const avatarInitial = profile?.name?.[0] || user?.email?.[0]?.toUpperCase() || '?';

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <Link to="/" className={styles.logo}>
          🍲 <span>Bboggl</span>
        </Link>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <form className={styles.searchWrap} onSubmit={handleSearch}>
          <Input
            icon="search"
            placeholder="티커 또는 기업명 검색"
            className={styles.searchInput}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </form>

        <div className={styles.right}>
          <button className={styles.iconBtn} aria-label="알림">
            <Icon name="bell" size={20} />
          </button>

          {user ? (
            <Link to="/mypage" className={styles.iconBtn} aria-label="마이페이지">
              <span className={styles.avatar}>{avatarInitial}</span>
            </Link>
          ) : (
            <Button size="sm" onClick={openAuthModal}>
              로그인
            </Button>
          )}

          <button
            className={`${styles.iconBtn} ${styles.menuBtn}`}
            aria-label="메뉴"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <Icon name={mobileOpen ? 'x' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="container">
          <div className={styles.mobileNav}>
            <form className={styles.mobileSearch} onSubmit={handleSearch}>
              <Input
                icon="search"
                placeholder="티커 또는 기업명 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </form>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                }
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            {user && (
              <NavLink
                to="/mypage"
                className={styles.navLink}
                onClick={() => setMobileOpen(false)}
              >
                마이페이지
              </NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
