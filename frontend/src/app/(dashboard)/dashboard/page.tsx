"use client";

import { Image as ImageIcon, CheckSquare, PenLine, MoreVertical, Pin, Bell, UserPlus, Palette, Image } from "lucide-react";

export default function DashboardPage() {
  const notes = [
    {
      id: 1,
      title: "/sp.plan the web app",
      content: "will be a fullstack application having nextjs@16 + FastAPI and neon postgress serverless db with SQLModel. this app should use better auth for authentication with providers ( email/password, Google, Github) the users must login to use the app dashboard while the landing pages etc will be public. the app should have a landing page like this attached...",
      tags: [],
      color: "bg-white"
    },
    {
      id: 2,
      title: "CCR Config",
      content: "...",
      code: `{
  "LOG": false,
  "LOG_LEVEL": "debug",
  "CLAUDE_PATH": "",
  "HOST": "127.0.0.1",
  "PORT": 3456,
  "APIKEY": "",
  "API_TIMEOUT_MS": "600000",
  "PROXY_URL": "",
  "transformers": [],
  "Providers": [
    {
      "name": "gemini",
      "api_base_url": "https://generativelanguage.googleapis.com/v1beta/models/",
      ...
    }
  ]
}`,
      tags: [],
      color: "bg-white"
    },
    {
      id: 3,
      title: "claude github mcp",
      content: "claude mcp add --transport http github\nhttps://api.githubcopilot.com/mcp -H \"Authorization: Bearer ghp_3ewkBhl8lBaCDUkF5pZH6mgdZgAdHb1Qm31s\"",
      tags: [],
      color: "bg-white"
    },
    {
      id: 4,
      title: "Connect to OrganizationSettings",
      image: "/placeholder-diagram.png", // We don't have the real image, but structure is there
      tags: [],
      color: "bg-white"
    },
    {
      id: 5,
      title: "Quinn credentials",
      content: "marktecs-quin\n\ngoogle cloud application for supabase auth:\nCLIENT_ID=137041704254-tgr...",
      tags: [],
      color: "bg-white"
    },
    {
      id: 6,
      title: "ayesha - prod",
      content: "sk-proj-3JDPjyvBlxvyRbZ2CK1vLETbKC9gU7fh_etMGwoBcEjOhDOPqmx-H...",
      tags: ["Extensor Labs"],
      color: "bg-white"
    },
    {
      id: 7,
      title: "Mongo DB Atlas credentials For Quinn CRM project",
      content: "quinn_db_system_user\ngHlsxiFWOdp73hDH",
      tags: ["Extensor Labs"],
      color: "bg-white"
    },
    {
      id: 8,
      title: "PHASE 4: Next.js",
      content: "...",
      tags: [],
      color: "bg-white"
    }
  ];

  return (
    <div className="mx-auto w-full max-w-[1400px] p-4 space-y-8">
      
      {/* Take a note input */}
      <div className="mx-auto max-w-[600px] rounded-lg border border-border bg-white shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between p-3">
          <input 
            type="text" 
            placeholder="Take a note..." 
            className="w-full bg-transparent text-sm font-medium placeholder:text-muted-foreground/70 focus:outline-none"
          />
          <div className="flex items-center gap-2 text-muted-foreground/70">
            <button className="p-2 hover:bg-secondary rounded-full transition-colors" title="New List">
              <CheckSquare className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-full transition-colors" title="New Note with Drawing">
              <PenLine className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-full transition-colors" title="New Note with Image">
              <ImageIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {notes.map((note) => (
          <div 
            key={note.id} 
            className={`break-inside-avoid rounded-lg border border-border ${note.color} p-4 shadow-sm transition-shadow hover:shadow-md group relative`}
          >
            {/* Hover Actions (Top Right) */}
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="p-1.5 hover:bg-secondary rounded-full text-muted-foreground">
                  <Pin className="h-4 w-4" />
               </button>
            </div>

            {/* Image Content */}
            {note.image && (
              <div className="mb-3 -mx-4 -mt-4 bg-secondary/20 aspect-video flex items-center justify-center overflow-hidden rounded-t-lg">
                 {/* Placeholder for actual image */}
                 <Image className="h-8 w-8 text-muted-foreground/50" />
              </div>
            )}

            {/* Title */}
            {note.title && (
              <h3 className="mb-2 font-medium text-base leading-snug">{note.title}</h3>
            )}

            {/* Content */}
            {note.content && (
              <p className="whitespace-pre-wrap text-sm text-foreground/80 font-normal leading-relaxed mb-3">
                {note.content}
              </p>
            )}

            {/* Code Block */}
            {note.code && (
              <div className="mb-3 rounded bg-secondary/50 p-2 font-mono text-xs text-foreground/90 overflow-x-auto">
                <pre>{note.code}</pre>
              </div>
            )}

            {/* Tags */}
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {note.tags.map((tag, i) => (
                  <span key={i} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}

             {/* Hover Actions (Bottom) */}
            <div className="flex items-center justify-between pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="flex items-center gap-1 -ml-2">
                 <button className="p-2 hover:bg-secondary rounded-full text-muted-foreground/80" title="Remind me">
                    <Bell className="h-4 w-4" />
                 </button>
                 <button className="p-2 hover:bg-secondary rounded-full text-muted-foreground/80" title="Collaborator">
                    <UserPlus className="h-4 w-4" />
                 </button>
                 <button className="p-2 hover:bg-secondary rounded-full text-muted-foreground/80" title="Background options">
                    <Palette className="h-4 w-4" />
                 </button>
                 <button className="p-2 hover:bg-secondary rounded-full text-muted-foreground/80" title="Add image">
                    <ImageIcon className="h-4 w-4" />
                 </button>
                 <button className="p-2 hover:bg-secondary rounded-full text-muted-foreground/80" title="Archive">
                    <CheckSquare className="h-4 w-4" />
                 </button>
                 <button className="p-2 hover:bg-secondary rounded-full text-muted-foreground/80" title="More">
                    <MoreVertical className="h-4 w-4" />
                 </button>
               </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
