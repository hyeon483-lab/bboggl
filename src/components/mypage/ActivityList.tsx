import { Link } from 'react-router-dom';
import Icon from '../common/Icon';
import type { ActivityLogRow } from '../../types/activity';
import styles from './ActivityList.module.css';

const TYPE_ICON = { view: 'clock', favorite: 'star' } as const;
const TYPE_LABEL = { view: '조회함', favorite: '즐겨찾기 추가' } as const;

export default function ActivityList({ items }: { items: ActivityLogRow[] }) {
  return (
    <div>
      {items.map((item) => (
        <div className={styles.item} key={item.id}>
          <div className={`${styles.iconWrap} ${item.type === 'favorite' ? styles.favorite : ''}`}>
            <Icon name={TYPE_ICON[item.type]} size={18} />
          </div>
          <div className={styles.body}>
            <div className={styles.title}>
              <Link to={`/companies/${item.ticker}`}>
                <b>{item.company_name}</b>({item.ticker})
              </Link>
              을(를) {TYPE_LABEL[item.type]}
            </div>
            <div className={styles.date}>{item.created_at.slice(0, 10)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
