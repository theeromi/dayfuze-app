import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Serve the micro-motivational quotes demo directly
  app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DayFuse - Micro-Motivational Quotes Demo</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, sans-serif; background: #f3f4f6; min-height: 100vh; padding: 2rem; }
        .container { max-width: 800px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 2rem; }
        .title { font-size: 2.5rem; font-weight: bold; color: #1f2937; margin-bottom: 0.5rem; }
        .subtitle { color: #6b7280; font-size: 1.1rem; }
        .demo-card { background: white; border-radius: 0.75rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 2rem; margin-top: 2.5rem; }
        .card-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; color: #1f2937; }
        .card-description { color: #6b7280; margin-bottom: 1.5rem; line-height: 1.5; }
        .complete-button { padding: 0.75rem 1.5rem; border-radius: 0.5rem; color: white; font-weight: 500; border: none; cursor: pointer; background: #3b82f6; transition: 0.2s; }
        .complete-button:hover:not(:disabled) { background: #2563eb; }
        .complete-button:disabled { background: #10b981; opacity: 0.8; cursor: not-allowed; }
        .task-count { margin-top: 1rem; font-size: 0.875rem; color: #059669; font-weight: 500; }
        .quote-overlay { position: fixed; top: 1rem; right: 1rem; z-index: 1000; max-width: 20rem; padding: 1rem; border-radius: 0.5rem; border: 2px solid #10b981; background: linear-gradient(135deg, #ecfdf5, #d1fae5); box-shadow: 0 10px 15px rgba(0,0,0,0.1); transition: all 0.3s ease; opacity: 0; transform: translateY(-0.5rem); }
        .quote-overlay.show { opacity: 1; transform: translateY(0); }
        .quote-content { display: flex; align-items: flex-start; gap: 0.75rem; }
        .quote-icon { flex-shrink: 0; margin-top: 0.25rem; width: 1.25rem; height: 1.25rem; color: #eab308; }
        .quote-text { font-size: 0.875rem; font-weight: 500; color: #1f2937; line-height: 1.4; }
        .info-section { margin-top: 2rem; }
        .info-card { padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .info-blue { background: #eff6ff; border: 1px solid #bfdbfe; }
        .info-green { background: #f0fdf4; border: 1px solid #bbf7d0; }
        .info-title { font-weight: 600; margin-bottom: 0.5rem; }
        .info-blue .info-title { color: #1e40af; }
        .info-green .info-title { color: #15803d; }
        .info-list { font-size: 0.875rem; line-height: 1.6; padding-left: 1rem; }
        .info-blue .info-list { color: #1e40af; }
        .info-green .info-list { color: #15803d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">DayFuse - Motivational Quotes</h1>
            <p class="subtitle">Experience micro-motivational quotes for task completion</p>
        </div>
        
        <div class="demo-card">
            <h3 class="card-title">Sample Task #<span id="task-counter">1</span></h3>
            <p class="card-description">Complete this task to see a motivational quote appear with smooth animations!</p>
            <button id="complete-btn" class="complete-button" onclick="completeTask()">Complete Task</button>
            <p id="completed-count" class="task-count" style="display: none;">Tasks completed: <span id="count">0</span> 🎉</p>
        </div>
        
        <div id="quote-overlay" class="quote-overlay">
            <div class="quote-content">
                <svg class="quote-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <p id="quote-text" class="quote-text"></p>
            </div>
        </div>
        
        <div class="info-section">
            <div class="info-card info-blue">
                <h4 class="info-title">✨ Micro-Motivational Quotes Feature:</h4>
                <ul class="info-list">
                    <li>15+ motivational quotes from comprehensive library</li>
                    <li>Beautiful animations with category-specific colors</li>
                    <li>Auto-hide after 4 seconds with smooth transitions</li>
                    <li>Contextual quotes for different achievements</li>
                </ul>
            </div>
            <div class="info-card info-green">
                <h4 class="info-title">🎯 Implementation Categories:</h4>
                <ul class="info-list">
                    <li><strong>Completion:</strong> Task finished motivation</li>
                    <li><strong>Milestone:</strong> Achievement celebration (5, 10, 25, 50, 100 tasks)</li>
                    <li><strong>Streak:</strong> Consistency encouragement</li>
                    <li><strong>Encouragement:</strong> General motivation boost</li>
                </ul>
            </div>
        </div>
    </div>

    <script>
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

        let taskCount = 0;
        let isCompleted = false;

        function completeTask() {
            if (isCompleted) return;
            
            const button = document.getElementById('complete-btn');
            const overlay = document.getElementById('quote-overlay');
            const quoteText = document.getElementById('quote-text');
            const taskCounter = document.getElementById('task-counter');
            const completedCount = document.getElementById('completed-count');
            const count = document.getElementById('count');
            
            isCompleted = true;
            taskCount++;
            
            button.textContent = '✓ Completed!';
            button.disabled = true;
            
            completedCount.style.display = 'block';
            count.textContent = taskCount;
            
            const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
            quoteText.textContent = randomQuote;
            
            overlay.classList.add('show');
            
            setTimeout(() => {
                overlay.classList.remove('show');
                setTimeout(() => {
                    isCompleted = false;
                    button.textContent = 'Complete Task';
                    button.disabled = false;
                    taskCounter.textContent = taskCount + 1;
                }, 500);
            }, 4000);
        }
    </script>
</body>
</html>
    `);
  });

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
