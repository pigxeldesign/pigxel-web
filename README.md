# Pigxel Design

> The "Mobbin for Web3" — A semantically structured design repository for human builders and autonomous AI coding agents.

### Website: https://pigxel.xyz/

### Overview

While AI coding tools have advanced rapidly, their UI/UX output remains terrible because they lack high-quality, domain-specific design data. **Pigxel Design** solves this by providing a semantically structured repository of real-world Web3 user flows and UI patterns. 

Pigxel serves as both a reference hub for human designers and a high-quality training ground for autonomous AI coding agents (like v0 or Cursor) to learn standard Web3 design patterns and generate superior frontend code.

### 🎯 Who is it for?

*   **AI Agents:** By structuring our design flows and component data semantically, Pigxel serves as a high-quality training and reference repository for autonomous AI coding agents to learn standard Web3 design patterns and generate better frontend code.
*   **UI/UX Designers:** Both Web3-native designers seeking inspiration and Web2 designers transitioning into the space who need to quickly understand complex blockchain interactions (wallet signing, gas management, etc.).
*   **Product Managers & Founders:** To research competitor user journeys, benchmark industry standards, and streamline product development for next-gen dApps and AI x Crypto interfaces.
*   **Developers:** To reference standard UI patterns and ensure frontend implementations align with established Web3 usability best practices.

### 💡 Why Build It Now?

As AI agents become the primary way we build software, the quality of their output is entirely bottlenecked by their reference data. Web3 needs a semantic, structured source of truth for design patterns. By building Pigxel now, we are positioning it as the foundational design infrastructure that will power the next generation of AI-generated dApps, ensuring they are not just functionally correct, but intuitively designed for mass consumer adoption.

### 🛠 Tech Stack

*   **Frontend:** React 18 + Vite
*   **Styling & UI:** Tailwind CSS, Framer Motion, Lucide React
*   **Backend & Auth:** Supabase (PostgreSQL, Authentication)
*   **Web3 Integration:** `@solana/kit`, `bs58`, `tweetnacl`
*   **AI Integrations:** Automated design indexing and semantic data extraction (Colosseum Copilot powered)

### 🚀 Getting Started

#### Prerequisites
- Node.js (v18+)
- npm or yarn

#### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd pigxel-web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Copy the example environment file and add your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
   Make sure to populate:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. **View the App:**
   Open `http://localhost:5173` in your browser.

