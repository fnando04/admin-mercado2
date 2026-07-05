import Navbar from './Navbar';
import './PageLayout.css';

export default function PageLayout({ children, maxWidth }) {
  return (
    <div className="page-shell">
      
      <div className="content" style={maxWidth ? { maxWidth } : undefined}>
        {children}
      </div>
    </div>
  );
}
