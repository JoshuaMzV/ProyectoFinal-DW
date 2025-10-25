import React from 'react';
import '../styles/components/Footer.scss';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-main">
          <p className="footer-copyright">
            2025 Joshua Iván André Méndez Vásquez - 9490224032
          </p>
          <p className="footer-title">
            SISTEMA INTEGRADO DE ADMINISTRACIÓN Y APLICACIONES PARA EL AGREMIADO <strong>-UMG EL NARANJO-</strong>
          </p>
        </div>
        <div className="footer-divider"></div>
      </div>
    </footer>
  );
};

export default Footer;
