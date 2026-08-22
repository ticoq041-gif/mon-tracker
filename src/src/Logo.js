export default function Logo() {
  return (
    <svg width="220" height="40" viewBox="0 0 220 40" role="img">
      <title>My Current Medias</title>
      <rect x="0" y="0" width="220" height="40" fill="transparent"/>
      
      {/* Hexagone */}
      <polygon points="18,4 30,4 36,14 30,26 18,26 12,14" fill="none" stroke="#E50914" strokeWidth="1.5"/>
      
      {/* Lettre M */}
      <path d="M15,22 L15,8 L24,17 L33,8 L33,22" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      
      {/* Point rouge */}
      <circle cx="24" cy="28" r="2.5" fill="#E50914"/>

      {/* Ligne verticale séparatrice */}
      <line x1="46" y1="6" x2="46" y2="34" stroke="#E50914" strokeWidth="1" opacity="0.5"/>

      {/* Texte MY */}
      <text x="54" y="16" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="9" fill="#E50914" letterSpacing="3">MY</text>

      {/* Texte CURRENT MEDIAS */}
      <text x="54" y="28" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="14" fill="white" letterSpacing="1">CURRENT MEDIAS</text>

      {/* Ligne rouge sous le texte */}
      <rect x="54" y="31" width="162" height="1.5" fill="#E50914"/>
    </svg>
  );
}