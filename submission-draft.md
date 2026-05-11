# Pigxel Design - Hackathon Submission Draft

### 1. Brief description
Pigxel Design is the "Mobbin for Web3". While AI coding tools have advanced rapidly, their UI/UX output remains terrible because they lack high-quality, domain-specific design data. We solve this by providing a semantically structured repository of real-world Web3 user flows and UI patterns. Pigxel serves as both a reference hub for human designers and a high-quality training ground for autonomous AI coding agents to learn standard Web3 design patterns and generate superior frontend code.

### 2. What are you building, and who is it for?
We are building a comprehensive design discovery and reference platform tailored exclusively for the Web3 ecosystem. It features a searchable directory of real-world dApp user flows, comprehensive screen libraries, and AI-driven analysis of UX patterns. 

**Who it is for:** 
*   **UI/UX Designers:** Both Web3-native designers seeking inspiration and Web2 designers transitioning into the space who need to quickly understand complex blockchain interactions.
*   **AI Agents & Copilots:** By structuring our design flows and component data semantically, Pigxel serves as a high-quality training and reference repository for autonomous AI Agents to learn standard Web3 design patterns and generate better frontend code.
*   **Product Managers & Founders:** To research competitor user journeys, benchmark industry standards, and streamline product development for next-gen dApps and AI x Crypto interfaces.
*   **Developers:** To reference standard UI patterns and ensure frontend implementations align with established Web3 usability best practices.

### 3. Why did you decide to build this, and why build it now?
We noticed a glaring gap in the current development landscape: coding with AI has reached an advanced phase, but the UI/UX design output from these agents is still terrible. This is especially true in Web3, where complex flows like wallet connections, transaction signing, and gas management are completely foreign to general-purpose AI models. Existing design repositories ignore Web3 and aren't structured for machine consumption.

**Why build it now?** As AI agents become the primary way we build software, the quality of their output is entirely bottlenecked by their reference data. Web3 needs a semantic, structured source of truth for design patterns. By building Pigxel now, we are positioning it as the foundational design infrastructure that will power the next generation of AI-generated dApps, ensuring they are not just functionally correct, but intuitively designed for mass consumer adoption.

### 4. What technologies are you using or integrating with to build your product? *Please include notable developer tools and AI tools as well.*
*   **Frontend Framework:** React 18 with Vite for lightning-fast development and highly optimized production builds.
*   **Styling & UI:** Tailwind CSS for responsive, utility-first styling, combined with Framer Motion to create premium, fluid micro-animations and page transitions.
*   **Backend & Authentication:** Supabase for secure PostgreSQL database management, user authentication, and robust data storage.
*   **Web3 Integration:** `@solana/kit` (the modern, tree-shakeable Solana SDK by Anza) and cryptographic libraries (`bs58`, `tweetnacl`) to support seamless Solana wallet interactions and future on-chain capabilities.
*   **AI Integrations:** AI-powered research and indexing tools designed to automatically analyze, categorize, and extract insights from uploaded dApp screens, simplifying discovery for our users.
