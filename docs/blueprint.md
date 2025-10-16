# **App Name**: Base Raffle

## Core Features:

- Sub-Account Creation and Management: Allows users to create and manage sub-accounts with configurable spending limits using Base Account SDK. This eliminates transaction pop-ups for ticket purchases.
- Raffle Creation: Enables admin users to create new raffle rounds with parameters such as ticket price, max tickets per user, end timestamp, and prize pool percentage. Provides an interface for configuring raffle parameters.
- Seamless Ticket Purchase: Facilitates the purchase of raffle tickets via the created sub-accounts with an automatically applied spend permissions, removing the requirement of constant approvals.
- Winner Selection: Draws winners using Chainlink VRF or a secure blockhash-based randomness implementation and distributes prizes automatically.
- Balance Display: Presents a real-time overview of main wallet and sub-account balances. Implements 'Add Funds' and 'Withdraw' functionalities to manage sub-account funds, including automatic low-balance warnings.
- UI Notifications: Generative AI tool that crafts contextual UI notifications and toasts based on user actions or wallet balances.
- Real-time Data Sync: Synchronizes on-chain raffle data with a Supabase database to present live updates to users regarding participant counts, raffle status, and winner announcements.

## Style Guidelines:

- Primary color: Vivid blue (#4285F4) to convey trust and modernity in the onchain experience.
- Background color: Light blue (#E8F0FE), offering a clean and unobtrusive backdrop.
- Accent color: A contrasting warm orange (#FF5722) for call-to-action elements, adding excitement and emphasis.
- Body and headline font: 'Inter' for clear, neutral readability across all app sections (sans-serif).
- Crisp, geometric icons that reflect the simplicity and security of blockchain.
- Clean and modular grid system for raffle displays, promoting usability and a balanced interface.
- Smooth transitions for balance updates and subtle celebratory effects for raffle wins, enhancing engagement.