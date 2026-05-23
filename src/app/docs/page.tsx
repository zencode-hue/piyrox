'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const docs = [
  {
    category: 'Getting Started',
    items: [
      { title: 'Introduction', href: '#introduction', id: 'introduction' },
      { title: 'Quickstart', href: '#quickstart', id: 'quickstart' },
      { title: 'Installation', href: '#installation', id: 'installation' },
      { title: 'System Requirements', href: '#requirements', id: 'requirements' },
    ],
  },
  {
    category: 'Products',
    items: [
      { title: 'Jarvis OS', href: '#jarvis', id: 'jarvis' },
      { title: 'PiyRox IDE', href: '#ide', id: 'ide' },
      { title: 'PiyRox Chat', href: '#chat', id: 'chat' },
    ],
  },
  {
    category: 'Development',
    items: [
      { title: 'API Reference', href: '#api', id: 'api' },
      { title: 'SDK Documentation', href: '#sdk', id: 'sdk' },
      { title: 'Webhooks', href: '#webhooks', id: 'webhooks' },
      { title: 'Authentication', href: '#auth', id: 'auth' },
    ],
  },
  {
    category: 'Resources',
    items: [
      { title: 'Troubleshooting', href: '#troubleshooting', id: 'troubleshooting' },
      { title: 'Best Practices', href: '#best-practices', id: 'best-practices' },
      { title: 'Changelog', href: '#changelog', id: 'changelog' },
    ],
  },
];

export default function Docs() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <Navbar activePage="docs" />
      <div className="docs-layout">
        <aside className="docs-sidebar">
          <div className="docs-brand">
            <Link href="/" className="logo">PiyRox</Link>
            <span className="docs-version">v2.0</span>
          </div>
          <nav className="docs-nav">
            {docs.map((section) => (
              <div key={section.category}>
                <h4 className="docs-section-title">{section.category}</h4>
                <ul className="docs-list">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <a href={item.href} className="docs-link">
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          <div className="docs-footer">
            <p className="docs-feedback">Feedback?</p>
            <a href="mailto:support@piyrox.sbs" className="docs-contact">support@piyrox.sbs</a>
          </div>
        </aside>

        <main className="docs-content">
          <div className="docs-header">
            <h1>Documentation</h1>
            <p className="docs-intro">Everything you need to get started with the PiyRox platform</p>
          </div>

          <div className="docs-search">
            <input type="text" placeholder="Search documentation..." />
            <span className="search-hint">Press / to search</span>
          </div>

          <div className="docs-content-inner">
            <section id="introduction">
              <h2>Introduction</h2>
              <p className="docs-lead">Welcome to PiyRox - the agentic AI platform redefining how humans interact with digital systems.</p>
              
              <div className="docs-grid">
                <div className="docs-card">
                  <div className="docs-icon">🚀</div>
                  <h3>Agentic Computing</h3>
                  <p>Our platform goes beyond chatbots. We build AI agents that can take actions, write code, manage systems, and operate autonomously on your behalf.</p>
                </div>
                <div className="docs-card">
                  <div className="docs-icon">🔒</div>
                  <h3>Privacy First</h3>
                  <p>Jarvis OS runs locally on your machine. Your data never leaves your computer unless you explicitly choose to share it.</p>
                </div>
                <div className="docs-card">
                  <div className="docs-icon">⚡</div>
                  <h3>High Performance</h3>
                  <p>Optimized models with 200k+ token context windows, fast inference, and efficient resource usage.</p>
                </div>
              </div>
            </section>

            <section id="quickstart">
              <h2>Quickstart</h2>
              <p>Get up and running with PiyRox in minutes.</p>
              
              <div className="docs-code-block">
                <div className="code-header">
                  <span>Terminal</span>
                  <div className="code-dots">
                    <span className="dot red" />
                    <span className="dot yellow" />
                    <span className="dot green" />
                  </div>
                </div>
                <pre><code>{`# Install Jarvis OS
npm install -g @piyrox/jarvis

# Initialize your workspace
piyrox init

# Start the assistant
piyrox start

# Or use the web interface
open https://chat.piyrox.sbs`}</code></pre>
              </div>

              <h3>What You'll Get</h3>
              <ul className="docs-list">
                <li>Full-featured AI assistant on your machine</li>
                <li>IDE with agentic coding capabilities</li>
                <li>Web-based conversational AI</li>
                <li>API access for custom integrations</li>
              </ul>
            </section>

            <section id="installation">
              <h2>Installation</h2>
              
              <h3>System Requirements</h3>
              <div className="docs-table">
                <table>
                  <thead>
                    <tr>
                      <th>Platform</th>
                      <th>Minimum Version</th>
                      <th>Recommended</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Windows</td>
                      <td>10 (21H2)</td>
                      <td>11</td>
                    </tr>
                    <tr>
                      <td>macOS</td>
                      <td>12.0 Monterey</td>
                      <td>14.0 Sonoma</td>
                    </tr>
                    <tr>
                      <td>Linux</td>
                      <td>Ubuntu 22.04 LTS</td>
                      <td>Ubuntu 24.04 LTS</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3>Windows Installation</h3>
              <div className="docs-code-block">
                <pre><code>{`# Using npm
npm install -g @piyrox/jarvis

# Or download from our website
# Visit https://piyrox.sbs/download`}</code></pre>
              </div>

              <h3>macOS Installation</h3>
              <div className="docs-code-block">
                <pre><code>{`# Using Homebrew
brew install piyrox/tap/jarvis

# Or download the DMG from our website`}</code></pre>
              </div>

              <h3>Linux Installation</h3>
              <div className="docs-code-block">
                <pre><code>{`# Using npm
npm install -g @piyrox/jarvis

# Or download the AppImage`}</code></pre>
              </div>
            </section>

            <section id="requirements">
              <h2>System Requirements</h2>
              
              <div className="docs-grid">
                <div className="docs-card">
                  <h3>Minimum</h3>
                  <ul>
                    <li>4GB RAM</li>
                    <li>2 CPU cores</li>
                    <li>500MB disk space</li>
                    <li>Internet connection (for initial setup)</li>
                  </ul>
                </div>
                <div className="docs-card featured">
                  <h3>Recommended</h3>
                  <ul>
                    <li>16GB+ RAM</li>
                    <li>8+ CPU cores</li>
                    <li>10GB+ disk space</li>
                    <li>Fast SSD for local models</li>
                    <li>Stable internet connection</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="jarvis">
              <h2>Jarvis OS</h2>
              <p className="docs-lead">Your ambient AI assistant that lives on your machine.</p>
              
              <div className="docs-grid">
                <div className="docs-card">
                  <h3>Core Features</h3>
                  <ul>
                    <li>Local filesystem access</li>
                    <li>Multi-step workflow execution</li>
                    <li>Voice command support</li>
                    <li>Offline capability</li>
                    <li>System automation</li>
                    <li>Secure sandboxed environment</li>
                  </ul>
                </div>
                <div className="docs-card">
                  <h3>Use Cases</h3>
                  <ul>
                    <li>Automated system maintenance</li>
                    <li>File organization and management</li>
                    <li>Calendar and task automation</li>
                    <li>Code compilation and testing</li>
                    <li>Network monitoring</li>
                    <li>Backup and sync operations</li>
                  </ul>
                </div>
              </div>

              <h3>Basic Commands</h3>
              <div className="docs-code-block">
                <pre><code>{`# Start Jarvis
piyrox start

# Check status
piyrox status

# View logs
piyrox logs

# Stop Jarvis
piyrox stop

# Update to latest version
piyrox update`}</code></pre>
              </div>
            </section>

            <section id="ide">
              <h2>PiyRox IDE</h2>
              <p className="docs-lead">The first IDE built entirely around agentic capabilities.</p>
              
              <div className="docs-grid">
                <div className="docs-card">
                  <h3>Key Capabilities</h3>
                  <ul>
                    <li>Full codebase context (128k tokens)</li>
                    <li>Agentic multi-file editing</li>
                    <li>Architectural planning</li>
                    <li>Automated testing</li>
                    <li>Git integration</li>
                    <li>All languages supported</li>
                  </ul>
                </div>
                <div className="docs-card">
                  <h3>Supported Languages</h3>
                  <ul>
                    <li>JavaScript/TypeScript</li>
                    <li>Python</li>
                    <li>Go</li>
                    <li>Rust</li>
                    <li>Java</li>
                    <li>C/C++</li>
                    <li>SQL</li>
                    <li>HTML/CSS</li>
                  </ul>
                </div>
              </div>

              <h3>Agentic Features</h3>
              <div className="docs-code-block">
                <pre><code>{`// In PiyRox IDE, you can simply ask:
// "Add user authentication to this API"
// "Refactor this module to use TypeScript"
// "Create a REST API for this database schema"

// The IDE will:
// 1. Analyze your entire codebase
// 2. Plan the changes needed
// 3. Execute the modifications
// 4. Run tests to verify
// 5. Show you a diff of changes`}</code></pre>
              </div>
            </section>

            <section id="chat">
              <h2>PiyRox Chat</h2>
              <p className="docs-lead">The conversational powerhouse with frontier AI models.</p>
              
              <div className="docs-grid">
                <div className="docs-card">
                  <h3>Models</h3>
                  <ul>
                    <li><strong>PiyRox-4:</strong> Our latest frontier model for complex reasoning</li>
                    <li><strong>Jarvis V3:</strong> Optimized for coding and technical tasks</li>
                    <li><strong>Fast Model:</strong> Quick responses for simple queries</li>
                  </ul>
                </div>
                <div className="docs-card">
                  <h3>Capabilities</h3>
                  <ul>
                    <li>200k token context window</li>
                    <li>Code execution sandbox</li>
                    <li>Image & file analysis</li>
                    <li>Multi-turn conversations</li>
                    <li>Memory of past interactions</li>
                  </ul>
                </div>
              </div>

              <h3>API Access</h3>
              <p>Access PiyRox Chat programmatically through our API:</p>
              <div className="docs-code-block">
                <pre><code>{`POST https://api.piyrox.sbs/v1/chat/completions
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "model": "piyrox-4",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ]
}`}</code></pre>
              </div>
            </section>

            <section id="api">
              <h2>API Reference</h2>
              <p className="docs-lead">Programmatic access to PiyRox services.</p>
              
              <h3>Authentication</h3>
              <p>All API requests require authentication using an API key. You can generate API keys from your dashboard.</p>
              
              <div className="docs-code-block">
                <pre><code>{`Authorization: Bearer YOUR_API_KEY_HERE`}</code></pre>
              </div>

              <h3>Endpoints</h3>
              <div className="docs-table">
                <table>
                  <thead>
                    <tr>
                      <th>Method</th>
                      <th>Endpoint</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>POST</td>
                      <td>/v1/chat/completions</td>
                      <td>Send a chat message</td>
                    </tr>
                    <tr>
                      <td>POST</td>
                      <td>/v1/ide/complete</td>
                      <td>Get IDE code completions</td>
                    </tr>
                    <tr>
                      <td>POST</td>
                      <td>/v1/jarvis/execute</td>
                      <td>Execute Jarvis commands</td>
                    </tr>
                    <tr>
                      <td>GET</td>
                      <td>/v1/models</td>
                      <td>List available models</td>
                    </tr>
                    <tr>
                      <td>GET</td>
                      <td>/v1/billing/usage</td>
                      <td>Get usage statistics</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3>Rate Limits</h3>
              <div className="docs-table">
                <table>
                  <thead>
                    <tr>
                      <th>Plan</th>
                      <th>Requests/minute</th>
                      <th>Monthly quota</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Free</td>
                      <td>10</td>
                      <td>1,000 requests</td>
                    </tr>
                    <tr>
                      <td>Pro</td>
                      <td>100</td>
                      <td>50,000 requests</td>
                    </tr>
                    <tr>
                      <td>Enterprise</td>
                      <td>Unlimited</td>
                      <td>Custom</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section id="sdk">
              <h2>SDK Documentation</h2>
              <p className="docs-lead">Official SDKs for easy integration.</p>
              
              <div className="docs-grid">
                <div className="docs-card">
                  <h3>JavaScript/TypeScript</h3>
                  <div className="docs-code-block">
                    <pre><code>{`import { PiyRox } from '@piyrox/sdk';

const client = new PiyRox({
  apiKey: process.env.PIYROX_API_KEY,
});

const response = await client.chat.completions.create({
  model: 'piyrox-4',
  messages: [{ role: 'user', content: 'Hello!' }],
});

console.log(response.choices[0].message.content);`}</code></pre>
                  </div>
                </div>
                <div className="docs-card">
                  <h3>Python</h3>
                  <div className="docs-code-block">
                    <pre><code>{`from piyrox import PiyRox

client = PiyRox(api_key=os.environ['PIYROX_API_KEY'])

response = client.chat.completions.create(
    model='piyrox-4',
    messages=[{'role': 'user', 'content': 'Hello!'}]
)

print(response.choices[0].message.content)`}</code></pre>
                  </div>
                </div>
              </div>
            </section>

            <section id="webhooks">
              <h2>Webhooks</h2>
              <p>Receive real-time notifications about events in your PiyRox account.</p>
              
              <div className="docs-code-block">
                <pre><code>{`{
  "event": "chat.message.created",
  "data": {
    "id": "msg_123",
    "user_id": "user_456",
    "content": "Hello world",
    "timestamp": "2026-05-23T10:00:00Z"
  }
}`}</code></pre>
              </div>

              <h3>Available Events</h3>
              <div className="docs-table">
                <table>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>chat.message.created</td>
                      <td>New chat message sent</td>
                    </tr>
                    <tr>
                      <td>chat.message.completed</td>
                      <td>Chat message response received</td>
                    </tr>
                    <tr>
                      <td>ide.file.edited</td>
                      <td>File edited in PiyRox IDE</td>
                    </tr>
                    <tr>
                      <td>jarvis.command.executed</td>
                      <td>Jarvis command completed</td>
                    </tr>
                    <tr>
                      <td>billing.subscription.updated</td>
                      <td>Subscription plan changed</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section id="auth">
              <h2>Authentication</h2>
              <p>Secure authentication for all PiyRox services.</p>
              
              <h3>OAuth 2.0</h3>
              <p>We support OAuth 2.0 for web applications:</p>
              <div className="docs-code-block">
                <pre><code>{`# Authorization URL
https://piyrox.sbs/oauth/authorize
?client_id=YOUR_CLIENT_ID
&redirect_uri=YOUR_REDIRECT_URI
&response_type=code
&scope=read write

# Token exchange
POST https://piyrox.sbs/oauth/token
grant_type=authorization_code
&code=AUTHORIZATION_CODE
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
&redirect_uri=YOUR_REDIRECT_URI`}</code></pre>
              </div>
            </section>

            <section id="troubleshooting">
              <h2>Troubleshooting</h2>
              
              <h3>Common Issues</h3>
              
              <div className="docs-accordion">
                <details>
                  <summary><strong>Installation fails on Windows</strong></summary>
                  <p>Ensure you have Windows 10 21H2 or later. Run the installer as Administrator. If issues persist, check the system event logs for permission errors.</p>
                </details>
                <details>
                  <summary><strong>Jarvis won't start</strong></summary>
                  <p>Check that port 8080 is not in use by another application. Try running <code>piyrox reset</code> to reset the configuration. If the issue persists, contact support.</p>
                </details>
                <details>
                  <summary><strong>IDE slow completions</strong></summary>
                  <p>Ensure your project is under 100MB for optimal performance. For larger projects, consider using the cloud-based indexing feature. Also check that you have at least 8GB of free RAM.</p>
                </details>
                <details>
                  <summary><strong>API rate limits exceeded</strong></summary>
                  <p>Upgrade to a Pro or Enterprise plan for higher limits. You can also implement exponential backoff in your API clients to handle rate limits gracefully.</p>
                </details>
              </div>
            </section>

            <section id="best-practices">
              <h2>Best Practices</h2>
              
              <h3>For Jarvis OS</h3>
              <ul className="docs-list">
                <li>Use the sandboxed environment for untrusted commands</li>
                <li>Review Jarvis workflow scripts before execution</li>
                <li>Enable two-factor authentication for remote access</li>
                <li>Keep Jarvis updated for security patches</li>
                <li>Use environment variables for sensitive configuration</li>
              </ul>

              <h3>For PiyRox IDE</h3>
              <ul className="docs-list">
                <li>Commit changes frequently when using agentic editing</li>
                <li>Review IDE-generated code before committing</li>
                <li>Use the built-in testing framework for all changes</li>
                <li>Keep your codebase organized for better context</li>
                <li>Use the IDE's built-in documentation viewer</li>
              </ul>

              <h3>For API Usage</h3>
              <ul className="docs-list">
                <li>Implement rate limiting in your clients</li>
                <li>Cache responses when appropriate</li>
                <li>Use webhooks for real-time updates instead of polling</li>
                <li>Store API keys securely (environment variables, secret managers)</li>
                <li>Handle errors gracefully with proper retry logic</li>
              </ul>
            </section>

            <section id="changelog">
              <h2>Changelog</h2>
              
              <div className="docs-changelog">
                <div className="changelog-release">
                  <span className="changelog-version">v2.0.0</span>
                  <span className="changelog-date">May 2026</span>
                  <ul>
                    <li>Major upgrade to PiyRox-4 model</li>
                    <li>New agentic coding capabilities in IDE</li>
                    <li>200k token context windows</li>
                    <li>Improved security sandbox</li>
                  </ul>
                </div>
                <div className="changelog-release">
                  <span className="changelog-version">v1.5.0</span>
                  <span className="changelog-date">April 2026</span>
                  <ul>
                    <li>Added voice command support to Jarvis</li>
                    <li>New pricing tiers</li>
                    <li>Enhanced IDE multi-file editing</li>
                  </ul>
                </div>
                <div className="changelog-release">
                  <span className="changelog-version">v1.0.0</span>
                  <span className="changelog-date">March 2026</span>
                  <ul>
                    <li>Initial public release</li>
                    <li>Core AI models launched</li>
                    <li>First version of PiyRox IDE</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
