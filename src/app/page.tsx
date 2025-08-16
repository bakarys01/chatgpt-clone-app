import ChatApp from '@/components/ChatApp';

/**
 * The root page of the application simply renders the chat interface.
 * Using Next.js 14 App Router means that this file defines the '/' route.
 */
export default function Home() {
  return (
    <main className="min-h-screen flex">
      {/* The ChatApp component contains the sidebar and chat area. */}
      <ChatApp />
    </main>
  );
}