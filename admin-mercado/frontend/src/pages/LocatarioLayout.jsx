import LocatarioNavbar from './LocatarioNavbar';

export default function LocatarioLayout({ children, maxWidth = '1200px' }) {
  return (
    <>
      <LocatarioNavbar />
      <div className="content" style={{ maxWidth, margin: '0 auto', width: '100%' }}>
        {children}
      </div>
    </>
  );
}