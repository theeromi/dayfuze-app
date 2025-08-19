// Standalone Motivational Quote Demo - No external dependencies
import { useState } from "react";

const motivationalQuotes = [
  "Every small step forward is progress worth celebrating!",
  "You just turned intention into action. Well done!",
  "Another task conquered. You're building momentum!",
  "Progress, not perfection. You're doing great!",
  "That's how you get things done. Keep it up!",
  "Small wins lead to big victories. Nice work!",
  "You're closer to your goals with each completed task.",
  "Productivity looks good on you!",
  "One task at a time, one win at a time.",
  "You're writing your success story, one task at a time.",
  "Achievement unlocked! You're on fire!",
  "This is what dedication looks like. Incredible work!",
  "Your persistence is paying off in amazing ways.",
  "You're on a roll! This streak is pure motivation.",
  "Building habits like a pro. Keep it up!"
];

export default function QuoteDemo() {
  const [completed, setCompleted] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [currentQuote, setCurrentQuote] = useState("");
  const [quoteCount, setQuoteCount] = useState(0);
  
  const handleComplete = () => {
    if (!completed) {
      setCompleted(true);
      const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      setCurrentQuote(randomQuote);
      setShowQuote(true);
      setQuoteCount(prev => prev + 1);
      
      // Auto-hide quote after 4 seconds and reset task
      setTimeout(() => {
        setShowQuote(false);
        setTimeout(() => setCompleted(false), 500);
      }, 4000);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#f3f4f6", 
      padding: "2rem",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ 
          fontSize: "2.5rem", 
          fontWeight: "bold", 
          color: "#1f2937", 
          marginBottom: "0.5rem" 
        }}>
          DayFuse - Motivational Quotes
        </h1>
        <p style={{ color: "#6b7280", fontSize: "1.1rem" }}>
          Experience micro-motivational quotes for task completion
        </p>
      </div>
      
      {/* Task Card */}
      <div style={{
        maxWidth: "28rem",
        margin: "0 auto",
        backgroundColor: "white",
        borderRadius: "0.75rem",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        padding: "2rem",
        marginTop: "2.5rem"
      }}>
        <h3 style={{ 
          fontSize: "1.25rem", 
          fontWeight: "600", 
          marginBottom: "1rem",
          color: "#1f2937"
        }}>
          Sample Task #{quoteCount + 1}
        </h3>
        <p style={{ 
          color: "#6b7280", 
          marginBottom: "1.5rem",
          lineHeight: "1.5"
        }}>
          Complete this task to see a motivational quote appear with smooth animations!
        </p>
        
        <button 
          onClick={handleComplete}
          disabled={completed}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            color: "white",
            fontWeight: "500",
            fontSize: "1rem",
            border: "none",
            cursor: completed ? "not-allowed" : "pointer",
            backgroundColor: completed ? "#10b981" : "#3b82f6",
            transition: "all 0.2s",
            opacity: completed ? 0.8 : 1
          }}
          onMouseOver={(e) => {
            if (!completed) {
              e.target.style.backgroundColor = "#2563eb";
            }
          }}
          onMouseOut={(e) => {
            if (!completed) {
              e.target.style.backgroundColor = "#3b82f6";
            }
          }}
        >
          {completed ? "✓ Completed!" : "Complete Task"}
        </button>
        
        {quoteCount > 0 && (
          <p style={{
            marginTop: "1rem",
            fontSize: "0.875rem",
            color: "#059669",
            fontWeight: "500"
          }}>
            Tasks completed: {quoteCount} 🎉
          </p>
        )}
      </div>
      
      {/* Motivational Quote Overlay */}
      {showQuote && (
        <div style={{
          position: "fixed",
          top: "1rem",
          right: "1rem",
          zIndex: 1000,
          maxWidth: "20rem",
          padding: "1rem",
          borderRadius: "0.5rem",
          border: "2px solid #10b981",
          background: "linear-gradient(to bottom right, #ecfdf5, #d1fae5)",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          transition: "all 0.3s ease",
          opacity: showQuote ? 1 : 0,
          transform: showQuote ? "translateY(0)" : "translateY(-0.5rem)"
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
            {/* Star Icon */}
            <div style={{ flexShrink: 0, marginTop: "0.25rem" }}>
              <svg 
                style={{ width: "1.25rem", height: "1.25rem", color: "#eab308" }}
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <p style={{
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#1f2937",
              lineHeight: "1.4",
              margin: 0
            }}>
              {currentQuote}
            </p>
          </div>
        </div>
      )}
      
      {/* Feature Information Cards */}
      <div style={{ 
        maxWidth: "28rem", 
        margin: "2rem auto 0",
        display: "flex",
        flexDirection: "column",
        gap: "1rem"
      }}>
        {/* Overview Card */}
        <div style={{
          padding: "1rem",
          backgroundColor: "#eff6ff",
          borderRadius: "0.5rem",
          border: "1px solid #bfdbfe"
        }}>
          <h4 style={{ 
            fontWeight: "600", 
            color: "#1e40af", 
            marginBottom: "0.5rem",
            fontSize: "1rem"
          }}>
            ✨ Feature Overview:
          </h4>
          <ul style={{ 
            fontSize: "0.875rem", 
            color: "#1e40af", 
            margin: 0,
            paddingLeft: "1rem",
            lineHeight: "1.6"
          }}>
            <li>15+ motivational quotes from comprehensive library</li>
            <li>Beautiful animations with category-specific colors</li>
            <li>Auto-hide after 4 seconds with smooth transitions</li>
            <li>Contextual quotes for different achievements</li>
          </ul>
        </div>
        
        {/* Categories Card */}
        <div style={{
          padding: "1rem",
          backgroundColor: "#f0fdf4",
          borderRadius: "0.5rem",
          border: "1px solid #bbf7d0"
        }}>
          <h4 style={{ 
            fontWeight: "600", 
            color: "#15803d", 
            marginBottom: "0.5rem",
            fontSize: "1rem"
          }}>
            🎯 Quote Categories:
          </h4>
          <ul style={{ 
            fontSize: "0.875rem", 
            color: "#15803d", 
            margin: 0,
            paddingLeft: "1rem",
            lineHeight: "1.6"
          }}>
            <li><strong>Completion:</strong> Task finished motivation</li>
            <li><strong>Milestone:</strong> Achievement celebration (5, 10, 25, 50, 100 tasks)</li>
            <li><strong>Streak:</strong> Consistency encouragement</li>
            <li><strong>Encouragement:</strong> General motivation boost</li>
          </ul>
        </div>
      </div>
    </div>
  );
}