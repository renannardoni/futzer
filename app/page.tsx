"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .landing-page {
          font-family: 'Montserrat', sans-serif;
          overflow-x: hidden;
          background: #0a0a0a;
          min-height: 100vh;
        }

        .page {
          position: relative;
          width: 100vw; height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .svg-bg {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
        }

        .overlay {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%);
          z-index: 2;
        }

        .content {
          position: relative;
          z-index: 10;
          text-align: center;
          color: white;
        }

        .logo-container {
          width: 260px; height: 260px;
          margin: 0 auto 20px;
          animation: logoEntry 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
          transform: scale(0.3) rotate(-180deg);
        }

        @keyframes logoEntry {
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }

        .logo-img {
          width: 100%; height: 100%;
          object-fit: contain;
          filter: brightness(0) invert(1) drop-shadow(0 0 30px rgba(255, 255, 255, 0.3));
        }

        .brand-name {
          font-size: 4rem; font-weight: 900;
          letter-spacing: 8px; text-transform: uppercase;
          color: #ffffff;
          opacity: 0;
          animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s forwards;
          text-shadow: 0 0 40px rgba(34, 197, 94, 0.5), 0 4px 20px rgba(0,0,0,0.5);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .tagline {
          font-size: 1rem; font-weight: 600;
          letter-spacing: 6px; text-transform: uppercase;
          color: rgba(255,255,255,0.7);
          margin-top: 10px; opacity: 0;
          animation: slideUp 0.8s ease 1.2s forwards;
        }

        .divider {
          width: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          margin: 30px auto;
          animation: expandLine 0.8s ease 1.5s forwards;
        }

        @keyframes expandLine { to { width: 260px; } }

        .buttons-section {
          opacity: 0;
          animation: slideUp 0.8s ease 1.8s forwards;
        }

        .section-label {
          font-size: 0.8rem; font-weight: 600;
          letter-spacing: 4px; text-transform: uppercase;
          color: rgba(255,255,255,0.85);
          margin-bottom: 16px;
        }

        .city-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }

        .city-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px 36px;
          background: #22a54a;
          color: white;
          border: none;
          border-radius: 14px;
          font-family: 'Montserrat', sans-serif;
          font-size: 1rem; font-weight: 700;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          text-decoration: none;
        }

        .city-btn:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 0 35px rgba(34, 197, 94, 0.4), 0 10px 30px rgba(0,0,0,0.3);
        }

        .city-btn::after {
          content: '';
          position: absolute; top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.08), transparent);
          animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }

        .btn-separator {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 0 auto 28px;
          max-width: 300px;
          opacity: 0;
          animation: slideUp 0.6s ease 2.1s forwards;
        }

        .btn-separator .line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.12);
        }

        .btn-separator span {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.7);
        }

        .owner-section {
          opacity: 0;
          animation: slideUp 0.6s ease 2.3s forwards;
        }

        .owner-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 36px;
          background: transparent;
          color: white;
          border: 2px solid rgba(255,255,255,0.25);
          border-radius: 14px;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.9rem; font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          backdrop-filter: blur(10px);
        }

        .owner-btn:hover {
          border-color: #22c55e;
          background: rgba(34, 197, 94, 0.1);
          transform: translateY(-2px);
          box-shadow: 0 0 25px rgba(34, 197, 94, 0.2);
        }

        .side-icon {
          position: absolute;
          z-index: 3;
          opacity: 0;
          animation: sideIconIn 1.2s ease 1.5s forwards;
        }

        .side-icon-left {
          left: 5%;
          top: 50%;
          transform: translateY(-50%);
        }

        .side-icon-right {
          right: 5%;
          top: 50%;
          transform: translateY(-50%);
        }

        @keyframes sideIconIn {
          from { opacity: 0; }
          to { opacity: 0.15; }
        }

        .side-icon svg {
          animation: gentleBob 6s ease-in-out infinite;
        }

        @keyframes gentleBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .float-el {
          position: absolute; z-index: 3;
          opacity: 0;
          animation: floatAppear 1s ease forwards;
        }

        @keyframes floatAppear {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes drift1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
        }
        @keyframes drift2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-5deg); }
        }

        .page-footer {
          position: absolute;
          bottom: 16px;
          left: 0; right: 0;
          text-align: center;
          z-index: 10;
          color: rgba(255,255,255,0.2);
          font-size: 0.7rem;
          letter-spacing: 1px;
        }

        @media (max-width: 768px) {
          .brand-name { font-size: 2.5rem; letter-spacing: 4px; }
          .tagline { font-size: 0.75rem; letter-spacing: 3px; }
          .logo-container { width: 180px; height: 180px; }
          .city-btn { padding: 14px 28px; }
          .city-buttons { gap: 12px; }
          .side-icon { display: none; }
        }

        @media (max-width: 420px) {
          .brand-name { font-size: 2rem; }
          .logo-container { width: 150px; height: 150px; }
          .city-buttons { flex-direction: column; align-items: center; }
          .city-btn { width: 260px; justify-content: center; }
        }
      `}</style>

      <div className="landing-page">
        <div className="page">
          {/* Vector background */}
          <svg className="svg-bg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <rect width="1600" height="900" fill="#f0f0f0"/>
            <polygon points="350,0 1600,0 1600,550 1250,900 0,900 0,350" fill="#2bba41"/>

            <polygon points="40,5 75,25 75,60 40,80 5,60 5,25" fill="none" stroke="#2bba41" strokeWidth="4" opacity="0.8"/>
            <polygon points="110,0 135,15 135,40 110,55 85,40 85,15" fill="none" stroke="#2bba41" strokeWidth="3" opacity="0.5"/>

            <circle cx="100" cy="320" r="8" fill="#1a1a1a"/>
            <circle cx="145" cy="290" r="6" fill="#1a1a1a"/>
            <circle cx="70" cy="350" r="7" fill="#1a1a1a"/>
            <circle cx="155" cy="340" r="5" fill="#1a1a1a"/>
            <line x1="100" y1="320" x2="145" y2="290" stroke="#1a1a1a" strokeWidth="2.5"/>
            <line x1="100" y1="320" x2="70" y2="350" stroke="#1a1a1a" strokeWidth="2.5"/>
            <line x1="100" y1="320" x2="155" y2="340" stroke="#1a1a1a" strokeWidth="2.5"/>

            <polygon points="290,45 300,50 297,62 283,62 280,50" fill="#1a1a1a"/>
            <polygon points="50,130 58,134 56,144 44,144 42,134" fill="#1a1a1a" opacity="0.6"/>

            <polygon points="580,145 625,171 625,223 580,249 535,223 535,171" fill="none" stroke="#1a1a1a" strokeWidth="5"/>
            <circle cx="700" cy="270" r="8" fill="#1a1a1a"/>

            <circle cx="1050" cy="170" r="7" fill="white"/>
            <circle cx="1100" cy="150" r="7" fill="white"/>
            <circle cx="1090" cy="205" r="6" fill="white"/>
            <line x1="1050" y1="170" x2="1100" y2="150" stroke="white" strokeWidth="2.5"/>
            <line x1="1050" y1="170" x2="1090" y2="205" stroke="white" strokeWidth="2.5"/>

            <polygon points="1200,296 1221,308 1221,332 1200,344 1179,332 1179,308" fill="none" stroke="white" strokeWidth="3"/>
            <circle cx="820" cy="500" r="6" fill="white"/>

            <circle cx="620" cy="600" r="7" fill="white"/>
            <circle cx="670" cy="570" r="6" fill="white"/>
            <circle cx="680" cy="630" r="6" fill="white"/>
            <circle cx="720" cy="590" r="5" fill="white"/>
            <line x1="620" y1="600" x2="670" y2="570" stroke="white" strokeWidth="2.5"/>
            <line x1="620" y1="600" x2="680" y2="630" stroke="white" strokeWidth="2.5"/>
            <line x1="670" y1="570" x2="720" y2="590" stroke="white" strokeWidth="2.5"/>

            <polygon points="180,720 215,740 215,775 180,795 145,775 145,740" fill="none" stroke="#1a8a30" strokeWidth="3.5"/>
            <circle cx="500" cy="360" r="5" fill="#1a1a1a"/>
            <polygon points="400,140 408,144 406,154 394,154 392,144" fill="white" opacity="0.8"/>

            <polygon points="1420,760 1441,772 1441,796 1420,808 1399,796 1399,772" fill="#1a1a1a"/>
            <polygon points="1500,740 1508,744 1506,754 1494,754 1492,744" fill="#1a1a1a"/>
            <polygon points="1480,810 1488,814 1486,824 1474,824 1472,814" fill="#1a1a1a"/>
            <polygon points="1350,820 1358,824 1356,834 1344,834 1342,824" fill="#1a1a1a" opacity="0.7"/>
            <circle cx="1300" cy="750" r="6" fill="#2bba41"/>

            <circle cx="1350" cy="640" r="5" fill="#1a1a1a"/>
            <circle cx="1400" cy="620" r="5" fill="#1a1a1a"/>
            <circle cx="1390" cy="660" r="4" fill="#1a1a1a"/>
            <line x1="1350" y1="640" x2="1400" y2="620" stroke="#1a1a1a" strokeWidth="2"/>
            <line x1="1350" y1="640" x2="1390" y2="660" stroke="#1a1a1a" strokeWidth="2"/>

            <circle cx="250" cy="250" r="4" fill="#1a1a1a" opacity="0.5"/>
            <circle cx="1150" cy="450" r="4" fill="white" opacity="0.6"/>
            <circle cx="900" cy="680" r="5" fill="white" opacity="0.4"/>
          </svg>

          <div className="overlay" />

          {/* Chuteira (left) */}
          <div className="side-icon side-icon-left">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
                <path d="M40,130 C40,130 35,110 50,90 C60,76 75,65 90,60 L100,58 L110,56 L130,55 L145,58 C145,58 155,62 160,72 L165,85 L168,100 L170,115 L168,130"/>
                <path d="M40,130 L42,140 L48,148 L60,152 L80,155 L110,156 L140,155 L158,150 L166,142 L168,130"/>
                <path d="M40,130 C40,130 38,120 45,112 C50,106 60,105 60,105"/>
                <path d="M130,55 C130,55 138,48 145,50 C152,52 155,58 155,62"/>
                <line x1="88" y1="68" x2="108" y2="64"/>
                <line x1="85" y1="78" x2="112" y2="72"/>
                <line x1="82" y1="88" x2="115" y2="80"/>
                <line x1="55" y1="152" x2="55" y2="165"/>
                <line x1="75" y1="155" x2="75" y2="168"/>
                <line x1="95" y1="156" x2="95" y2="169"/>
                <line x1="115" y1="155" x2="115" y2="168"/>
                <line x1="135" y1="153" x2="135" y2="166"/>
                <line x1="155" y1="148" x2="155" y2="161"/>
                <path d="M65,100 C80,95 100,92 120,90 C140,88 155,90 160,95" strokeWidth="2" opacity="0.6"/>
              </g>
            </svg>
          </div>

          {/* Raquete (right) */}
          <div className="side-icon side-icon-right">
            <svg width="200" height="220" viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
                <rect x="88" y="145" width="24" height="55" rx="6" strokeWidth="3"/>
                <line x1="88" y1="160" x2="112" y2="155" strokeWidth="1.5" opacity="0.5"/>
                <line x1="88" y1="170" x2="112" y2="165" strokeWidth="1.5" opacity="0.5"/>
                <line x1="88" y1="180" x2="112" y2="175" strokeWidth="1.5" opacity="0.5"/>
                <line x1="88" y1="190" x2="112" y2="185" strokeWidth="1.5" opacity="0.5"/>
                <path d="M92,145 L82,125"/>
                <path d="M108,145 L118,125"/>
                <ellipse cx="100" cy="68" rx="52" ry="62"/>
                <line x1="72" y1="30" x2="72" y2="108"/>
                <line x1="82" y1="18" x2="82" y2="118"/>
                <line x1="92" y1="12" x2="92" y2="124"/>
                <line x1="100" y1="8" x2="100" y2="128"/>
                <line x1="108" y1="12" x2="108" y2="124"/>
                <line x1="118" y1="18" x2="118" y2="118"/>
                <line x1="128" y1="30" x2="128" y2="108"/>
                <line x1="52" y1="40" x2="148" y2="40"/>
                <line x1="50" y1="52" x2="150" y2="52"/>
                <line x1="48" y1="64" x2="152" y2="64"/>
                <line x1="50" y1="76" x2="150" y2="76"/>
                <line x1="52" y1="88" x2="148" y2="88"/>
                <line x1="58" y1="100" x2="142" y2="100"/>
                <circle cx="100" cy="65" r="20" stroke="white" strokeWidth="1" opacity="0.2"/>
              </g>
              <g transform="translate(155, 25)">
                <circle cx="0" cy="0" r="12" stroke="white" strokeWidth="2" fill="none" opacity="0.5"/>
                <path d="M-8,-9 C-2,-3 -2,3 -8,9" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5"/>
                <path d="M8,-9 C2,-3 2,3 8,9" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5"/>
              </g>
            </svg>
          </div>

          {/* Floating particles */}
          <div className="float-el" style={{ top: "8%", left: "6%", animationDelay: "0.2s" }}>
            <svg width="45" height="45" viewBox="0 0 100 100" style={{ animation: "drift1 7s ease-in-out infinite" }}>
              <polygon points="93,50 71.5,87.2 28.5,87.2 7,50 28.5,12.8 71.5,12.8" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3"/>
            </svg>
          </div>
          <div className="float-el" style={{ top: "20%", right: "8%", animationDelay: "0.8s" }}>
            <svg width="30" height="30" viewBox="0 0 100 100" style={{ animation: "drift2 5.5s ease-in-out infinite" }}>
              <polygon points="93,50 71.5,87.2 28.5,87.2 7,50 28.5,12.8 71.5,12.8" fill="none" stroke="rgba(34,197,94,0.18)" strokeWidth="3"/>
            </svg>
          </div>
          <div className="float-el" style={{ bottom: "18%", left: "10%", animationDelay: "1.2s" }}>
            <svg width="38" height="38" viewBox="0 0 100 100" style={{ animation: "drift1 8s ease-in-out infinite 1s" }}>
              <polygon points="93,50 71.5,87.2 28.5,87.2 7,50 28.5,12.8 71.5,12.8" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3"/>
            </svg>
          </div>
          <div className="float-el" style={{ bottom: "28%", right: "5%", animationDelay: "0.5s" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" style={{ animation: "drift2 6s ease-in-out infinite 0.5s" }}>
              <circle cx="10" cy="10" r="5" fill="rgba(34,197,94,0.25)"/>
            </svg>
          </div>

          {/* Main content */}
          <div className="content">
            <div className="logo-container">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="logo-img" src="/futzer-logo.png" alt="Futzer Logo" />
            </div>

            <h1 className="brand-name">FUTZER</h1>
            <p className="tagline">Conecte-se ao Jogo</p>

            <div className="divider" />

            <div className="buttons-section">
              <p className="section-label">Procure uma quadra</p>
              <div className="city-buttons">
                <Link href="/quadras?cidade=campinas" className="city-btn">Campinas</Link>
                <Link href="/quadras?cidade=sao-paulo" className="city-btn">São Paulo</Link>
              </div>
            </div>

            <div className="btn-separator">
              <div className="line" />
              <span>ou</span>
              <div className="line" />
            </div>

            <div className="owner-section">
              <p className="section-label" style={{ marginBottom: "12px" }}>Dono de quadra?</p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/owner/login" className="owner-btn">
                  Entrar
                </Link>
                <Link href="/owner/cadastro" className="owner-btn" style={{ background: "rgba(34,197,94,0.15)", borderColor: "#22c55e" }}>
                  Criar conta
                </Link>
              </div>
            </div>
          </div>

          <div className="page-footer">&copy; 2026 Futzer. Todos os direitos reservados.</div>
        </div>
      </div>
    </>
  );
}
