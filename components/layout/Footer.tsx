"use client";

import { Droplets, Github, Mail, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Droplets className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-lg">
                Cool<span className="text-primary">Decide</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Data-driven thermal analysis for next-generation cooling solutions.
              Built for engineers, by engineers.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard" className="hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/input" className="hover:text-foreground transition-colors">
                  Data Input
                </Link>
              </li>
              <li>
                <Link href="/manage" className="hover:text-foreground transition-colors">
                  Data Management
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Research Lab</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <a
                  href="https://mftel.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  MFTEL Lab Website
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Inha University</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>
              MFTEL Lab // Inha University // Prof. Il Woong Park
            </p>
            <p>
              Built with Next.js & Recharts
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
