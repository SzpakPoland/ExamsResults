# Panel Wyników Egzaminów

Nowoczesny system zarządzania wynikami egzaminów built with Next.js, TypeScript, Tailwind CSS i Node.js backend.

## 🚀 Funkcjonalności

### Typy Egzaminów

1. **Sprawdzanie**
   - Nick, Data, Liczba błędów, Punkty dodatkowe
   - Automatyczne obliczanie na podstawie 15 pytań standardowych

2. **Ortografia** 
   - Nick, Podejście (Pierwsze/Drugie/Inne), Wartość procentowa
   - Bezpośrednie wprowadzanie procentu

3. **Dokumenty Administracyjne**
   - Nick, Data, Maksymalna ilość punktów, Zdobyta ilość punktów
   - Automatyczne obliczanie procentu

### Funkcje

- ✅ Responsive design z animacjami
- ✅ Loading screens dla każdej podstrony
- ✅ Automatyczne obliczanie wyników
- ✅ **Backend API z bazą danych JSON**
- ✅ Filtrowanie i przeglądanie wyników
- ✅ TypeScript dla bezpieczeństwa typów
- ✅ Glass morphism design
- ✅ **Statystyki i analityka**

## 🛠️ Technologie

- **Frontend**: Next.js 15 z App Router, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: JSON files (file-based storage)
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📦 Instalacja

### Backend (Terminal 1)
```bash
cd backend
npm install
npm run dev
```
Backend będzie dostępny na: http://localhost:3001

### Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
Frontend będzie dostępny na: http://localhost:3000

## 🔧 Struktura Projektu

```
ExamsResults/
├── backend/                   # Node.js API Server
│   ├── server.js             # Express server
│   ├── data/                 # JSON database files
│   │   └── results.json     # Wszystkie wyniki
│   └── package.json
├── frontend/                 # Next.js Frontend
│   ├── src/
│   │   ├── app/             # Next.js App Router
│   │   ├── components/ui/   # UI Components
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # API utilities
│   └── package.json
└── README.md
```

## 🎯 API Endpoints

### Results
- `GET /api/results` - Wszystkie wyniki
- `GET /api/results/:type` - Wyniki według typu
- `POST /api/results` - Dodaj nowy wynik
- `DELETE /api/results/:id` - Usuń wynik

### Stats
- `GET /api/stats` - Statystyki ogólne
- `GET /api/health` - Health check

## 📊 Format Danych

```json
{
  "id": 1234567890,
  "nick": "TestUser", 
  "totalPoints": 85,
  "maxPoints": 100,
  "percentage": 85,
  "passed": true,
  "examType": "ortografia",
  "timestamp": "2025-01-07T21:00:00.000Z"
}
```

## 🚀 Deployment

### Development
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

### Production
```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm run build && npm start
```

## 🎨 Features

- **Real-time data**: Backend API z JSON storage
- **Statistics**: Automatyczne generowanie statystyk
- **Error handling**: Proper error handling na frontend i backend
- **Validation**: Server-side validation
- **CORS**: Configured for cross-origin requests
- **Health checks**: Monitoring endpoint

---

*System z prawdziwą bazą danych backend + frontend architecture.*
