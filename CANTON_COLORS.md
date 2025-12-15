# Canton Colors Reference Guide

## All 26 Swiss Cantons with Official Colors

### German-Speaking Cantons

#### Zürich (ZH)
- **Primary**: Blue (#0F05A0) 
- **Secondary**: White (#FFFFFF)
- **Flag**: Blue and white diagonal stripes
- **Major Clubs**: Various Zürich area teams

#### Bern (BE)
- **Primary**: Red (#FF0000)
- **Secondary**: Gold (#FFD700)
- **Flag**: Red with gold diagonal stripe and bear
- **Major Clubs**: Multiple Bern region teams

#### Luzern (LU)
- **Primary**: Blue (#0066CC)
- **Secondary**: White (#FFFFFF)
- **Flag**: Blue and white horizontal split
- **Major Clubs**: Central Switzerland teams

#### Aargau (AG)
- **Primary**: Black (#000000)
- **Secondary**: Blue (#0066CC)
- **Flag**: Black with three white stars, blue waves
- **Major Clubs**: Aargau volleyball clubs

#### St. Gallen (SG)
- **Primary**: Green (#009B77)
- **Secondary**: White (#FFFFFF)
- **Flag**: Green and white with fasces symbol
- **Major Clubs**: Volley Toggenburg, others

#### Thurgau (TG)
- **Primary**: Green (#009B77)
- **Secondary**: White (#FFFFFF)
- **Flag**: Green and white diagonal
- **Major Clubs**: Volley Amriswil (NLA)

#### Schaffhausen (SH)
- **Primary**: Black (#000000)
- **Secondary**: Gold (#FFD700)
- **Flag**: Black ram on gold
- **Major Clubs**: VC Kanti Schaffhausen

#### Solothurn (SO)
- **Primary**: Red (#FF0000)
- **Secondary**: White (#FFFFFF)
- **Flag**: Red and white horizontal
- **Major Clubs**: Volley Schönenwerd (NLA)

#### Basel-Stadt (BS)
- **Primary**: White (#FFFFFF)
- **Secondary**: Black (#000000)
- **Flag**: White with black crosier
- **Major Clubs**: Basel area teams

#### Basel-Landschaft (BL)
- **Primary**: White (#FFFFFF)
- **Secondary**: Red (#FF0000)
- **Flag**: White and red with crosier
- **Major Clubs**: SM'Aesch Pfeffingen (NLA)

#### Glarus (GL)
- **Primary**: Red (#FF0000)
- **Secondary**: Black (#000000)
- **Flag**: Red with Saint Fridolin
- **Major Clubs**: Glarus region teams

#### Zug (ZG)
- **Primary**: Blue (#0066CC)
- **Secondary**: White (#FFFFFF)
- **Flag**: Blue and white horizontal
- **Major Clubs**: Zug volleyball scene

### Mountain Cantons

#### Uri (UR)
- **Primary**: Gold (#FFD700)
- **Secondary**: Black (#000000)
- **Flag**: Gold and black with bull's head
- **Major Clubs**: Central Swiss teams

#### Schwyz (SZ)
- **Primary**: Red (#FF0000)
- **Secondary**: White (#FFFFFF)
- **Flag**: Red with white cross in corner
- **Major Clubs**: Schwyz area clubs

#### Obwalden (OW)
- **Primary**: Red (#FF0000)
- **Secondary**: White (#FFFFFF)
- **Flag**: Red and white
- **Major Clubs**: Volley Alpnach

#### Nidwalden (NW)
- **Primary**: Red (#FF0000)
- **Secondary**: White (#FFFFFF)
- **Flag**: Red and white
- **Major Clubs**: Central Switzerland

#### Graubünden (GR)
- **Primary**: Black (#000000)
- **Secondary**: White (#FFFFFF)
- **Flag**: Black, white, black horizontal
- **Major Clubs**: Grisons region teams

### Appenzell Cantons

#### Appenzell Ausserrhoden (AR)
- **Primary**: Black (#000000)
- **Secondary**: White (#FFFFFF)
- **Flag**: Black with VR and bear
- **Major Clubs**: Appenzell area

#### Appenzell Innerrhoden (AI)
- **Primary**: Black (#000000)
- **Secondary**: White (#FFFFFF)
- **Flag**: Black with bear
- **Major Clubs**: Innerrhoden teams

### French-Speaking Cantons (Romandie)

#### Vaud (VD)
- **Primary**: Green (#009B77)
- **Secondary**: White (#FFFFFF)
- **Flag**: Green with "Liberté et Patrie"
- **Major Clubs**: VBC Cheseaux, Lausanne UC

#### Genève (GE)
- **Primary**: Gold (#FFD700)
- **Secondary**: Red (#FF0000)
- **Flag**: Gold and red split with imperial eagle
- **Major Clubs**: Geneva volleyball scene

#### Neuchâtel (NE)
- **Primary**: Green (#009B77)
- **Secondary**: White (#FFFFFF)
- **Flag**: Green, white, red horizontal
- **Major Clubs**: Neuchâtel teams

#### Valais (VS)
- **Primary**: Red (#FF0000)
- **Secondary**: White (#FFFFFF)
- **Flag**: Red and white with 13 stars
- **Major Clubs**: Valais region clubs

#### Fribourg (FR)
- **Primary**: Black (#000000)
- **Secondary**: White (#FFFFFF)
- **Flag**: Black and white horizontal
- **Major Clubs**: Fribourg area teams

#### Jura (JU)
- **Primary**: Red (#FF0000)
- **Secondary**: White (#FFFFFF)
- **Flag**: Red with white stripes and crosier
- **Major Clubs**: Jura volleyball

### Italian-Speaking Canton

#### Ticino (TI)
- **Primary**: Red (#FF0000)
- **Secondary**: Blue (#0066CC)
- **Flag**: Red and blue split
- **Major Clubs**: Ticino volleyball scene

## Color Usage in Platform

### Profile Headers
```tsx
// Player from Zürich (ZH)
background: linear-gradient(135deg, #0F05A0 0%, #FFFFFF 100%)

// Player from Bern (BE)
background: linear-gradient(135deg, #FF0000 0%, #FFD700 100%)

// Player from Geneva (GE)
background: linear-gradient(135deg, #FFD700 0%, #FF0000 100%)
```

### Statistics Colors
Stats are displayed using the canton's primary color:
- Points, kills, aces use canton primary
- Background highlights use canton secondary
- Borders and accents match canton theme

### Flag Display
Flags shown as 2-color gradients:
- Top half: Primary color
- Bottom half: Secondary color
- Canton abbreviation overlaid in center

## Major Volleyball Regions

### NLA/NLB Hotspots:
1. **Thurgau (TG)** - Volley Amriswil
2. **Solothurn (SO)** - Volley Schönenwerd  
3. **Basel-Landschaft (BL)** - SM'Aesch Pfeffingen
4. **Vaud (VD)** - VBC Cheseaux, Lausanne UC
5. **Schaffhausen (SH)** - VC Kanti Schaffhausen
6. **St. Gallen (SG)** - Volley Toggenburg

### Youth Development Centers:
- **Zürich**: Strong Kantonsschule programs
- **Bern**: Youth academy system
- **Basel**: Multi-club youth development
- **Lausanne**: French-speaking talent pool

## How Colors Enhance UX

### Visual Hierarchy:
1. **Immediate Recognition**: Canton colors make profiles instantly recognizable
2. **Regional Pride**: Players see their local colors prominently
3. **Team Context**: Club colors complement canton colors
4. **Consistency**: All elements themed to match

### Accessibility:
- High contrast color combinations
- Colors tested for colorblind users
- Text overlays use mix-blend-mode for readability
- Fallback to grayscale if needed

### Responsive Design:
- Colors work on light and dark backgrounds
- Gradients scale properly on all screen sizes
- Mobile-optimized color displays
- Print-friendly color schemes

## Implementation Tips

### Getting Canton Info:
```typescript
import { getCantonInfo } from '@/lib/swissData'

const player = { canton: 'ZH' }
const cantonInfo = getCantonInfo(player.canton)

// Use colors
const primaryColor = cantonInfo.colors.primary
const secondaryColor = cantonInfo.colors.secondary
const cantonName = cantonInfo.name
```

### Dynamic Styling:
```tsx
<div 
  style={{ 
    background: `linear-gradient(135deg, ${cantonInfo.colors.primary} 0%, ${cantonInfo.colors.secondary} 100%)`
  }}
>
  Player Profile
</div>
```

### Tailwind Classes:
Some canton colors available as Tailwind classes:
- `text-canton-zh-primary` (Zürich blue)
- `bg-canton-be-primary` (Bern red)
- `border-canton-ge-primary` (Geneva gold)

---

**Note**: All colors are official canton colors from Swiss heraldry. Some simplified for digital display while maintaining authenticity.

**Viel Erfolg! 🏐🇨🇭**
