import React, { useState, useEffect, useRef } from "react";
import {
  Link as LinkIcon,
  Compass,
  Server,
  Database,
  Trash2,
  Send,
  Bot,
  User,
  Info,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Sparkles,
  Loader2,
  AlertCircle,
  Sun,
  Moon
} from "lucide-react";

const rawApiBase = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const API_BASE = rawApiBase.replace(/\/+$/, "");

export default function App() {
  // Theme State (Dark: Black/Red, Light: White/Yellow)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("app_theme") || "dark";
  });

  // Local storage lists
  const [indexedWebsites, setIndexedWebsites] = useState(() => {
    return JSON.parse(localStorage.getItem("indexed_websites")) || [];
  });
  
  // Active states
  const [activeWebsite, setActiveWebsite] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [question, setQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  
  // Indexing states
  const [indexingStatus, setIndexingStatus] = useState("idle"); // idle, indexing, completed, error
  const [indexingProgress, setIndexingProgress] = useState(0);
  const [indexingLogs, setIndexingLogs] = useState([]);
  
  // RAG Diagnostics & collapse
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [panelTab, setPanelTab] = useState("plan"); // plan, sources
  const [currentPlan, setCurrentPlan] = useState("No plan generated yet. Submit a query to inspect agent reasoning.");
  const [currentSources, setCurrentSources] = useState([]);
  
  // Chat message history
  const [chatHistory, setChatHistory] = useState([
    {
      id: "welcome",
      sender: "bot",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: "Hello! I am your RAG Chatbot assistant. To get started, please **Crawl & Index** a website using the sidebar panel, select it, and ask me questions about it!",
      sources: null
    }
  ]);
  
  // Refs
  const messagesEndRef = useRef(null);
  const logsEndRef = useRef(null);
  const chatInputRef = useRef(null);
  
  // Sync theme to document body
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("app_theme", nextTheme);
  };

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, chatLoading]);
  
  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [indexingLogs]);
  
  // Helper to add logs
  const logMessage = (text, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    let prefix = "⚙️";
    if (type === "success") prefix = "✅";
    if (type === "error") prefix = "❌";
    
    setIndexingLogs(prev => [...prev, `[${timestamp}] ${prefix} ${text}`]);
  };
  
  // Handle indexing website
  const handleIndexWebsite = async (e) => {
    e.preventDefault();
    const url = websiteUrl.trim();
    if (!url) return;
    
    setIndexingStatus("indexing");
    setIndexingProgress(15);
    setIndexingLogs([]);
    
    logMessage(`Submitting crawl & index request for: ${url}`);
    logMessage(`Starting background browser process via Playwright...`);
    
    let currentWidth = 15;
    const progressInterval = setInterval(() => {
      if (currentWidth < 90) {
        currentWidth += 5;
        setIndexingProgress(currentWidth);
        if (currentWidth === 35) logMessage("Crawl queue initialized. Scanning index links...");
        if (currentWidth === 55) logMessage("Extracting HTML textual data from pages...");
        if (currentWidth === 75) logMessage("Building semantic chunks and computing embeddings...");
      }
    }, 1800);
    
    try {
      const response = await fetch(`${API_BASE}/index`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ website: url })
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error(`Crawl failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === "error") {
        throw new Error(data.message || "Unknown server indexing error.");
      }
      
      setIndexingProgress(100);
      setIndexingStatus("completed");
      
      logMessage(`Crawled pages: ${data.pages_crawled || 0}`, "success");
      logMessage(`Stored database chunks: ${data.chunks_stored || 0}`, "success");
      logMessage(`Saved output to ${data.filename || 'websites'}`, "success");
      logMessage(`Chroma & BM25 models successfully reloaded!`, "success");
      
      // Update indexed list
      if (!indexedWebsites.includes(url)) {
        const updated = [...indexedWebsites, url];
        setIndexedWebsites(updated);
        localStorage.setItem("indexed_websites", JSON.stringify(updated));
      }
      
      // Auto select and switch chat focus
      setActiveWebsite(url);
      setChatHistory(prev => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: "bot",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Switching focus to **${url}**. All answers will now be retrieved from this website index.`,
          sources: null
        }
      ]);
      
    } catch (error) {
      clearInterval(progressInterval);
      setIndexingProgress(100);
      setIndexingStatus("error");
      logMessage(error.message, "error");
    }
  };
  
  // Handle website target switch
  const handleSelectWebsite = (url) => {
    setActiveWebsite(url);
    setChatHistory(prev => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        sender: "bot",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Switching focus to **${url}**. All answers will now be retrieved from this website index.`,
        sources: null
      }
    ]);
  };
  
  // Handle sending chat message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const q = question.trim();
    if (!q || !activeWebsite) return;
    
    // Append User message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: q,
      sources: null
    };
    
    setChatHistory(prev => [...prev, userMsg]);
    setQuestion("");
    setChatLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          website: activeWebsite,
          question: q
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to receive response from chatbot server.");
      }
      
      const data = await response.json();
      
      // Append Bot message
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: data.answer,
        sources: data.sources
      };
      setChatHistory(prev => [...prev, botMsg]);
      
      // Load diagnostic details
      if (data.plan) {
        try {
          const planObj = typeof data.plan === 'string' ? JSON.parse(data.plan) : data.plan;
          setCurrentPlan(JSON.stringify(planObj, null, 4));
        } catch {
          setCurrentPlan(data.plan);
        }
      } else {
        setCurrentPlan("No plan data returned.");
      }
      
      setCurrentSources(data.sources || []);
      
    } catch (error) {
      const errorMsg = {
        id: `err-${Date.now()}`,
        sender: "bot",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `⚠️ **Error:** ${error.message}. Please verify the chatbot server is running.`,
        sources: null
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };
  
  // Clear chat logs
  const handleClearChat = () => {
    if (window.confirm("Clear all conversations from workspace?")) {
      setChatHistory([
        {
          id: "welcome",
          sender: "bot",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: "Hello! I am your RAG Chatbot assistant. To get started, please **Crawl & Index** a website using the sidebar panel, select it, and ask me questions about it!",
          sources: null
        }
      ]);
      setCurrentPlan("No plan generated yet. Submit a query to inspect agent reasoning.");
      setCurrentSources([]);
    }
  };
  
  // Format message markdown basics
  const formatMarkdown = (text) => {
    if (!text) return "";
    
    // Escape HTML tags to protect rendering
    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
      
    // Bold formatting **text**
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    
    // Code blocks ```code```
    escaped = escaped.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>");
    
    // Inline code `code`
    escaped = escaped.replace(/`(.*?)`/g, "<code>$1</code>");
    
    // Support newlines
    const parts = escaped.split(/(<pre>[\s\S]*?<\/pre>)/g);
    const formatted = parts.map(part => {
      if (part.startsWith("<pre>")) {
        return part;
      }
      return part.replace(/\n/g, "<br>");
    }).join("");
    
    return { __html: formatted };
  };
  
  return (
    <div className="app-container">
      {/* Sidebar Panel */}
      <aside className="sidebar">
        <div className="brand">
          <div className="logo-icon">
            <Sparkles size={20} fill="white" />
          </div>
          <div className="brand-text">
            <h1>WebRAG</h1>
            <span>React Crawler Engine</span>
          </div>
        </div>
        
        {/* Indexer Form */}
        <div className="sidebar-section">
          <h2><Compass size={14} /> Crawl & Index</h2>
          <div className="glass-card">
            <p className="section-desc">Crawl website pages, chunk text content, and index into Chroma vector database.</p>
            <form onSubmit={handleIndexWebsite}>
              <div className="input-group">
                <label htmlFor="website-url">Website URL</label>
                <div className="input-wrapper">
                  <span className="input-icon"><LinkIcon size={14} /></span>
                  <input
                    type="url"
                    id="website-url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                    disabled={indexingStatus === "indexing"}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={indexingStatus === "indexing"}
              >
                <span>{indexingStatus === "indexing" ? "Indexing..." : "Start Indexing"}</span>
                {indexingStatus === "indexing" && (
                  <span className="btn-loader"><Loader2 size={14} className="animate-spin" /></span>
                )}
              </button>
            </form>
            
            {/* Status output log console */}
            {indexingStatus !== "idle" && (
              <div className="status-container">
                <div className="status-header">
                  <span>
                    {indexingStatus === "indexing" && "Crawling..."}
                    {indexingStatus === "completed" && "Indexing Completed"}
                    {indexingStatus === "error" && "Indexing Failed"}
                  </span>
                  <span className={`badge ${
                    indexingStatus === "completed" ? "success" : indexingStatus === "error" ? "error" : ""
                  }`}>
                    {indexingStatus === "indexing" && "Active"}
                    {indexingStatus === "completed" && "Done"}
                    {indexingStatus === "error" && "Error"}
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${indexingProgress}%`,
                      backgroundColor: indexingStatus === "error" ? "var(--danger)" : undefined
                    }}
                  ></div>
                </div>
                <div className="console-log">
                  {indexingLogs.map((log, index) => (
                    <div key={index}>{log}</div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Knowledge Base selector dropdown */}
        <div className="sidebar-section">
          <h2><Server size={14} /> Indexed Knowledge</h2>
          <div className="glass-card">
            <div className="input-group">
              <label htmlFor="indexed-select">Chat Target</label>
              <div className="select-wrapper">
                <span className="select-icon"><Database size={14} /></span>
                <select
                  id="indexed-select"
                  value={activeWebsite}
                  onChange={(e) => handleSelectWebsite(e.target.value)}
                >
                  <option value="" disabled>Select an indexed website...</option>
                  {indexedWebsites.map((url, idx) => (
                    <option key={idx} value={url}>{url}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="info-note">
              <Info size={12} style={{ flexShrink: 0, marginTop: 1 }} />
              Answers will only be derived from pages of the selected website.
            </p>
          </div>
        </div>
        
        <div className="sidebar-footer">
          <p>Website Chatbot Hub v2.0</p>
        </div>
      </aside>
      
      {/* Chat Area */}
      <main className="chat-area">
        <header className="chat-header">
          <div className="chat-header-info">
            <div className={`active-status-dot ${activeWebsite ? "active" : ""}`}></div>
            <div>
              <h2>{activeWebsite ? new URL(activeWebsite).hostname : "General Assistant"}</h2>
              <p>
                {activeWebsite
                  ? `Connected to target RAG schema: ${activeWebsite}`
                  : "Select an indexed website on the left to activate RAG"}
              </p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn btn-icon" onClick={toggleTheme} title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}>
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="btn btn-icon" onClick={handleClearChat} title="Clear Chat History">
              <Trash2 size={16} />
            </button>
          </div>
        </header>
        
        {/* Message Logs */}
        <div className="messages-container">
          {chatHistory.map((msg) => (
            <div key={msg.id} className={`message-bubble ${msg.sender === "user" ? "user-message" : "bot-message"}`}>
              <div className="message-avatar">
                {msg.sender === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className="message-content-wrapper">
                <div className="message-content">
                  <div dangerouslySetInnerHTML={formatMarkdown(msg.text)} />
                  {msg.sender === "bot" && msg.sources && msg.sources.length > 0 && (
                    <div className="info-note" style={{ marginTop: 8 }}>
                      <Database size={12} /> Answer supported by {msg.sources.length} document source(s). Check Diagnosis panel.
                    </div>
                  )}
                </div>
                <span className="message-time">{msg.time}</span>
              </div>
            </div>
          ))}
          
          {/* Chat Loader */}
          {chatLoading && (
            <div className="typing-indicator">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Collapsible Inspection Panel (Reasoning log & retrieved sources) */}
        <section className="diagnostic-panel">
          <div className="panel-header" onClick={() => setPanelExpanded(!panelExpanded)}>
            <h3>
              <AlertCircle size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
              RAG Diagnosis & Sources
            </h3>
            <span className="toggle-icon">
              {panelExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </span>
          </div>
          {panelExpanded && (
            <div className="panel-body">
              <div className="diag-tabs">
                <button
                  className={`tab-btn ${panelTab === "plan" ? "active" : ""}`}
                  onClick={() => setPanelTab("plan")}
                >
                  Retrieval Plan
                </button>
                <button
                  className={`tab-btn ${panelTab === "sources" ? "active" : ""}`}
                  onClick={() => setPanelTab("sources")}
                >
                  Sources Used ({currentSources.length})
                </button>
              </div>
              
              <div className="tab-content">
                {panelTab === "plan" ? (
                  <pre className="json-code">{currentPlan}</pre>
                ) : (
                  <div className="sources-list">
                    {currentSources.length > 0 ? (
                      currentSources.map((src, i) => (
                        <div key={i} className="source-item">
                          <h4>{src.title || "Untitled Fragment"}</h4>
                          <p><em>{src.chunk !== undefined ? `Chunk #${src.chunk}` : "Retrieved Content"}</em></p>
                          <a href={src.page_url || activeWebsite} target="_blank" rel="noreferrer" className="source-link">
                            <ExternalLink size={10} /> {src.page_url || activeWebsite}
                          </a>
                        </div>
                      ))
                    ) : (
                      <p className="no-sources-text">No sources loaded for the current response.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
        
        {/* Input Area */}
        <footer className="chat-footer">
          <form onSubmit={handleSendMessage}>
            <div className="textarea-wrapper">
              <textarea
                ref={chatInputRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={activeWebsite ? `Ask a question about ${activeWebsite}...` : "Select an indexed website to start..."}
                disabled={!activeWebsite || chatLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <button
                type="submit"
                className="btn btn-round"
                disabled={!activeWebsite || !question.trim() || chatLoading}
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </footer>
      </main>
    </div>
  );
}
